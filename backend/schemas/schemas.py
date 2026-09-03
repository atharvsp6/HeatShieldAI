from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)



class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Region ──────────────────────────────────────────────────────────────────

class RegionResponse(BaseModel):
    id: int
    name: str
    state: str
    latitude: float
    longitude: float
    region_type: str
    normal_temp: float

    class Config:
        from_attributes = True


# ─── Weather Station ────────────────────────────────────────────────────────

class StationResponse(BaseModel):
    id: int
    station_id: str
    name: str
    region_id: int
    region_name: Optional[str] = None
    latitude: float
    longitude: float
    status: str
    installed_date: Optional[datetime] = None
    current_temp: Optional[float] = None
    current_humidity: Optional[float] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Observation ─────────────────────────────────────────────────────────────

class ObservationCreate(BaseModel):
    station_id: int = Field(..., gt=0)
    temperature: float = Field(..., ge=-50, le=65)
    humidity: float = Field(..., ge=0, le=100)
    wind_speed: Optional[float] = Field(None, ge=0)
    timestamp: Optional[datetime] = None


class ObservationResponse(BaseModel):
    id: int
    station_id: int
    station_name: Optional[str] = None
    region_name: Optional[str] = None
    temperature: float
    humidity: float
    wind_speed: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Forecast ────────────────────────────────────────────────────────────────

class ForecastResponse(BaseModel):
    id: int
    region_id: int
    region_name: Optional[str] = None
    predicted_temp: float
    confidence: float
    model_name: str
    model_version: str
    forecast_date: datetime
    created_at: datetime
    severity: Optional[str] = None

    class Config:
        from_attributes = True
        protected_namespaces = ()


class ForecastGenerateRequest(BaseModel):
    region_ids: Optional[List[int]] = None  # None means all regions


# ─── Heatwave Event ─────────────────────────────────────────────────────────

class HeatwaveEventResponse(BaseModel):
    id: int
    region_id: int
    region_name: Optional[str] = None
    severity: str
    predicted_temp: float
    normal_temp: float
    departure: float
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Alert ───────────────────────────────────────────────────────────────────

class AlertCreate(BaseModel):
    region_id: int = Field(..., gt=0)
    severity: str
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    temperature: float


class AlertResponse(BaseModel):
    id: int
    region_id: int
    region_name: Optional[str] = None
    severity: str
    title: str
    message: str
    temperature: float
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Advisory ────────────────────────────────────────────────────────────────

class AdvisoryGenerateRequest(BaseModel):
    region_name: str
    severity: str
    temperature: float


class AdvisoryResponse(BaseModel):
    id: int
    region_name: str
    severity: str
    audience: str
    title: str
    content: str
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejected_by: Optional[str] = None
    generated_by: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Validation ──────────────────────────────────────────────────────────────

class ValidationResponse(BaseModel):
    id: int
    region_name: str
    predicted_temp: float
    actual_temp: float
    error: float
    abs_error: float
    forecast_date: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    current_avg_temp: float
    predicted_max_temp: float
    active_heatwave_regions: int
    active_alerts: int
    station_count: int
    total_observations: int
    recent_alerts: List[AlertResponse]
    temperature_trends: list
    heatwave_regions: list
    forecast_summary: list


# ─── Audit Log ───────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    user: str
    action: str
    resource: str
    detail: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Weather Ingestion & ML ───────────────────────────────────────────────────

class WeatherIngestResponse(BaseModel):
    source: str
    mode: str
    regions_processed: int
    observations_inserted: int
    observations_skipped: int
    errors: List[str] = []
    ingested_at: str


class MLTrainResponse(BaseModel):
    training_mode: str
    records_used: int
    regions_used: int
    model: str
    train_r2: float
    test_r2: float
    mae: Optional[float] = None
    trained_at: str
    note: Optional[str] = None


# ─── User Settings ───────────────────────────────────────────────────────────

class UserSettingsResponse(BaseModel):
    temp_unit: str = "celsius"
    notifications_enabled: bool = True
    auto_refresh: bool = True
    alert_threshold: str = "HEATWAVE"
    digest_email: bool = False
    approval_required: bool = True
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    temp_unit: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    auto_refresh: Optional[bool] = None
    alert_threshold: Optional[str] = None
    digest_email: Optional[bool] = None
    approval_required: Optional[bool] = None

