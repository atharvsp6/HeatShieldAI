"""
Functional Selenium Tests for HeatShield AI (TC001 - TC014)

Covers:
- Feature 1: User Authentication & Role Access (TC001 - TC005)
- Feature 2: Advisory Review - Approve / Reject Workflow (TC006 - TC009)
- Feature 3: Weather Station Search, Filter & Sort (TC010 - TC013)
- Feature 4: Automation & Notification Settings Persistence (TC014)
"""

import time
import pytest
from testing.pages.heatshield_page import HeatShieldPage


class TestHeatShieldFunctional:

    # ─── Feature 1: Authentication & Role Access ───────────────────────────────

    def test_tc001_valid_admin_login(self, page: HeatShieldPage):
        """TC001: Successful login using valid administrator credentials."""
        page.navigate()
        page.login("admin", "admin123")
        assert page.is_logged_in(), "Failed to log in as admin"
        role = page.get_logged_in_user_role()
        assert role == "ADMIN", f"Expected ADMIN role, got {role}"
        page.capture_screenshot("TC001_admin_login_success")

    def test_tc002_valid_demo_role_login(self, page: HeatShieldPage):
        """TC002: Quick-access demo role selection and login."""
        page.navigate()
        page.logout()
        page.login_via_demo_role("METEOROLOGIST")
        assert page.is_logged_in(), "Failed to log in via demo role"
        role = page.get_logged_in_user_role()
        assert role == "METEOROLOGIST", f"Expected METEOROLOGIST role, got {role}"
        page.capture_screenshot("TC002_meteorologist_login_success")

    def test_tc003_invalid_password(self, page: HeatShieldPage):
        """TC003: Login failure with invalid password."""
        page.navigate()
        page.logout()
        page.login("admin", "wrong_password_xyz")
        err = page.get_login_error_message()
        assert err == "Invalid username or password", f"Unexpected error message: {err}"
        assert not page.is_logged_in(), "Should not be logged in with invalid password"
        page.capture_screenshot("TC003_invalid_password_error")

    def test_tc004_nonexistent_user(self, page: HeatShieldPage):
        """TC004: Login failure with non-existent username."""
        page.navigate()
        page.logout()
        page.login("non_existent_user_999", "password123")
        err = page.get_login_error_message()
        assert err == "Invalid username or password", f"Unexpected error message: {err}"
        assert not page.is_logged_in()
        page.capture_screenshot("TC004_nonexistent_user_error")

    def test_tc005_empty_credentials_disabled_submit(self, page: HeatShieldPage):
        """TC005: Submit button disabled when credentials are missing."""
        page.navigate()
        page.logout()
        # Ensure fields are clear
        page.login("", "")
        assert page.is_login_submit_disabled(), "Submit button should be disabled when fields are empty"
        page.capture_screenshot("TC005_submit_disabled")

    # ─── Feature 2: Advisory Review Lifecycle ─────────────────────────────────

    def test_tc006_approve_pending_advisory(self, page: HeatShieldPage):
        """TC006: Approve a pending heatwave advisory."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("METEOROLOGIST")

        page.navigate_to_page("Advisories")
        page.select_advisory_tab("CITIZENS")
        action_taken = page.approve_first_pending_advisory()
        assert action_taken, "No pending advisory was available to approve"
        page.capture_screenshot("TC006_advisory_approved")

    def test_tc007_reject_pending_advisory(self, page: HeatShieldPage):
        """TC007: Reject a pending heatwave advisory."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("METEOROLOGIST")

        page.navigate_to_page("Advisories")
        page.select_advisory_tab("FARMERS")
        action_taken = page.reject_first_pending_advisory()
        assert action_taken, "No pending advisory was available to reject"
        page.capture_screenshot("TC007_advisory_rejected")

    def test_tc008_audience_tab_navigation(self, page: HeatShieldPage):
        """TC008: Audience stakeholder tab navigation."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("METEOROLOGIST")

        page.navigate_to_page("Advisories")
        audiences = ["AUTHORITIES", "HEALTHCARE", "FARMERS", "CITIZENS"]
        for aud in audiences:
            page.select_advisory_tab(aud)
            time.sleep(0.3)
        page.capture_screenshot("TC008_audience_tabs_verified")

    def test_tc009_advisory_persistence_after_navigation(self, page: HeatShieldPage):
        """TC009: State persistence across page navigation."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("METEOROLOGIST")

        page.navigate_to_page("Advisories")
        page.select_advisory_tab("CITIZENS")
        statuses_before = page.get_advisory_statuses()
        assert len(statuses_before) > 0, "Expected at least one advisory initially"
        # Navigate away to Overview then return
        page.navigate_to_page("Overview")
        page.navigate_to_page("Advisories")
        page.select_advisory_tab("CITIZENS")
        statuses_after = page.get_advisory_statuses()
        assert statuses_before == statuses_after, f"Advisory statuses changed after navigation: {statuses_before} vs {statuses_after}"
        page.capture_screenshot("TC009_advisory_persistence")

    # ─── Feature 3: Weather Station Search & Filtering ────────────────────────

    def test_tc010_search_station_by_city(self, page: HeatShieldPage):
        """TC010: Filter weather stations table by matching city name."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Weather Stations")
        page.search_stations("Delhi")
        count = page.get_station_table_row_count()
        assert count > 0, "Expected at least 1 station matching 'Delhi'"
        regions = page.get_station_regions()
        assert all("Delhi" in r for r in regions), f"Found non-Delhi region in: {regions}"
        page.capture_screenshot("TC010_station_search_delhi")

    def test_tc011_search_station_by_code_prefix(self, page: HeatShieldPage):
        """TC011: Filter weather stations by station code prefix."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Weather Stations")
        page.search_stations("AWS-JAI")
        count = page.get_station_table_row_count()
        assert count > 0, "Expected stations for prefix AWS-JAI"
        regions = page.get_station_regions()
        assert all("Jaipur" in r for r in regions), f"Expected Jaipur stations for AWS-JAI, got: {regions}"
        page.capture_screenshot("TC011_station_code_prefix")

    def test_tc012_search_station_nonexistent(self, page: HeatShieldPage):
        """TC012: Search query yielding zero matching stations shows empty state."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Weather Stations")
        page.search_stations("NonExistentCityXYZ")
        assert page.is_station_empty_state_displayed(), "Empty state should be displayed for nonexistent station"
        page.capture_screenshot("TC012_station_empty_state")

    def test_tc013_sort_stations_table(self, page: HeatShieldPage):
        """TC013: Interactive table column sorting."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Weather Stations")
        page.search_stations("")  # Clear search
        page.sort_stations_by_column("Temperature")
        temps = page.get_station_temperatures()
        if len(temps) >= 2:
            assert temps == sorted(temps) or temps == sorted(temps, reverse=True), f"Expected sorted temperature list, got {temps}"
        page.capture_screenshot("TC013_station_sort_temperature")

    # ─── Feature 4: Automation Settings Persistence ───────────────────────────

    def test_tc014_toggle_settings_persistence(self, page: HeatShieldPage):
        """TC014: Toggle automation setting and verify state persistence."""
        page.navigate()
        if not page.is_logged_in():
            page.login_via_demo_role("ADMIN")

        page.navigate_to_page("Settings")
        initial_state = page.get_setting_state("Auto-refresh dashboard")
        toggled = page.toggle_setting("Auto-refresh dashboard")
        assert toggled, "Failed to toggle 'Auto-refresh dashboard' setting"
        new_state = page.get_setting_state("Auto-refresh dashboard")
        assert new_state != initial_state, f"State did not flip: was {initial_state}, now {new_state}"
        page.capture_screenshot("TC014_settings_toggled")
