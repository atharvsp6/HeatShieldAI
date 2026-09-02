"""
Forecast, Heatwave Events, Alerts, Advisories, Validation, and Dashboard API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from models.models import (
    Region, WeatherStation, Observation, Forecast,
    HeatwaveEvent, Alert, Advisory, ValidationResult, AuditLog,
)
from schemas.schemas import (
    ForecastResponse, ForecastGenerateRequest,
    HeatwaveEventResponse, AlertCreate, AlertResponse,
    AdvisoryGenerateRequest, AdvisoryResponse,
    ValidationResponse, DashboardResponse, AuditLogResponse,
)
from services.forecast_service import predict_temperature
from services.heatwave_classifier import classify_heatwave
from services.advisory_service import generate_all_advisories
from services.audit_service import log_action

router = APIRouter(prefix="/api", tags=["Core"])


# ─── Forecasts ────────────────────────────────────────────────────────────────

@router.get("/forecasts", response_model=List[ForecastResponse])
def get_forecasts(db: Session = Depends(get_db)):
    """Get all forecasts with region information."""
    forecasts = db.query(Forecast).order_by(Forecast.created_at.desc()).all()
    result = []
    for f in forecasts:
        region = db.query(Region).filter(Region.id == f.region_id).first()
        classification = classify_heatwave(
            region.region_type, region.normal_temp, f.predicted_temp
        ) if region else None
        result.append(ForecastResponse(
            id=f.id, region_id=f.region_id,
            region_name=region.name if region else None,
            predicted_temp=f.predicted_temp, confidence=f.confidence,
            model_name=f.model_name, model_version=f.model_version,
            forecast_date=f.forecast_date, created_at=f.created_at,
            severity=classification.severity if classification else None,
        ))
    return result


@router.post("/forecasts/generate", response_model=List[ForecastResponse])
def generate_forecasts(
    request: ForecastGenerateRequest = ForecastGenerateRequest(),
    db: Session = Depends(get_db),
):
    """Generate new forecasts using the ML model."""
    regions = db.query(Region).all()
    if request.region_ids:
        regions = [r for r in regions if r.id in request.region_ids]

    results = []
    now = datetime.utcnow()

    for region in regions:
        # Get latest observation for context
        latest_obs = db.query(Observation).join(WeatherStation).filter(
            WeatherStation.region_id == region.id
        ).order_by(Observation.timestamp.desc()).first()

        humidity = latest_obs.humidity if latest_obs else 50.0
        prev_temp = latest_obs.temperature if latest_obs else region.normal_temp

        prediction = predict_temperature(
            latitude=region.latitude,
            longitude=region.longitude,
            normal_temp=region.normal_temp,
            current_humidity=humidity,
            prev_day_temp=prev_temp,
        )

        forecast = Forecast(
            region_id=region.id,
            predicted_temp=prediction["predicted_temp"],
            confidence=prediction["confidence"],
            model_name=prediction["model_name"],
            model_version=prediction["model_version"],
            forecast_date=now + timedelta(days=1),
            created_at=now,
        )
        db.add(forecast)
        db.flush()

        # Run classification
        classification = classify_heatwave(
            region.region_type, region.normal_temp, prediction["predicted_temp"]
        )

        # Create heatwave event if detected
        if classification.severity != "NORMAL":
            existing = db.query(HeatwaveEvent).filter(
                HeatwaveEvent.region_id == region.id,
                HeatwaveEvent.is_active == True,
            ).first()
            if not existing:
                event = HeatwaveEvent(
                    region_id=region.id,
                    severity=classification.severity,
                    predicted_temp=prediction["predicted_temp"],
                    normal_temp=region.normal_temp,
                    departure=classification.departure,
                    start_date=now,
                    is_active=True,
                )
                db.add(event)

        results.append(ForecastResponse(
            id=forecast.id, region_id=region.id,
            region_name=region.name,
            predicted_temp=prediction["predicted_temp"],
            confidence=prediction["confidence"],
            model_name=prediction["model_name"],
            model_version=prediction["model_version"],
            forecast_date=forecast.forecast_date,
            created_at=forecast.created_at,
            severity=classification.severity,
        ))

    db.commit()
    log_action(db, "system", "GENERATE_FORECAST", "forecast",
               f"Generated forecasts for {len(results)} regions")
    return results


# ─── Heatwave Events ─────────────────────────────────────────────────────────

@router.get("/heatwaves", response_model=List[HeatwaveEventResponse])
def get_heatwave_events(active_only: bool = False, db: Session = Depends(get_db)):
    """Get all heatwave events."""
    query = db.query(HeatwaveEvent)
    if active_only:
        query = query.filter(HeatwaveEvent.is_active == True)
    events = query.order_by(HeatwaveEvent.created_at.desc()).all()
    result = []
    for e in events:
        region = db.query(Region).filter(Region.id == e.region_id).first()
        result.append(HeatwaveEventResponse(
            id=e.id, region_id=e.region_id,
            region_name=region.name if region else None,
            severity=e.severity, predicted_temp=e.predicted_temp,
            normal_temp=e.normal_temp, departure=e.departure,
            start_date=e.start_date, end_date=e.end_date,
            is_active=e.is_active, created_at=e.created_at,
        ))
    return result


# ─── Alerts ──────────────────────────────────────────────────────────────────

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all alerts."""
    query = db.query(Alert)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    alerts = query.order_by(Alert.created_at.desc()).all()
    result = []
    for a in alerts:
        region = db.query(Region).filter(Region.id == a.region_id).first()
        result.append(AlertResponse(
            id=a.id, region_id=a.region_id,
            region_name=region.name if region else None,
            severity=a.severity, title=a.title, message=a.message,
            temperature=a.temperature, status=a.status,
            created_at=a.created_at, resolved_at=a.resolved_at,
        ))
    return result


