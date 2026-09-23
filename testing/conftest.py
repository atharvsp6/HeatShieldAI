"""
Pytest configuration and Selenium WebDriver fixtures for STQA testing.
"""

import os
import sys
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Ensure testing module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from testing.pages.heatshield_page import HeatShieldPage


@pytest.fixture(scope="session")
def driver():
    """Session-scoped headless Chrome WebDriver."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-notifications")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(4)
    yield driver
    driver.quit()


@pytest.fixture
def page(driver):
    """Provides a fresh HeatShieldPage instance."""
    app_url = os.environ.get("HEATSHIELD_URL", "https://heatshield.atharvpatil.me")
    p = HeatShieldPage(driver, base_url=app_url)
    return p


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshot on test failure."""
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver", None)
        if driver:
            screenshots_dir = os.path.join(os.path.dirname(__file__), "reports", "screenshots")
            os.makedirs(screenshots_dir, exist_ok=True)
            screenshot_path = os.path.join(screenshots_dir, f"FAIL_{item.name}.png")
            driver.save_screenshot(screenshot_path)
