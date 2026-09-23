"""
Keyword-Driven Testing (KDT) Suite for HeatShield AI

Demonstrates:
KEYWORD TEST DEFINITION (CSV)
         ↓
   KEYWORD ENGINE
         ↓
   SELENIUM ACTION
         ↓
   HEATSHIELD AI
         ↓
    PASS / FAIL
"""

import pytest
from testing.keywords.keyword_engine import KeywordEngine
from testing.pages.heatshield_page import HeatShieldPage

KEYWORD_TEST_IDS = ["KTC001", "KTC002", "KTC003", "KTC004"]


class TestHeatShieldKeywordDriven:

    @pytest.mark.parametrize("test_id", KEYWORD_TEST_IDS)
    def test_kdt_scenarios(self, test_id: str, page: HeatShieldPage):
        """Execute keyword test scenario from keyword_tests.csv definition."""
        engine = KeywordEngine(page)
        success = engine.execute_test(test_id)
        assert success, f"Keyword test scenario {test_id} failed"
