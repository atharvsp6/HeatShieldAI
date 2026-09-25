"""
Page Object Model for HeatShield AI Web Application
"""

import os
import time
from typing import List, Optional
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver


class HeatShieldPage:
    """Encapsulates interaction with the HeatShield AI web application."""

    def __init__(self, driver: WebDriver, base_url: Optional[str] = None):
        self.driver = driver
        self.base_url = base_url or os.environ.get("HEATSHIELD_URL", "https://heatshield.atharvpatil.me")
        self.wait = WebDriverWait(driver, 10)

    # ─── 1. Navigation & Base ──────────────────────────────────────────────────

    def navigate(self, path: str = ""):
        """Open the target URL."""
        url = f"{self.base_url}{path}"
        self.driver.get(url)
        time.sleep(1)

    def capture_screenshot(self, name: str) -> str:
        """Capture screenshot to testing/reports/screenshots/."""
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "screenshots")
        os.makedirs(reports_dir, exist_ok=True)
        filename = f"{name}_{int(time.time())}.png"
        filepath = os.path.join(reports_dir, filename)
        self.driver.save_screenshot(filepath)
        return filepath

    def _set_input_value(self, element, value: str):
        """Set value of React controlled input and trigger React synthetic change events."""
        element.click()
        self.driver.execute_script("""
            var el = arguments[0];
            var val = arguments[1];
            var lastVal = el.value;
            el.value = val;
            var tracker = el._valueTracker;
            if (tracker) {
                tracker.setValue(lastVal);
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        """, element, value or "")
        time.sleep(0.2)

    def login(self, username: str, password: str):
        """Enter username and password and click Sign In."""
        user_field = self.wait.until(EC.visibility_of_element_located((By.ID, "login-username")))
        pass_field = self.wait.until(EC.visibility_of_element_located((By.ID, "login-password")))

        self._set_input_value(user_field, username)
        self._set_input_value(pass_field, password)

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        if submit_btn.is_enabled():
            submit_btn.click()
            time.sleep(1.5)

    def login_via_demo_role(self, role: str):
        """Click one of the demo role buttons and submit."""
        role_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, f"demo-role-{role.lower()}"))
        )
        role_btn.click()
        time.sleep(0.5)
        submit_btn = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
        )
        submit_btn.click()
        self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Log out']"))
        )
        time.sleep(0.5)

    def is_login_submit_disabled(self) -> bool:
        """Check if login submit button is disabled."""
        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        return not submit_btn.is_enabled()

    def get_login_error_message(self) -> Optional[str]:
        """Return the visible login error text if present."""
        try:
            error_elem = self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'text-[#f43f5e]')]"))
            )
            return error_elem.text.strip()
        except Exception:
            return None

    def is_logged_in(self) -> bool:
        """Check if user has successfully navigated into AppShell."""
        try:
            elems = self.driver.find_elements(By.CSS_SELECTOR, "button[title='Log out']")
            return len(elems) > 0 and elems[0].is_displayed()
        except Exception:
            return False

    def get_logged_in_user_role(self) -> Optional[str]:
        """Return the role displayed in the sidebar."""
        try:
            role_elem = self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'text-ink-faint') and contains(@class, 'truncate')]"))
            )
            return role_elem.text.strip()
        except Exception:
            return None

    def logout(self):
        """Ensure session is cleared and login page is displayed."""
        try:
            if not self.is_logged_in():
                if self.driver.find_elements(By.ID, "login-username"):
                    return
            logout_btns = self.driver.find_elements(By.CSS_SELECTOR, "button[title='Log out']")
            if logout_btns and logout_btns[0].is_displayed():
                logout_btns[0].click()
                self.wait.until(EC.visibility_of_element_located((By.ID, "login-username")))
                return
        except Exception:
            pass
        self.driver.get(self.base_url)
        self.wait.until(EC.visibility_of_element_located((By.ID, "login-username")))

    # ─── 3. Sidebar Navigation ────────────────────────────────────────────────

    def navigate_to_page(self, page_name: str):
        """Click a navigation button in the sidebar."""
        xpath = f"//aside//button[.//span[contains(text(), '{page_name}')]]"
        btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        btn.click()
        time.sleep(1.2)

    # ─── 4. Weather Stations Page ─────────────────────────────────────────────

    def search_stations(self, query: str):
        """Type query into stations search field."""
        search_box = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Search stations…']"))
        )
        self._set_input_value(search_box, query)
        time.sleep(1.0)

    def get_station_table_row_count(self) -> int:
        """Count rows in the weather stations table."""
        try:
            # Check if empty state is showing
            if self.is_station_empty_state_displayed():
                return 0
            rows = self.driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
            # Exclude loading skeletons
            valid_rows = [r for r in rows if "skeleton" not in r.get_attribute("innerHTML").lower()]
            return len(valid_rows)
        except Exception:
            return 0

    def get_station_regions(self) -> List[str]:
        """Extract region names from displayed stations rows."""
        try:
            cells = self.driver.find_elements(By.CSS_SELECTOR, "table tbody tr td:nth-child(2)")
            return [(c.text or c.get_attribute("textContent") or "").strip() for c in cells if (c.text or c.get_attribute("textContent") or "").strip()]
        except Exception:
            return []

    def is_station_empty_state_displayed(self) -> bool:
        """Check if empty search result state is rendered."""
        try:
            time.sleep(1.0)
            elem = self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'No stations match your filters')]"))
            )
            return elem.is_displayed()
        except Exception:
            return False

    def sort_stations_by_column(self, col_name: str):
        """Click a sortable column header (e.g., 'Temperature')."""
        header = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"//th[contains(., '{col_name}')]//button | //th[contains(., '{col_name}')]"))
        )
        header.click()
        time.sleep(0.5)

    def get_station_temperatures(self) -> List[float]:
        """Get list of temperatures from table for sort verification."""
        try:
            cells = self.driver.find_elements(By.CSS_SELECTOR, "table tbody tr td:nth-child(3)")
            temps = []
            for c in cells:
                txt = c.text.replace("°C", "").replace("—", "").strip()
                if txt:
                    try:
                        temps.append(float(txt))
                    except ValueError:
                        pass
            return temps
        except Exception:
            return []

    # ─── 5. Advisories Page ───────────────────────────────────────────────────

    def select_advisory_tab(self, audience: str):
        """Click audience tab (Citizens, Authorities, Farmers, Healthcare)."""
        xpath = f"//button[contains(., '{audience.capitalize()}') or contains(., '{audience.upper()}')]"
        tab = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        tab.click()
        time.sleep(0.8)

    def approve_first_pending_advisory(self) -> bool:
        """Click the Approve button on the first pending advisory card."""
        try:
            btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Approve')]"))
            )
            btn.click()
            time.sleep(1.5)
            return True
        except Exception:
            return False

    def reject_first_pending_advisory(self) -> bool:
        """Click the Reject button on the first pending advisory card."""
        try:
            btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Reject')]"))
            )
            btn.click()
            time.sleep(1.5)
            return True
        except Exception:
            return False

    def get_advisory_statuses(self) -> List[str]:
        """Return status text of all displayed advisories."""
        try:
            time.sleep(1.0)
            pills = self.driver.find_elements(
                By.XPATH, "//div[contains(@class, 'flex-col')]//span[contains(text(), 'approved') or contains(text(), 'rejected') or contains(text(), 'pending')]"
            )
            statuses = []
            for p in pills:
                t = (p.text or p.get_attribute("textContent") or "").lower().strip()
                if t:
                    statuses.append(t)
            return statuses
        except Exception:
            return []

    # ─── 6. Settings Page ─────────────────────────────────────────────────────

    def toggle_setting(self, setting_title: str) -> bool:
        """Toggle switch next to the given setting title and return new checked state."""
        xpath = f"//p[contains(text(), '{setting_title}')]/ancestor::div[contains(@class, 'flex') and contains(@class, 'justify-between')]//button[@role='switch']"
        toggle_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        initial_checked = toggle_btn.get_attribute("aria-checked")
        toggle_btn.click()
        time.sleep(1)
        new_checked = toggle_btn.get_attribute("aria-checked")
        return new_checked != initial_checked

    def get_setting_state(self, setting_title: str) -> Optional[str]:
        """Return the 'aria-checked' attribute value ('true' or 'false')."""
        xpath = f"//p[contains(text(), '{setting_title}')]/ancestor::div[contains(@class, 'flex') and contains(@class, 'justify-between')]//button[@role='switch']"
        toggle_btn = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
        return toggle_btn.get_attribute("aria-checked")
