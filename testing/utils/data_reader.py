"""
Data Reader utility for STQA data-driven and keyword-driven test execution.
"""

import os
import csv
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_csv_data(filename: str) -> List[Dict[str, str]]:
    """Load a CSV file from testing/data/ and return a list of dictionaries."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Test data file not found: {filepath}")

    records = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)
    return records


def get_records_by_feature(filename: str, feature: str) -> List[Dict[str, str]]:
    """Filter records by feature name."""
    records = load_csv_data(filename)
    return [r for r in records if r.get("feature") == feature]
