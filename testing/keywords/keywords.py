"""
Keyword definitions library for HeatShield AI STQA Testing

Maps high-level test keywords to concrete Selenium actions via HeatShieldPage.
"""

from testing.pages.heatshield_page import HeatShieldPage


class HeatShieldKeywords:
    """Library of executable test keywords mapped directly to HeatShield actions."""

    def __init__(self, page: HeatShieldPage):
        self.page = page

    def OPEN_APP(self, data: str = ""):
        """Navigate to application root."""
        self.page.navigate(data or "")

    def ENTER_USERNAME(self, data: str):
        """Type username into login field."""
        user_field = self.page.wait.until(
            lambda d: d.find_element("id", "login-username")
        )
        user_field.clear()
        user_field.send_keys(data)

    def ENTER_PASSWORD(self, data: str):
        """Type password into password field."""
        pass_field = self.page.wait.until(
            lambda d: d.find_element("id", "login-password")
        )
        pass_field.clear()
        pass_field.send_keys(data)

    def SELECT_DEMO_ROLE(self, data: str):
        """Click one of the demo role buttons (ADMIN, METEOROLOGIST, etc.)."""
        self.page.login_via_demo_role(data)

    def CLICK_SUBMIT_LOGIN(self, data: str = ""):
        """Click the Sign In button."""
        submit_btn = self.page.wait.until(
            lambda d: d.find_element("css selector", "button[type='submit']")
        )
        submit_btn.click()

    def VERIFY_LOGIN_SUCCESS(self, data: str = ""):
        """Assert user successfully authenticated and role matches."""
        assert self.page.is_logged_in(), "Expected login to succeed, but user is not logged in"
        if data:
            role = self.page.get_logged_in_user_role()
            assert role == data, f"Expected role {data}, got {role}"

    def VERIFY_LOGIN_ERROR(self, data: str = "Invalid username or password"):
        """Assert visible login error banner text."""
        err = self.page.get_login_error_message()
        assert err == data, f"Expected error '{data}', got '{err}'"

    def NAVIGATE_TO(self, data: str):
        """Navigate to a sidebar section (e.g. 'Weather Stations', 'Advisories')."""
        self.page.navigate_to_page(data)

    def SEARCH_STATIONS(self, data: str):
        """Search query in weather stations."""
        self.page.search_stations(data)

    def VERIFY_STATION_RESULTS(self, data: str = "MATCH"):
        """Assert station search results."""
        if data == "MATCH":
            count = self.page.get_station_table_row_count()
            assert count > 0, "Expected matching stations, found 0"
        elif data == "EMPTY":
            assert self.page.is_station_empty_state_displayed(), "Expected empty state to be displayed"

    def SELECT_AUDIENCE_TAB(self, data: str):
        """Switch audience tab on Advisories page."""
        self.page.select_advisory_tab(data)

    def APPROVE_ADVISORY(self, data: str = ""):
        """Approve first pending advisory."""
        action_taken = self.page.approve_first_pending_advisory()
        statuses = self.page.get_advisory_statuses()
        assert action_taken or "approved" in statuses, "No pending or approved advisory found"

    def REJECT_ADVISORY(self, data: str = ""):
        """Reject first pending advisory."""
        action_taken = self.page.reject_first_pending_advisory()
        statuses = self.page.get_advisory_statuses()
        assert action_taken or "rejected" in statuses, "No pending or rejected advisory found"

    def TOGGLE_SETTING(self, data: str):
        """Toggle setting switch by name."""
        toggled = self.page.toggle_setting(data)
        assert toggled, f"Failed to toggle setting: {data}"

    def LOGOUT(self, data: str = ""):
        """Log out of session."""
        self.page.logout()

    def CLOSE_APP(self, data: str = ""):
        """Clean up by ensuring logout."""
        self.page.logout()
