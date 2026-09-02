"""
Temperature Forecasting Service

Uses a RandomForestRegressor trained on synthetic historical data
to predict maximum temperatures for regions.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta
from typing import Tuple

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml_model.joblib")
MODEL_NAME = "HeatShield-RF-v1"
MODEL_VERSION = "1.0.0"

_model = None


def _generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic historical weather data for training.
    Features: month, day_of_year, latitude, longitude, normal_temp, humidity, prev_day_temp
    Target: max_temperature
    """
    np.random.seed(42)

    data = []
    for _ in range(n_samples):
        month = np.random.randint(1, 13)
        day_of_year = np.random.randint(1, 366)
        latitude = np.random.uniform(8.0, 37.0)  # India's lat range
        longitude = np.random.uniform(68.0, 97.0)  # India's lon range
        normal_temp = np.random.uniform(25.0, 40.0)

        # Seasonal component
        seasonal = 8 * np.sin(2 * np.pi * (day_of_year - 100) / 365)

        # Latitude effect (higher lat = more variation)
        lat_effect = -0.3 * (latitude - 20)

        humidity = np.random.uniform(20, 90)
        prev_day_temp = normal_temp + np.random.normal(0, 3)

        # Target: max temperature with realistic noise
        max_temp = (
            normal_temp
            + seasonal
            + lat_effect
            - 0.05 * humidity
            + 0.3 * (prev_day_temp - normal_temp)
            + np.random.normal(0, 2)
        )

        data.append({
            "month": month,
            "day_of_year": day_of_year,
            "latitude": latitude,
            "longitude": longitude,
            "normal_temp": normal_temp,
            "humidity": humidity,
            "prev_day_temp": prev_day_temp,
            "max_temperature": round(max_temp, 1),
        })

    return pd.DataFrame(data)


def train_model() -> Tuple[float, float]:
    """
    Train the forecasting model on synthetic data.
    Returns (train_score, test_score).
    """
    global _model

    df = _generate_synthetic_data()

    feature_cols = ["month", "day_of_year", "latitude", "longitude",
                    "normal_temp", "humidity", "prev_day_temp"]
    X = df[feature_cols]
    y = df["max_temperature"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    train_score = round(model.score(X_train, y_train), 4)
    test_score = round(model.score(X_test, y_test), 4)

    joblib.dump(model, MODEL_PATH)
    _model = model

    return train_score, test_score


def _get_model() -> RandomForestRegressor:
    """Load or train the model."""
    global _model
    if _model is not None:
        return _model
    if os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
        return _model
    train_model()
    return _model


def predict_temperature(
    latitude: float,
    longitude: float,
    normal_temp: float,
    current_humidity: float = 50.0,
    prev_day_temp: float = None,
    target_date: datetime = None,
) -> dict:
    """
    Predict maximum temperature for a location.
    
    Returns:
        dict with predicted_temp, confidence, model_name, model_version
    """
    model = _get_model()

    if target_date is None:
        target_date = datetime.utcnow() + timedelta(days=1)
    if prev_day_temp is None:
        prev_day_temp = normal_temp + np.random.normal(1.5, 1.0)

    features = np.array([[
        target_date.month,
        target_date.timetuple().tm_yday,
        latitude,
        longitude,
        normal_temp,
        current_humidity,
        prev_day_temp,
    ]])

    # Get prediction from all trees for confidence estimation
    predictions = np.array([tree.predict(features)[0] for tree in model.estimators_])
    predicted_temp = round(float(np.mean(predictions)), 1)
    std_dev = float(np.std(predictions))

    # Confidence: lower std = higher confidence (scale 0-1)
    confidence = round(max(0.5, min(0.99, 1.0 - (std_dev / 10.0))), 2)

    return {
        "predicted_temp": predicted_temp,
        "confidence": confidence,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "forecast_date": target_date.isoformat(),
    }
