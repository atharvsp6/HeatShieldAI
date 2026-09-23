"""
Seed data for the HeatShield AI platform.

Creates realistic demo data so the dashboard is populated on first launch.
"""

import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import (
    User, Region, WeatherStation, Observation, Forecast,
    HeatwaveEvent, Alert, Advisory, ValidationResult, AuditLog,
)
from services.auth_service import hash_password
from services.heatwave_classifier import classify_heatwave
from services.forecast_service import predict_temperature, train_model
from services.advisory_service import generate_all_advisories
from services.simulator import generate_historical_observations


# ─── Region data ──────────────────────────────────────────────────────────────

REGIONS = [
    {"name": "Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "type": "PLAINS", "normal": 34.0},
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "type": "COASTAL", "normal": 32.0},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "type": "PLAINS", "normal": 33.0},
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "type": "DESERT", "normal": 36.0},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "type": "PLAINS", "normal": 35.0},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "type": "PLAINS", "normal": 35.5},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "type": "COASTAL", "normal": 33.0},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "type": "COASTAL", "normal": 33.5},
]

# Predefined conditions to ensure mix of normal/heatwave/severe regions
REGION_CONDITIONS = {
    "Delhi": "SEVERE_HEATWAVE",
    "Mumbai": "NORMAL",
    "Pune": "HEATWAVE",
    "Jaipur": "SEVERE_HEATWAVE",
    "Ahmedabad": "HEATWAVE",
    "Nagpur": "HEATWAVE",
    "Chennai": "NORMAL",
    "Kolkata": "NORMAL",
}


