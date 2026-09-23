"""
Real Weather Data Ingestion Service

Fetches current weather observations from the Open-Meteo API
(free, no API key required) for all configured regions.

Open-Meteo provides real meteorological data from national weather
services worldwide.
"""

import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"


def fetch_current_weather(latitude: float, longitude: float) -> Optional[Dict]:
    """
    Fetch current weather from Open-Meteo API for a given location.
    
    Returns dict with temperature, humidity, wind_speed, timestamp
    or None if the request fails.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "timezone": "UTC",
    }
    
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(OPEN_METEO_BASE, params=params)
            response.raise_for_status()
            data = response.json()
        
        current = data.get("current", {})
        if not current:
            logger.warning(f"No current data returned for ({latitude}, {longitude})")
            return None
        
        temperature = current.get("temperature_2m")
        humidity = current.get("relative_humidity_2m")
        wind_speed = current.get("wind_speed_10m")
        time_str = current.get("time")
        
        if temperature is None:
            logger.warning(f"No temperature in response for ({latitude}, {longitude})")
            return None
        
        # Parse the ISO timestamp from Open-Meteo
        timestamp = datetime.fromisoformat(time_str) if time_str else datetime.utcnow()
        
        return {
            "temperature": round(float(temperature), 1),
            "humidity": round(float(humidity), 1) if humidity is not None else 50.0,
            "wind_speed": round(float(wind_speed), 1) if wind_speed is not None else None,
            "timestamp": timestamp,
        }
    except httpx.HTTPStatusError as e:
        logger.error(f"Open-Meteo HTTP error for ({latitude}, {longitude}): {e.response.status_code}")
        return None
    except httpx.RequestError as e:
        logger.error(f"Open-Meteo request failed for ({latitude}, {longitude}): {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching weather for ({latitude}, {longitude}): {e}")
        return None


def fetch_recent_weather(latitude: float, longitude: float, days: int = 3) -> List[Dict]:
    """
    Fetch recent hourly weather data from Open-Meteo for the past N days.
    Returns a list of observation dicts.
    """
    end_date = datetime.utcnow().strftime("%Y-%m-%d")
    start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "start_date": start_date,
        "end_date": end_date,
        "timezone": "UTC",
    }
    
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(OPEN_METEO_BASE, params=params)
            response.raise_for_status()
            data = response.json()
        
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        humidities = hourly.get("relative_humidity_2m", [])
        winds = hourly.get("wind_speed_10m", [])
        
        results = []
        for i, t in enumerate(times):
            temp = temps[i] if i < len(temps) else None
            if temp is None:
                continue
            
            results.append({
                "temperature": round(float(temp), 1),
                "humidity": round(float(humidities[i]), 1) if i < len(humidities) and humidities[i] is not None else 50.0,
                "wind_speed": round(float(winds[i]), 1) if i < len(winds) and winds[i] is not None else None,
                "timestamp": datetime.fromisoformat(t),
            })
        
        return results
    except Exception as e:
        logger.error(f"Failed to fetch recent weather for ({latitude}, {longitude}): {e}")
        return []


def ingest_weather_data(db: Session, mode: str = "current") -> Dict:
    """
    Ingest real weather data from Open-Meteo for all regions.
    
    Args:
        db: Database session
        mode: "current" for latest observation only, "recent" for past 3 days hourly
    
    Returns:
        Ingestion statistics dict
    """
    from models.models import Region, WeatherStation, Observation
    
    regions = db.query(Region).all()
    if not regions:
        return {"source": "open-meteo", "error": "No regions configured", "regions_processed": 0}
    
    stats = {
        "source": "open-meteo",
        "mode": mode,
        "regions_processed": 0,
        "observations_inserted": 0,
        "observations_skipped": 0,
        "errors": [],
        "ingested_at": datetime.utcnow().isoformat(),
    }
    
    for region in regions:
        logger.info(f"Ingesting weather for {region.name} ({region.latitude}, {region.longitude})")
        
        # Get the first active station for this region
        station = db.query(WeatherStation).filter(
            WeatherStation.region_id == region.id,
            WeatherStation.status == "ACTIVE",
        ).first()
        
        if not station:
            stats["errors"].append(f"No active station for {region.name}")
            continue
        
        if mode == "recent":
            observations_data = fetch_recent_weather(region.latitude, region.longitude, days=3)
        else:
            current = fetch_current_weather(region.latitude, region.longitude)
            observations_data = [current] if current else []
        
        if not observations_data:
            stats["errors"].append(f"No data returned for {region.name}")
            continue
        
        stats["regions_processed"] += 1
        
        for obs_data in observations_data:
            # Idempotency check: skip if observation already exists for this station+timestamp
            existing = db.query(Observation).filter(
                Observation.station_id == station.id,
                Observation.timestamp == obs_data["timestamp"],
                Observation.data_source == "OPEN_METEO",
            ).first()
            
            if existing:
                stats["observations_skipped"] += 1
                continue
            
            obs = Observation(
                station_id=station.id,
                temperature=obs_data["temperature"],
                humidity=obs_data["humidity"],
                wind_speed=obs_data["wind_speed"],
                timestamp=obs_data["timestamp"],
                data_source="OPEN_METEO",
            )
            db.add(obs)
            stats["observations_inserted"] += 1
        
        db.flush()
    
    db.commit()
    logger.info(f"Weather ingestion complete: {stats['observations_inserted']} inserted, "
                f"{stats['observations_skipped']} skipped across {stats['regions_processed']} regions")
    
    return stats
