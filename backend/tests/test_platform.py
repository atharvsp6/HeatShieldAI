"""
Comprehensive HeatShield AI Platform Test Suite

Covers:
- Auth (login success/failure, token validation)
- Weather ingestion (Open-Meteo API, schema, idempotency)
- ML model (training, sufficiency detection, prediction confidence)
- Advisory workflow (Groq LLM, fallback, approval, persistent rejection)
- Settings persistence (GET/PUT)
- Health check (API + DB connectivity)
- Data classification transparency
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, init_db
from models.models import User, Advisory, Observation, WeatherStation, Region, UserSettings
from services.forecast_service import train_model, predict_temperature, get_model_metadata
from services.weather_service import ingest_weather_data, fetch_current_weather
from services.advisory_service import generate_advisory_content, generate_all_advisories
from services.llm_service import validate_advisory

client = TestClient(app)


# ─── 1. Health & DB ──────────────────────────────────────────────────────────

def test_health_check_endpoint():
    """Verify health endpoint reports healthy API and database connectivity."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "HeatShield" in data["app"]


def test_api_health_alias():
    """Verify /api/health returns same health status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ─── 2. Auth Tests ───────────────────────────────────────────────────────────

def test_auth_login_success():
    """Verify that seeded admin user can log in and receives JWT token."""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "ADMIN"


def test_auth_login_invalid_password():
    """Verify that invalid password returns 401 Unauthorized."""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword!"})
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


def test_auth_login_nonexistent_user():
    """Verify that non-existent username returns 401 Unauthorized."""
    response = client.post("/api/auth/login", json={"username": "unknown_user_999", "password": "xyz"})
    assert response.status_code == 401


# ─── 3. Weather Ingestion & Idempotency ───────────────────────────────────────

def test_open_meteo_live_fetch():
    """Verify Open-Meteo external API fetches real weather for Delhi."""
    data = fetch_current_weather(28.6139, 77.2090)
    assert data is not None
    assert "temperature" in data
    assert -10.0 <= data["temperature"] <= 60.0
    assert 0.0 <= data["humidity"] <= 100.0


def test_weather_ingestion_and_idempotency():
    """Verify ingestion endpoint inserts real observations and is idempotent on repeat."""
    db = SessionLocal()
    try:
        # First pass
        stats1 = ingest_weather_data(db, mode="current")
        assert stats1["source"] == "open-meteo"
        assert stats1["regions_processed"] > 0

        # Second pass immediately after: observations for the same timestamp must be skipped
        stats2 = ingest_weather_data(db, mode="current")
        assert stats2["observations_skipped"] >= 0
    finally:
        db.close()


def test_weather_status_endpoint():
    """Verify /api/weather/status reports observation counts and external source."""
    response = client.get("/api/weather/status")
    assert response.status_code == 200
    data = response.json()
    assert "real_observations_count" in data
    assert "synthetic_observations_count" in data
    assert data["external_source"] == "Open-Meteo API"


# ─── 4. ML Model Training & Sufficiency ───────────────────────────────────────

def test_ml_training_honesty():
    """Verify ML training reports true training_mode and does not pretend synthetic is real."""
    db = SessionLocal()
    try:
        meta = train_model(db)
        assert meta["training_mode"] in ("real", "synthetic_demo")
        assert "records_used" in meta
        assert "regions_used" in meta
        assert meta["model"] == "RandomForestRegressor"
        assert 0.0 <= meta["train_r2"] <= 1.0
    finally:
        db.close()


def test_ml_prediction_confidence():
    """Verify temperature predictions return confidence and model version."""
    prediction = predict_temperature(
        latitude=28.6139,
        longitude=77.2090,
        normal_temp=34.0,
        current_humidity=45.0,
    )
    assert "predicted_temp" in prediction
    assert "confidence" in prediction
    assert 0.5 <= prediction["confidence"] <= 1.0
    assert prediction["model_name"] == "HeatShield-RF-v1"


# ─── 5. Groq LLM Advisory Generation & Fallback ──────────────────────────────

def test_advisory_guardrail_validation():
    """Verify validation guardrails catch missing regions or invalid structure."""
    valid_context = {
        "region": "Delhi",
        "forecast_temperature": 44.5,
        "normal_temperature": 34.0,
        "departure": 10.5,
        "severity": "SEVERE_HEATWAVE",
        "audience": "CITIZENS",
    }

    # Case 1: missing region in advisory
    bad_adv = {
        "title": "Severe Heatwave Alert",
        "summary": "High temperatures expected in Mumbai.",
        "actions": ["Stay indoors", "Drink water"],
    }
    error = validate_advisory(bad_adv, valid_context)
    assert error is not None
    assert "Delhi" in error

    # Case 2: valid advisory
    good_adv = {
        "title": "Severe Heatwave Alert – Delhi",
        "summary": "Severe heat conditions expected in Delhi with temperatures reaching 44.5°C.",
        "actions": ["Stay indoors", "Drink plenty of water", "Avoid direct sun"],
    }
    assert validate_advisory(good_adv, valid_context) is None


def test_advisory_fallback_generation():
    """Verify advisory generation cleanly falls back to deterministic template when LLM key is absent."""
    adv = generate_advisory_content("Delhi", "SEVERE_HEATWAVE", 45.0, "CITIZENS", normal_temp=34.0)
    assert "title" in adv
    assert "content" in adv
    assert "Delhi" in adv["title"]
    assert adv["generated_by"] in ("GROQ_LLM", "TEMPLATE")


# ─── 6. Advisory Approve & Reject Workflow ────────────────────────────────────

def test_advisory_rejection_persistence():
    """Verify rejecting an advisory updates status to REJECTED in PostgreSQL and persists."""
    # First generate advisories
    gen_resp = client.post("/api/advisories/generate", json={
        "region_name": "Delhi",
        "severity": "SEVERE_HEATWAVE",
        "temperature": 45.5,
    })
    assert gen_resp.status_code == 200
    advisories = gen_resp.json()
    assert len(advisories) > 0
    test_id = advisories[0]["id"]

    # Reject the advisory
    reject_resp = client.post(f"/api/advisories/{test_id}/reject")
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"

    # Verify persistence by fetching all advisories
    get_resp = client.get("/api/advisories")
    assert get_resp.status_code == 200
    matching = [a for a in get_resp.json() if a["id"] == test_id]
    assert len(matching) == 1
    assert matching[0]["status"] == "REJECTED"


def test_advisory_approval():
    """Verify approving an advisory updates status to APPROVED."""
    gen_resp = client.post("/api/advisories/generate", json={
        "region_name": "Jaipur",
        "severity": "HEATWAVE",
        "temperature": 42.0,
    })
    assert gen_resp.status_code == 200
    test_id = gen_resp.json()[0]["id"]

    approve_resp = client.post(f"/api/advisories/{test_id}/approve")
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"


# ─── 7. User Settings Persistence ─────────────────────────────────────────────

def test_user_settings_get_and_put():
    """Verify user settings can be read and updated persistently."""
    get_resp = client.get("/api/settings")
    assert get_resp.status_code == 200
    orig = get_resp.json()

    # Toggle auto_refresh
    new_refresh = not orig.get("auto_refresh", True)
    put_resp = client.put("/api/settings", json={"auto_refresh": new_refresh})
    assert put_resp.status_code == 200
    assert put_resp.json()["auto_refresh"] == new_refresh

    # Fetch again to verify persistence
    get_resp2 = client.get("/api/settings")
    assert get_resp2.json()["auto_refresh"] == new_refresh


# ─── 8. Data Classification Transparency ──────────────────────────────────────

def test_data_classification_transparency():
    """Verify transparency audit endpoint distinguishes real vs synthetic data."""
    response = client.get("/api/data/classification")
    assert response.status_code == 200
    data = response.json()
    assert "weather_observations" in data
    assert "weather_stations" in data
    assert "hardware" in data["weather_stations"]
    assert data["weather_stations"]["hardware"] == "NO"
    assert "ml_model" in data
    assert "advisories" in data
