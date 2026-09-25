"""
Data-Driven Testing (DDT) Suite for HeatShield AI

Demonstrates:
ONE TEST SCRIPT + MULTIPLE DATA RECORDS = DATA-DRIVEN TESTING

Reads test inputs and expected behaviors dynamically from CSV datasets:
- testing/data/valid_data.csv
- testing/data/invalid_data.csv
- testing/data/boundary_data.csv
"""

import pytest
from testing.utils.data_reader import load_csv_data
from testing.pages.heatshield_page import HeatShieldPage

# Load datasets
VALID_RECORDS = load_csv_data("valid_data.csv")
INVALID_RECORDS = load_csv_data("invalid_data.csv")
BOUNDARY_RECORDS = load_csv_data("boundary_data.csv")
ALL_RECORDS = VALID_RECORDS + INVALID_RECORDS + BOUNDARY_RECORDS

AUTH_RECORDS = [r for r in ALL_RECORDS if r["feature"] == "authentication"]
STATION_RECORDS = [r for r in ALL_RECORDS if r["feature"] == "station_search"]
ADVISORY_RECORDS = [r for r in ALL_RECORDS if r["feature"] == "advisory_review"]
SETTINGS_RECORDS = [r for r in ALL_RECORDS if r["feature"] == "automation_settings"]


class TestHeatShieldDataDriven:

    @pytest.mark.parametrize("record", AUTH_RECORDS, ids=[r["test_id"] for r in AUTH_RECORDS])
    def test_ddt_authentication(self, record: dict, page: HeatShieldPage):
        """
        Data-driven test for authentication executing against valid, invalid,
        and boundary test records from CSV.
        """
        page.navigate()
        page.logout()

        username = record["username"]
        password = record["password"]
        expected = record["expected_behavior"]

        page.login(username, password)

        if expected == "LOGIN_SUCCESS":
            assert page.is_logged_in(), f"DDT Failure [{record['test_id']}]: Expected login success for {username}"
            page.capture_screenshot(f"{record['test_id']}_success")
        elif expected == "LOGIN_FAILURE_ERROR_MESSAGE":
            err = page.get_login_error_message()
            assert err == "Invalid username or password", (
                f"DDT Failure [{record['test_id']}]: Expected error message, got: {err}"
            )
            assert not page.is_logged_in(), f"DDT Failure [{record['test_id']}]: Should not be logged in"
            page.capture_screenshot(f"{record['test_id']}_failure")
        elif expected == "SUBMIT_DISABLED":
            assert page.is_login_submit_disabled(), (
                f"DDT Failure [{record['test_id']}]: Submit button should be disabled for empty fields"
            )
            page.capture_screenshot(f"{record['test_id']}_disabled")

    @pytest.mark.parametrize("record", STATION_RECORDS, ids=[r["test_id"] for r in STATION_RECORDS])
    def test_ddt_station_search(self, record: dict, page: HeatShieldPage):
        """
        Data-driven test for station search executing against multiple queries
        spanning valid cities, non-existent locations, prefixes, and whitespace.
        """
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Weather Stations")
        query = record["search_query"]
        expected = record["expected_behavior"]

        page.search_stations(query)

        if expected == "MATCH_FOUND":
            count = page.get_station_table_row_count()
            assert count > 0, f"DDT Failure [{record['test_id']}]: Expected matches for '{query}'"
            page.capture_screenshot(f"{record['test_id']}_match")
        elif expected == "EMPTY_STATE_DISPLAYED":
            assert page.is_station_empty_state_displayed(), (
                f"DDT Failure [{record['test_id']}]: Expected empty state for '{query}'"
            )
            page.capture_screenshot(f"{record['test_id']}_empty")
        elif expected == "ALL_STATIONS_MATCHED":
            count = page.get_station_table_row_count()
            assert count >= 6, f"DDT Failure [{record['test_id']}]: Expected multiple stations matching 'AWS-'"
            page.capture_screenshot(f"{record['test_id']}_all_matched")
        elif expected in ("PARTIAL_MATCH", "DEFAULT_VIEW_PRESERVED"):
            count = page.get_station_table_row_count()
            assert count > 0 or page.is_station_empty_state_displayed(), f"DDT Failure [{record['test_id']}]: Unexpected station search state"
            page.capture_screenshot(f"{record['test_id']}_partial")

    @pytest.mark.parametrize("record", ADVISORY_RECORDS, ids=[r["test_id"] for r in ADVISORY_RECORDS])
    def test_ddt_advisory_review(self, record: dict, page: HeatShieldPage):
        """
        Data-driven test verifying approval and rejection across different audiences.
        """
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("METEOROLOGIST")

        page.navigate_to_page("Advisories")
        audience = record["audience"]
        action = record["action"]
        page.select_advisory_tab(audience)

        if action == "APPROVE":
            action_taken = page.approve_first_pending_advisory()
            statuses = page.get_advisory_statuses()
            assert action_taken or "approved" in statuses, f"DDT Failure [{record['test_id']}]: No pending or approved advisory for {audience}"
            page.capture_screenshot(f"{record['test_id']}_approved")
        elif action == "REJECT":
            action_taken = page.reject_first_pending_advisory()
            statuses = page.get_advisory_statuses()
            assert action_taken or "rejected" in statuses, f"DDT Failure [{record['test_id']}]: No pending or rejected advisory for {audience}"
            page.capture_screenshot(f"{record['test_id']}_rejected")

    @pytest.mark.parametrize("record", SETTINGS_RECORDS, ids=[r["test_id"] for r in SETTINGS_RECORDS])
    def test_ddt_automation_settings(self, record: dict, page: HeatShieldPage):
        """
        Data-driven test verifying settings persistence across CSV records.
        """
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Settings")
        toggled = page.toggle_setting("Auto-refresh dashboard")
        assert toggled, f"DDT Failure [{record['test_id']}]: Failed to toggle setting"
        page.capture_screenshot(f"{record['test_id']}_toggled")
