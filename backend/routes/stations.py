"""
Weather Stations and Observations API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models.models import WeatherStation, Observation, Region
from schemas.schemas import StationResponse, ObservationCreate, ObservationResponse
from services.audit_service import log_action

router = APIRouter(prefix="/api", tags=["Weather Stations"])


@router.get("/stations", response_model=List[StationResponse], status_code=status.HTTP_200_OK)
def get_stations(db: Session = Depends(get_db)):
    """Get all weather stations with latest readings."""
    stations = db.query(WeatherStation).all()
    result = []
    for s in stations:
        # Get region name
        region = db.query(Region).filter(Region.id == s.region_id).first()
        # Get latest observation
        latest = db.query(Observation).filter(
            Observation.station_id == s.id
        ).order_by(Observation.timestamp.desc()).first()

        result.append(StationResponse(
            id=s.id,
            station_id=s.station_id,
            name=s.name,
            region_id=s.region_id,
            region_name=region.name if region else None,
            latitude=s.latitude,
            longitude=s.longitude,
            status=s.status,
            installed_date=s.installed_date,
            current_temp=latest.temperature if latest else None,
            current_humidity=latest.humidity if latest else None,
            last_updated=latest.timestamp if latest else None,
        ))
    return result


@router.get("/stations/{station_id}", response_model=StationResponse, status_code=status.HTTP_200_OK)
def get_station(station_id: int, db: Session = Depends(get_db)):
    """Get a specific weather station."""
    s = db.query(WeatherStation).filter(WeatherStation.id == station_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Station not found")
    region = db.query(Region).filter(Region.id == s.region_id).first()
    latest = db.query(Observation).filter(
        Observation.station_id == s.id
    ).order_by(Observation.timestamp.desc()).first()
    return StationResponse(
        id=s.id, station_id=s.station_id, name=s.name,
        region_id=s.region_id, region_name=region.name if region else None,
        latitude=s.latitude, longitude=s.longitude, status=s.status,
        installed_date=s.installed_date,
        current_temp=latest.temperature if latest else None,
        current_humidity=latest.humidity if latest else None,
        last_updated=latest.timestamp if latest else None,
    )


@router.get("/observations", response_model=List[ObservationResponse], status_code=status.HTTP_200_OK)
def get_observations(
    station_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get observations, optionally filtered by station."""
    query = db.query(Observation)
    if station_id:
        query = query.filter(Observation.station_id == station_id)
    observations = query.order_by(Observation.timestamp.desc()).limit(limit).all()

    result = []
    for obs in observations:
        station = db.query(WeatherStation).filter(WeatherStation.id == obs.station_id).first()
        region = db.query(Region).filter(Region.id == station.region_id).first() if station else None
        result.append(ObservationResponse(
            id=obs.id,
            station_id=obs.station_id,
            station_name=station.name if station else None,
            region_name=region.name if region else None,
            temperature=obs.temperature,
            humidity=obs.humidity,
            wind_speed=obs.wind_speed,
            timestamp=obs.timestamp,
        ))
    return result


@router.post("/observations", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def create_observation(obs_data: ObservationCreate, db: Session = Depends(get_db)):
    """Create a new weather observation."""
    station = db.query(WeatherStation).filter(WeatherStation.id == obs_data.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    obs = Observation(
        station_id=obs_data.station_id,
        temperature=obs_data.temperature,
        humidity=obs_data.humidity,
        wind_speed=obs_data.wind_speed,
        timestamp=obs_data.timestamp or datetime.utcnow(),
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    log_action(db, "system", "CREATE_OBSERVATION", "observation",
               f"New observation: {obs.temperature}°C at station {station.name}")

    region = db.query(Region).filter(Region.id == station.region_id).first()
    return ObservationResponse(
        id=obs.id, station_id=obs.station_id,
        station_name=station.name,
        region_name=region.name if region else None,
        temperature=obs.temperature, humidity=obs.humidity,
        wind_speed=obs.wind_speed, timestamp=obs.timestamp,
    )