@router.post("/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(alert_data: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert."""
    region = db.query(Region).filter(Region.id == alert_data.region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    alert = Alert(
        region_id=alert_data.region_id,
        severity=alert_data.severity,
        title=alert_data.title,
        message=alert_data.message,
        temperature=alert_data.temperature,
        status="ACTIVE",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    log_action(db, "system", "CREATE_ALERT", "alert",
               f"Alert created: {alert.title}")

    return AlertResponse(
        id=alert.id, region_id=alert.region_id,
        region_name=region.name, severity=alert.severity,
        title=alert.title, message=alert.message,
        temperature=alert.temperature, status=alert.status,
        created_at=alert.created_at, resolved_at=alert.resolved_at,
    )


# ─── Advisories ──────────────────────────────────────────────────────────────

@router.get("/advisories", response_model=List[AdvisoryResponse])
def get_advisories(audience: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all advisories."""
    query = db.query(Advisory)
    if audience:
        query = query.filter(Advisory.audience == audience)
    advisories = query.order_by(Advisory.created_at.desc()).all()
    return [AdvisoryResponse.model_validate(a) for a in advisories]


@router.post("/advisories/generate", response_model=List[AdvisoryResponse])
def generate_advisories(request: AdvisoryGenerateRequest, db: Session = Depends(get_db)):
    """Generate advisories for a region."""
    advisories_data = generate_all_advisories(
        request.region_name, request.severity, request.temperature
    )
    result = []
    for adv_data in advisories_data:
        advisory = Advisory(
            region_name=adv_data["region_name"],
            severity=adv_data["severity"],
            audience=adv_data["audience"],
            title=adv_data["title"],
            content=adv_data["content"],
            status="DRAFT",
        )
        db.add(advisory)
        db.flush()
        result.append(AdvisoryResponse.model_validate(advisory))

    db.commit()
    log_action(db, "system", "GENERATE_ADVISORY", "advisory",
               f"Generated {len(result)} advisories for {request.region_name}")
    return result


@router.post("/advisories/{advisory_id}/approve", response_model=AdvisoryResponse)
def approve_advisory(advisory_id: int, db: Session = Depends(get_db)):
    """Approve an advisory."""
    advisory = db.query(Advisory).filter(Advisory.id == advisory_id).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")

    advisory.status = "APPROVED"
    advisory.approved_at = datetime.utcnow()
    advisory.approved_by = "Admin"
    db.commit()
    db.refresh(advisory)

    log_action(db, "admin", "APPROVE_ADVISORY", "advisory",
               f"Approved advisory: {advisory.title}")

    return AdvisoryResponse.model_validate(advisory)


# ─── Validation ──────────────────────────────────────────────────────────────

@router.get("/validation", response_model=List[ValidationResponse])
def get_validation_results(db: Session = Depends(get_db)):
    """Get forecast validation results."""
    results = db.query(ValidationResult).order_by(ValidationResult.created_at.desc()).all()
    return [ValidationResponse.model_validate(r) for r in results]


# ─── Dashboard ───────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard summary data."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # Current average temperature from latest observations per station
    stations = db.query(WeatherStation).all()
    temps = []
    for station in stations:
        latest = db.query(Observation).filter(
            Observation.station_id == station.id
        ).order_by(Observation.timestamp.desc()).first()
        if latest:
            temps.append(latest.temperature)
    current_avg_temp = round(sum(temps) / len(temps), 1) if temps else 0

    # Predicted max temp from latest forecasts
    latest_forecasts = db.query(Forecast).order_by(Forecast.created_at.desc()).limit(8).all()
    predicted_max = max((f.predicted_temp for f in latest_forecasts), default=0)

    # Active heatwave regions
    active_heatwaves = db.query(HeatwaveEvent).filter(HeatwaveEvent.is_active == True).count()

    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").count()

    # Station count
    station_count = db.query(WeatherStation).count()

    # Total observations
    total_obs = db.query(Observation).count()

    # Recent alerts
    recent_alerts_db = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
    recent_alerts = []
    for a in recent_alerts_db:
        region = db.query(Region).filter(Region.id == a.region_id).first()
        recent_alerts.append(AlertResponse(
            id=a.id, region_id=a.region_id,
            region_name=region.name if region else None,
            severity=a.severity, title=a.title, message=a.message,
            temperature=a.temperature, status=a.status,
            created_at=a.created_at, resolved_at=a.resolved_at,
        ))

    # Temperature trends (last 7 days, aggregated by day)
    trends = []
    for days_back in range(6, -1, -1):
        day = now - timedelta(days=days_back)
        day_start = day.replace(hour=0, minute=0, second=0)
        day_end = day.replace(hour=23, minute=59, second=59)
        avg = db.query(func.avg(Observation.temperature)).filter(
            Observation.timestamp >= day_start,
            Observation.timestamp <= day_end,
        ).scalar()
        max_t = db.query(func.max(Observation.temperature)).filter(
            Observation.timestamp >= day_start,
            Observation.timestamp <= day_end,
        ).scalar()
        min_t = db.query(func.min(Observation.temperature)).filter(
            Observation.timestamp >= day_start,
            Observation.timestamp <= day_end,
        ).scalar()
        trends.append({
            "date": day.strftime("%b %d"),
            "avg_temp": round(avg, 1) if avg else None,
            "max_temp": round(max_t, 1) if max_t else None,
            "min_temp": round(min_t, 1) if min_t else None,
        })

    # Heatwave regions for map
    heatwave_regions = []
    regions = db.query(Region).all()
    for region in regions:
        latest_forecast = db.query(Forecast).filter(
            Forecast.region_id == region.id
        ).order_by(Forecast.created_at.desc()).first()

        if latest_forecast:
            classification = classify_heatwave(
                region.region_type, region.normal_temp, latest_forecast.predicted_temp
            )
        else:
            classification = None

        heatwave_regions.append({
            "id": region.id,
            "name": region.name,
            "latitude": region.latitude,
            "longitude": region.longitude,
            "normal_temp": region.normal_temp,
            "predicted_temp": latest_forecast.predicted_temp if latest_forecast else None,
            "severity": classification.severity if classification else "NORMAL",
            "departure": classification.departure if classification else 0,
        })

    # Forecast summary
    forecast_summary = []
    for f in latest_forecasts:
        region = db.query(Region).filter(Region.id == f.region_id).first()
        if region:
            classification = classify_heatwave(
                region.region_type, region.normal_temp, f.predicted_temp
            )
            forecast_summary.append({
                "region": region.name,
                "predicted_temp": f.predicted_temp,
                "normal_temp": region.normal_temp,
                "departure": classification.departure,
                "severity": classification.severity,
                "confidence": f.confidence,
            })

    return DashboardResponse(
        current_avg_temp=current_avg_temp,
        predicted_max_temp=round(predicted_max, 1),
        active_heatwave_regions=active_heatwaves,
        active_alerts=active_alerts,
        station_count=station_count,
        total_observations=total_obs,
        recent_alerts=recent_alerts,
        temperature_trends=trends,
        heatwave_regions=heatwave_regions,
        forecast_summary=forecast_summary,
    )


# ─── Audit Logs ──────────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Get audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [AuditLogResponse.model_validate(log) for log in logs]
