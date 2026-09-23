"""
Keyword Test Engine for HeatShield AI STQA Testing

Parses keyword test definition CSV, maps each keyword to HeatShieldKeywords actions,
executes the workflow, and asserts outcomes.
"""

import os
import csv
import logging
from typing import List, Dict
from testing.keywords.keywords import HeatShieldKeywords
from testing.pages.heatshield_page import HeatShieldPage

logger = logging.getLogger(__name__)


class KeywordEngine:
    """Executes keyword-driven test scenarios from structured definitions."""

    def __init__(self, page: HeatShieldPage, test_file: str = "keyword_tests.csv"):
        self.page = page
        self.keywords = HeatShieldKeywords(page)
        self.test_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "data", test_file
        )

    def load_test_cases(self) -> Dict[str, List[Dict[str, str]]]:
        """Group test steps by test_id."""
        cases: Dict[str, List[Dict[str, str]]] = {}
        with open(self.test_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tid = row["test_id"]
                if tid not in cases:
                    cases[tid] = []
                cases[tid].append(row)
        return cases

    def execute_test(self, test_id: str) -> bool:
        """Execute all steps for a specific keyword test case."""
        cases = self.load_test_cases()
        if test_id not in cases:
            raise ValueError(f"Keyword test ID not found: {test_id}")

        steps = cases[test_id]
        print(f"\n[RUN] Executing Keyword Test: {test_id} ({len(steps)} steps)")

        for step in steps:
            kw = step["keyword"].strip()
            data = step["test_data"].strip()
            desc = step["description"].strip()
            step_no = step["step_no"]

            print(f"  Step {step_no}: {kw}('{data}') — {desc}")

            method = getattr(self.keywords, kw, None)
            if not method:
                raise AttributeError(f"Keyword '{kw}' not recognized by HeatShieldKeywords")

            try:
                if data:
                    method(data)
                else:
                    method()
            except Exception as e:
                self.page.capture_screenshot(f"KTC_FAIL_{test_id}_step_{step_no}")
                print(f"  [FAIL] Step {step_no} failed: {e}")
                raise

        print(f"[PASS] Keyword Test {test_id} completed successfully.")
        return True
