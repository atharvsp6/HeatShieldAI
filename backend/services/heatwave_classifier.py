"""
Heatwave Classification Rule Engine

Deterministic rule-based heatwave classifier independent of ML models.
Uses configurable thresholds based on IMD-like criteria.

Classification Rules:
- PLAINS: Heatwave if departure >= 4.5°C or actual >= 40°C;
          Severe if departure >= 6.5°C or actual >= 45°C
- COASTAL: Heatwave if departure >= 4.5°C or actual >= 37°C;
           Severe if departure >= 6.5°C or actual >= 41°C
- DESERT: Heatwave if departure >= 5.0°C or actual >= 46°C;
          Severe if departure >= 7.0°C or actual >= 48°C
- HILLY: Heatwave if departure >= 5.0°C or actual >= 35°C;
         Severe if departure >= 7.0°C or actual >= 39°C
"""

from dataclasses import dataclass
from typing import Dict


@dataclass
class HeatwaveThresholds:
    """Configurable thresholds for heatwave classification."""
    heatwave_departure: float
    severe_departure: float
    heatwave_absolute: float
    severe_absolute: float


# Configurable thresholds per region type - can be updated to exact IMD criteria
THRESHOLDS: Dict[str, HeatwaveThresholds] = {
    "PLAINS": HeatwaveThresholds(
        heatwave_departure=4.5,
        severe_departure=6.5,
        heatwave_absolute=40.0,
        severe_absolute=45.0,
    ),
    "COASTAL": HeatwaveThresholds(
        heatwave_departure=4.5,
        severe_departure=6.5,
        heatwave_absolute=37.0,
        severe_absolute=41.0,
    ),
    "DESERT": HeatwaveThresholds(
        heatwave_departure=5.0,
        severe_departure=7.0,
        heatwave_absolute=46.0,
        severe_absolute=48.0,
    ),
    "HILLY": HeatwaveThresholds(
        heatwave_departure=5.0,
        severe_departure=7.0,
        heatwave_absolute=35.0,
        severe_absolute=39.0,
    ),
}


@dataclass
class ClassificationResult:
    """Result from heatwave classification."""
    severity: str  # NORMAL, HEATWAVE, SEVERE_HEATWAVE
    region_type: str
    normal_temp: float
    predicted_temp: float
    departure: float
    thresholds_used: dict


def classify_heatwave(
    region_type: str,
    normal_temp: float,
    predicted_temp: float,
) -> ClassificationResult:
    """
    Classify heatwave severity based on deterministic rules.
    
    This function is independently callable and does NOT depend on any ML model.
    
    Args:
        region_type: Type of region (PLAINS, COASTAL, DESERT, HILLY)
        normal_temp: Normal/climatological temperature for the region
        predicted_temp: Predicted or observed temperature
    
    Returns:
        ClassificationResult with severity and metadata
    """
    region_type = region_type.upper()
    thresholds = THRESHOLDS.get(region_type, THRESHOLDS["PLAINS"])
    departure = predicted_temp - normal_temp

    severity = "NORMAL"

    # Check severe heatwave first (higher priority)
    if departure >= thresholds.severe_departure or predicted_temp >= thresholds.severe_absolute:
        severity = "SEVERE_HEATWAVE"
    elif departure >= thresholds.heatwave_departure or predicted_temp >= thresholds.heatwave_absolute:
        severity = "HEATWAVE"

    return ClassificationResult(
        severity=severity,
        region_type=region_type,
        normal_temp=normal_temp,
        predicted_temp=predicted_temp,
        departure=round(departure, 2),
        thresholds_used={
            "heatwave_departure": thresholds.heatwave_departure,
            "severe_departure": thresholds.severe_departure,
            "heatwave_absolute": thresholds.heatwave_absolute,
            "severe_absolute": thresholds.severe_absolute,
        },
    )


def get_thresholds(region_type: str = None) -> dict:
    """Get current thresholds, optionally for a specific region type."""
    if region_type:
        t = THRESHOLDS.get(region_type.upper(), THRESHOLDS["PLAINS"])
        return {region_type.upper(): t.__dict__}
    return {k: v.__dict__ for k, v in THRESHOLDS.items()}
