import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database import Base
import enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    METEOROLOGIST = "METEOROLOGIST"
    AUTHORITY = "AUTHORITY"
    CITIZEN = "CITIZEN"


class RegionType(str, enum.Enum):
    COASTAL = "COASTAL"
    PLAINS = "PLAINS"
    DESERT = "DESERT"
    HILLY = "HILLY"


class StationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    MAINTENANCE = "MAINTENANCE"


class HeatwaveSeverity(str, enum.Enum):
    NORMAL = "NORMAL"
    HEATWAVE = "HEATWAVE"
    SEVERE_HEATWAVE = "SEVERE_HEATWAVE"


class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AdvisoryStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PUBLISHED = "PUBLISHED"


class AdvisoryAudience(str, enum.Enum):
    CITIZENS = "CITIZENS"
    FARMERS = "FARMERS"
    AUTHORITIES = "AUTHORITIES"
    HEALTHCARE = "HEALTHCARE"


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.CITIZEN.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region_type = Column(String(20), nullable=False)
    normal_temp = Column(Float, nullable=False)

    stations = relationship("WeatherStation", back_populates="region")
    forecasts = relationship("Forecast", back_populates="region")
    heatwave_events = relationship("HeatwaveEvent", back_populates="region")
    alerts = relationship("Alert", back_populates="region")


class WeatherStation(Base):
    __tablename__ = "weather_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default=StationStatus.ACTIVE.value)
    installed_date = Column(DateTime, default=datetime.datetime.utcnow)

    region = relationship("Region", back_populates="stations")
    observations = relationship("Observation", back_populates="station")


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("weather_stations.id"), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    data_source = Column(String(30), nullable=False, default="SYNTHETIC")

    station = relationship("WeatherStation", back_populates="observations")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    predicted_temp = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_name = Column(String(50), nullable=False, default="HeatShield-RF-v1")
    model_version = Column(String(20), nullable=False, default="1.0.0")
    forecast_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    region = relationship("Region", back_populates="forecasts")


class HeatwaveEvent(Base):
    __tablename__ = "heatwave_events"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    severity = Column(String(20), nullable=False)
    predicted_temp = Column(Float, nullable=False)
    normal_temp = Column(Float, nullable=False)
    departure = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    region = relationship("Region", back_populates="heatwave_events")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    temperature = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default=AlertStatus.ACTIVE.value)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    region = relationship("Region", back_populates="alerts")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    audience = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default=AdvisoryStatus.DRAFT.value)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String(100), nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    rejected_by = Column(String(100), nullable=True)
    generated_by = Column(String(30), nullable=True, default="TEMPLATE")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String(100), nullable=False)
    predicted_temp = Column(Float, nullable=False)
    actual_temp = Column(Float, nullable=False)
    error = Column(Float, nullable=False)
    abs_error = Column(Float, nullable=False)
    forecast_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)
    resource = Column(String(50), nullable=False)
    detail = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    temp_unit = Column(String(10), nullable=False, default="celsius")
    notifications_enabled = Column(Boolean, default=True)
    auto_refresh = Column(Boolean, default=True)
    alert_threshold = Column(String(20), nullable=False, default="HEATWAVE")
    digest_email = Column(Boolean, default=False)
    approval_required = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")
