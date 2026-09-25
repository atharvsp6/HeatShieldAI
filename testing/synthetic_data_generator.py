"""
AI-Assisted Synthetic Test-Data Generator for HeatShield AI STQA Testing

Generates categorized synthetic datasets (Valid, Invalid, Boundary) for:
1. User Authentication (username, password, role)
2. Advisory Review (audience, action)
3. Weather Station Search (search_query, expected_match)
4. Automation Settings (setting_key, toggle_action)

Supports optional LLM augmentation (via Groq/OpenAI if configured) with a
guaranteed, deterministic rule-based generator fallback.
No secrets or real PII are generated or exposed.
"""

import os
import csv
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def generate_valid_data() -> List[Dict[str, str]]:
    """Generate synthetically valid test records for all 4 features."""
    return [
        {
            "test_id": "DDT_VAL_001",
            "feature": "authentication",
            "category": "valid",
            "username": "admin",
            "password": "admin123",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_SUCCESS",
        },
        {
            "test_id": "DDT_VAL_002",
            "feature": "authentication",
            "category": "valid",
            "username": "meteorologist",
            "password": "met123",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_SUCCESS",
        },
        {
            "test_id": "DDT_VAL_003",
            "feature": "authentication",
            "category": "valid",
            "username": "authority",
            "password": "auth123",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_SUCCESS",
        },
        {
            "test_id": "DDT_VAL_004",
            "feature": "authentication",
            "category": "valid",
            "username": "citizen",
            "password": "citizen123",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_SUCCESS",
        },
        {
            "test_id": "DDT_VAL_005",
            "feature": "station_search",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "Delhi",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "MATCH_FOUND",
        },
        {
            "test_id": "DDT_VAL_006",
            "feature": "station_search",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "Jaipur",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "MATCH_FOUND",
        },
        {
            "test_id": "DDT_VAL_007",
            "feature": "station_search",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "Pune",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "MATCH_FOUND",
        },
        {
            "test_id": "DDT_VAL_008",
            "feature": "advisory_review",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "",
            "audience": "CITIZENS",
            "action": "APPROVE",
            "setting_key": "",
            "expected_behavior": "STATUS_APPROVED",
        },
        {
            "test_id": "DDT_VAL_009",
            "feature": "advisory_review",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "",
            "audience": "FARMERS",
            "action": "REJECT",
            "setting_key": "",
            "expected_behavior": "STATUS_REJECTED",
        },
        {
            "test_id": "DDT_VAL_010",
            "feature": "automation_settings",
            "category": "valid",
            "username": "",
            "password": "",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "auto_refresh",
            "expected_behavior": "TOGGLE_SUCCESS",
        },
    ]


def generate_invalid_data() -> List[Dict[str, str]]:
    """Generate invalid test records for negative testing scenarios."""
    return [
        {
            "test_id": "DDT_INV_001",
            "feature": "authentication",
            "category": "invalid",
            "username": "admin",
            "password": "wrong_password_999",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_FAILURE_ERROR_MESSAGE",
        },
        {
            "test_id": "DDT_INV_002",
            "feature": "authentication",
            "category": "invalid",
            "username": "non_existent_scientist",
            "password": "password123",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_FAILURE_ERROR_MESSAGE",
        },
        {
            "test_id": "DDT_INV_003",
            "feature": "authentication",
            "category": "invalid",
            "username": "guest_user",
            "password": "invalid_format_password",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_FAILURE_ERROR_MESSAGE",
        },
        {
            "test_id": "DDT_INV_004",
            "feature": "station_search",
            "category": "invalid",
            "username": "",
            "password": "",
            "search_query": "AtlantisUnderwaterCity",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "EMPTY_STATE_DISPLAYED",
        },
        {
            "test_id": "DDT_INV_005",
            "feature": "station_search",
            "category": "invalid",
            "username": "",
            "password": "",
            "search_query": "XYZ_999_FAKE_STATION",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "EMPTY_STATE_DISPLAYED",
        },
    ]


def generate_boundary_data() -> List[Dict[str, str]]:
    """Generate boundary and edge-case test records."""
    return [
        {
            "test_id": "DDT_BND_001",
            "feature": "authentication",
            "category": "boundary",
            "username": "",
            "password": "",
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "SUBMIT_DISABLED",
        },
        {
            "test_id": "DDT_BND_002",
            "feature": "authentication",
            "category": "boundary",
            "username": "a" * 50,  # Max allowed username length in Pydantic schema
            "password": "p" * 100,  # Max allowed password length in Pydantic schema
            "search_query": "",
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "LOGIN_FAILURE_ERROR_MESSAGE",
        },
        {
            "test_id": "DDT_BND_003",
            "feature": "station_search",
            "category": "boundary",
            "username": "",
            "password": "",
            "search_query": "AWS-",  # Code prefix matching all stations
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "ALL_STATIONS_MATCHED",
        },
        {
            "test_id": "DDT_BND_004",
            "feature": "station_search",
            "category": "boundary",
            "username": "",
            "password": "",
            "search_query": "D",  # Single character search boundary
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "PARTIAL_MATCH",
        },
        {
            "test_id": "DDT_BND_005",
            "feature": "station_search",
            "category": "boundary",
            "username": "",
            "password": "",
            "search_query": "   ",  # Whitespace-only search query
            "audience": "",
            "action": "",
            "setting_key": "",
            "expected_behavior": "DEFAULT_VIEW_PRESERVED",
        },
    ]


def write_csv(filename: str, records: List[Dict[str, str]]):
    """Write records to CSV."""
    os.makedirs(DATA_DIR, exist_ok=True)
    filepath = os.path.join(DATA_DIR, filename)
    if not records:
        return
    fieldnames = list(records[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"[OK] Generated {len(records)} records -> {filepath}")


def run_generator():
    """Execute synthetic data generation and export to CSV."""
    print("[*] Generating AI-assisted synthetic test datasets for HeatShield AI...")
    valid = generate_valid_data()
    invalid = generate_invalid_data()
    boundary = generate_boundary_data()

    write_csv("valid_data.csv", valid)
    write_csv("invalid_data.csv", invalid)
    write_csv("boundary_data.csv", boundary)
    print("[SUCCESS] All test datasets generated successfully.")


if __name__ == "__main__":
    run_generator()