def seed_database(db: Session):
    """Seed the database with complete demo data."""
    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        return

    print("[SEED] Seeding database...")

    # 1. Users
    print("  -> Creating users...")
    users = [
        User(username="admin", email="admin@heatshield.ai", hashed_password=hash_password("admin123"),
             full_name="System Administrator", role="ADMIN"),
        User(username="meteorologist", email="met@heatshield.ai", hashed_password=hash_password("met123"),
             full_name="Dr. Priya Sharma", role="METEOROLOGIST"),
        User(username="authority", email="auth@heatshield.ai", hashed_password=hash_password("auth123"),
             full_name="District Collector", role="AUTHORITY"),
        User(username="citizen", email="citizen@heatshield.ai", hashed_password=hash_password("citizen123"),
             full_name="Rahul Kumar", role="CITIZEN"),
    ]
    db.add_all(users)
    db.flush()

    # 2. Regions
    print("  -> Creating regions...")
    region_objects = {}
    for r in REGIONS:
        region = Region(
            name=r["name"], state=r["state"],
            latitude=r["lat"], longitude=r["lon"],
            region_type=r["type"], normal_temp=r["normal"],
        )
        db.add(region)
        db.flush()
        region_objects[r["name"]] = region

    # 3. Weather Stations (2 per region)
    print("  -> Creating weather stations...")
    station_objects = {}
    station_counter = 1
    for r in REGIONS:
        region = region_objects[r["name"]]
        for i in range(2):
            station = WeatherStation(
                station_id=f"AWS-{r['name'][:3].upper()}-{str(station_counter).zfill(3)}",
                name=f"{r['name']} AWS-{i+1}",
                region_id=region.id,
                latitude=r["lat"] + np.random.uniform(-0.05, 0.05),
                longitude=r["lon"] + np.random.uniform(-0.05, 0.05),
                status="ACTIVE",
                installed_date=datetime.utcnow() - timedelta(days=365),
            )
            db.add(station)
            db.flush()
            if r["name"] not in station_objects:
                station_objects[r["name"]] = []
            station_objects[r["name"]].append(station)
            station_counter += 1

    # 4. Observations
    print("  -> Generating observations...")
    now = datetime.utcnow()
    for r in REGIONS:
        condition = REGION_CONDITIONS[r["name"]]
        is_heatwave = condition != "NORMAL"
        for station in station_objects[r["name"]]:
            observations = generate_historical_observations(
                station_latitude=station.latitude,
                station_longitude=station.longitude,
                normal_temp=r["normal"],
                days=7,
                readings_per_day=4,
                heatwave_probability=1.0 if is_heatwave else 0.0,
            )
            for obs_data in observations:
                obs = Observation(
                    station_id=station.id,
                    temperature=obs_data["temperature"],
                    humidity=obs_data["humidity"],
                    wind_speed=obs_data["wind_speed"],
                    timestamp=datetime.fromisoformat(obs_data["timestamp"]),
                )
                db.add(obs)

    db.flush()

    # 5. Train ML model & generate forecasts
    print("  -> Training ML model...")
    train_score, test_score = train_model()
    print(f"    Model trained: R² train={train_score}, test={test_score}")

    print("  -> Generating forecasts...")
    forecast_objects = {}
    for r in REGIONS:
        region = region_objects[r["name"]]
        condition = REGION_CONDITIONS[r["name"]]

        # Get latest observation for this region
        latest_obs = db.query(Observation).join(WeatherStation).filter(
            WeatherStation.region_id == region.id
        ).order_by(Observation.timestamp.desc()).first()

        humidity = latest_obs.humidity if latest_obs else 50.0
        prev_temp = latest_obs.temperature if latest_obs else r["normal"]

        prediction = predict_temperature(
            latitude=r["lat"],
            longitude=r["lon"],
            normal_temp=r["normal"],
            current_humidity=humidity,
            prev_day_temp=prev_temp,
        )

        # Adjust prediction to match desired condition for demo
        predicted_temp = prediction["predicted_temp"]
        if condition == "SEVERE_HEATWAVE":
            predicted_temp = r["normal"] + np.random.uniform(7, 12)
        elif condition == "HEATWAVE":
            predicted_temp = r["normal"] + np.random.uniform(4.5, 7)
        elif condition == "NORMAL":
            predicted_temp = r["normal"] + np.random.uniform(-2, 3)

        predicted_temp = round(predicted_temp, 1)

        forecast = Forecast(
            region_id=region.id,
            predicted_temp=predicted_temp,
            confidence=prediction["confidence"],
            model_name=prediction["model_name"],
            model_version=prediction["model_version"],
            forecast_date=now + timedelta(days=1),
            created_at=now,
        )
        db.add(forecast)
        db.flush()
        forecast_objects[r["name"]] = forecast

    # 6. Heatwave events via rule engine
    print("  -> Running heatwave classification...")
    for r in REGIONS:
        region = region_objects[r["name"]]
        forecast = forecast_objects[r["name"]]

        classification = classify_heatwave(
            region_type=r["type"],
            normal_temp=r["normal"],
            predicted_temp=forecast.predicted_temp,
        )

        if classification.severity != "NORMAL":
            event = HeatwaveEvent(
                region_id=region.id,
                severity=classification.severity,
                predicted_temp=forecast.predicted_temp,
                normal_temp=r["normal"],
                departure=classification.departure,
                start_date=now - timedelta(hours=np.random.randint(6, 48)),
                is_active=True,
                created_at=now,
            )
            db.add(event)

    db.flush()

    # 7. Alerts
    print("  -> Creating alerts...")
    for r in REGIONS:
        condition = REGION_CONDITIONS[r["name"]]
        if condition == "NORMAL":
            continue
        region = region_objects[r["name"]]
        forecast = forecast_objects[r["name"]]
        severity_label = "Severe Heatwave" if condition == "SEVERE_HEATWAVE" else "Heatwave"
        alert = Alert(
            region_id=region.id,
            severity=condition,
            title=f"{severity_label} Alert – {r['name']}",
            message=f"{severity_label} conditions detected in {r['name']}. "
                    f"Predicted temperature: {forecast.predicted_temp}°C, "
                    f"which is {round(forecast.predicted_temp - r['normal'], 1)}°C above normal.",
            temperature=forecast.predicted_temp,
            status="ACTIVE",
            created_at=now - timedelta(minutes=np.random.randint(10, 180)),
        )
        db.add(alert)

    db.flush()

    # 8. Advisories
    print("  -> Generating advisories...")
    for r in REGIONS:
        condition = REGION_CONDITIONS[r["name"]]
        if condition == "NORMAL":
            continue
        forecast = forecast_objects[r["name"]]
        advisories = generate_all_advisories(r["name"], condition, forecast.predicted_temp)
        for adv_data in advisories:
            status = "APPROVED" if np.random.random() > 0.4 else "DRAFT"
            advisory = Advisory(
                region_name=adv_data["region_name"],
                severity=adv_data["severity"],
                audience=adv_data["audience"],
                title=adv_data["title"],
                content=adv_data["content"],
                status=status,
                created_at=now - timedelta(minutes=np.random.randint(5, 120)),
                approved_at=now if status == "APPROVED" else None,
                approved_by="Dr. Priya Sharma" if status == "APPROVED" else None,
            )
            db.add(advisory)

    db.flush()

    # 9. Validation results
    print("  -> Creating validation results...")
    for r in REGIONS:
        forecast = forecast_objects[r["name"]]
        # Simulate actual observed temp close to prediction
        actual = forecast.predicted_temp + np.random.normal(0, 1.5)
        actual = round(actual, 1)
        error = round(forecast.predicted_temp - actual, 1)
        validation = ValidationResult(
            region_name=r["name"],
            predicted_temp=forecast.predicted_temp,
            actual_temp=actual,
            error=error,
            abs_error=abs(error),
            forecast_date=now,
            created_at=now,
        )
        db.add(validation)

    db.flush()

    # 10. Audit logs
    print("  -> Creating audit logs...")
    audit_entries = [
        ("admin", "SYSTEM_INIT", "system", "Platform initialized with seed data"),
        ("admin", "USER_CREATE", "user", "Created 4 demo users"),
        ("meteorologist", "LOGIN", "auth", "Dr. Priya Sharma logged in"),
        ("meteorologist", "GENERATE_FORECAST", "forecast", "Generated forecasts for all regions"),
        ("admin", "CREATE_ALERT", "alert", "Heatwave alerts created for affected regions"),
        ("meteorologist", "APPROVE_ADVISORY", "advisory", "Advisories approved for heatwave regions"),
    ]
    for user, action, resource, detail in audit_entries:
        log = AuditLog(
            user=user, action=action, resource=resource, detail=detail,
            timestamp=now - timedelta(minutes=np.random.randint(1, 300)),
        )
        db.add(log)

    db.commit()
    print("[OK] Database seeded successfully!")
    print(f"   - {len(REGIONS)} regions")
    print(f"   - {len(REGIONS) * 2} weather stations")
    print(f"   - {len(users)} users")
    print(f"   - Forecasts, alerts, and advisories created")
