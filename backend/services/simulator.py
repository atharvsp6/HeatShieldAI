"""
AWS (Automated Weather Station) Simulator

Generates realistic simulated weather observations without
requiring physical hardware.
"""

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict


def generate_observation(
    station_latitude: float,
    station_longitude: float,
    normal_temp: float,
    base_date: datetime = None,
    is_heatwave: bool = False,
) -> dict:
    """
    Generate a single realistic weather observation.
    
    Uses latitude, normal temperature, time of day, and seasonal patterns
    to create realistic temperature and humidity readings.
    """
    if base_date is None:
        base_date = datetime.utcnow()

    hour = base_date.hour
    day_of_year = base_date.timetuple().tm_yday

    # Diurnal temperature variation
    # Peak at ~14:00, min at ~05:00
    diurnal = 5 * np.sin(np.pi * (hour - 5) / 12) if 5 <= hour <= 17 else -3

    # Seasonal effect
    seasonal = 6 * np.sin(2 * np.pi * (day_of_year - 100) / 365)

    # Heatwave boost
    heatwave_boost = np.random.uniform(4, 10) if is_heatwave else 0

    # Random noise
    noise = np.random.normal(0, 1.5)

    temperature = round(normal_temp + diurnal + seasonal + heatwave_boost + noise, 1)

    # Humidity inversely correlated with temperature
    base_humidity = 60 - 0.8 * (temperature - normal_temp) + np.random.normal(0, 8)
    humidity = round(max(10, min(95, base_humidity)), 1)

    # Wind speed
    wind_speed = round(max(0, np.random.normal(12, 6)), 1)

    return {
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "timestamp": base_date.isoformat(),
    }


def generate_historical_observations(
    station_latitude: float,
    station_longitude: float,
    normal_temp: float,
    days: int = 7,
    readings_per_day: int = 4,
    heatwave_probability: float = 0.3,
) -> List[dict]:
    """
    Generate a series of historical observations for seeding.
    """
    observations = []
    base = datetime.utcnow() - timedelta(days=days)
    is_heatwave = np.random.random() < heatwave_probability

    for day in range(days):
        for reading in range(readings_per_day):
            hour = [6, 10, 14, 18][reading % 4]
            timestamp = base + timedelta(days=day, hours=hour)

            obs = generate_observation(
                station_latitude=station_latitude,
                station_longitude=station_longitude,
                normal_temp=normal_temp,
                base_date=timestamp,
                is_heatwave=is_heatwave,
            )
            observations.append(obs)

    return observations
