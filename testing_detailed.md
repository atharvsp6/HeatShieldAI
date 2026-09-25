# HeatShield AI — Comprehensive Testing Documentation

**Project:** HeatShield AI  
**Branch Merged:** `feature/updates` → `main`  
**Assessment Date:** September 2026  
**Target Environment:** Live Deployed Application  
- **Frontend (Vercel):** `https://heatshield.atharvpatil.me`  
- **Backend (Render):** `https://heatshield-backend-so9r.onrender.com`  
**Test Framework:** Python 3.9 + Selenium WebDriver + pytest + pytest-html  
**Merge Safety Verdict:** ✅ **SAFE — Merged to `main`** (zero changes to application source code or deployment configs)

---

## Table of Contents

1. [Merge Impact Analysis](#1-merge-impact-analysis)
2. [Testing Architecture Overview](#2-testing-architecture-overview)
3. [Directory & File Inventory](#3-directory--file-inventory)
4. [Feature Candidate Analysis & Traceability](#4-feature-candidate-analysis--traceability)
5. [Selected Features for Automation](#5-selected-features-for-automation)
6. [Excluded Features & Justification](#6-excluded-features--justification)
7. [Test Case Specifications (14 Functional TCs)](#7-test-case-specifications-14-functional-tcs)
8. [Testing Methodologies](#8-testing-methodologies)
9. [Test Data Design](#9-test-data-design)
10. [Synthetic Data Generator](#10-synthetic-data-generator)
11. [Page Object Model (POM)](#11-page-object-model-pom)
12. [Test Execution Results](#12-test-execution-results)
13. [Defect Report](#13-defect-report)
14. [Test Evidence & Artifacts](#14-test-evidence--artifacts)
15. [How to Run Tests](#15-how-to-run-tests)

---

## 1. Merge Impact Analysis

The `feature/updates` branch was analyzed for deployment safety before merging:

| Aspect | Impact |
|--------|--------|
| `render.yaml` (Render backend config) | ❌ No changes |
| `backend/main.py` | ❌ No changes |
| `backend/requirements.txt` | ❌ No changes |
| `frontend/package.json` | ❌ No changes |
| `frontend/vite.config.ts` | ❌ No changes |
| `frontend/src/App.tsx` | ❌ No changes |
| `frontend/src/services/api.ts` | ❌ No changes |
| `frontend/src/pages/*` | ❌ No changes |
| `.gitignore` | ❌ No changes |
| `backend/**/*.pyc` (cache files) | 🗑️ Deleted (cleanup) |

**Conclusion:** The branch exclusively adds a `testing/` directory, 4 root-level markdown reports, and cleans up Python bytecode cache. **Zero application source code or deployment configuration was modified.** The merge is fully safe for existing Render and Vercel deployments.

### What Was Added (2,605 lines, 87 files)

| Category | Files Added |
|----------|-------------|
| Testing documentation (root) | `STQA_TESTING_PLAN.md`, `STQA_TEST_CASES.md`, `TEST_EXECUTION_REPORT.md`, `DEFECT_REPORT.md` |
| Test framework config | `testing/conftest.py` |
| Page Object Model | `testing/pages/heatshield_page.py` |
| Functional tests | `testing/tests/test_functional.py` |
| Data-driven tests | `testing/tests/test_data_driven.py` |
| Keyword-driven tests | `testing/tests/test_keyword_driven.py` |
| Keyword engine & library | `testing/keywords/keyword_engine.py`, `testing/keywords/keywords.py` |
| Test data (CSV) | `testing/data/valid_data.csv`, `testing/data/invalid_data.csv`, `testing/data/boundary_data.csv`, `testing/data/keyword_tests.csv` |
| Data utilities | `testing/utils/data_reader.py` |
| Synthetic data generator | `testing/synthetic_data_generator.py` |
| HTML test report | `testing/reports/test_report.html` |
| Screenshot evidence | `testing/reports/screenshots/` (60+ `.png` files) |
| Bytecode cleanup | 16 `.pyc` files deleted from `backend/` |

---

## 2. Testing Architecture Overview

The testing suite follows a layered architecture with clean separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    TEST SUITES                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │  Functional  │ │ Data-Driven  │ │ Keyword-Driven   │ │
│  │  (14 TCs)    │ │  (20 recs)   │ │  (4 scenarios)   │ │
│  └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘ │
│         │                │                  │           │
│  ┌──────▼────────────────▼──────┐  ┌────────▼─────────┐ │
│  │    Page Object Model (POM)   │  │  Keyword Engine   │ │
│  │   heatshield_page.py (275L)  │  │  keyword_engine.py│ │
│  └──────────────┬───────────────┘  │  keywords.py      │ │
│                 │                  └────────┬─────────┘ │
│  ┌──────────────▼──────────────────────────▼──────────┐ │
│  │          Selenium WebDriver (Headless Chrome)       │ │
│  └─────────────────────────┬──────────────────────────┘ │
│                            │                            │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │               CSV Data Files                        │ │
│  │  valid_data.csv │ invalid_data.csv │ boundary.csv   │ │
│  │  keyword_tests.csv                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  pytest + conftest.py (fixtures, hooks, reports)    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │  HeatShield AI (Live)    │
              │  Frontend: Vercel        │
              │  Backend: Render (API)   │
              └──────────────────────────┘
```

### Design Patterns Used

| Pattern | Implementation |
|---------|---------------|
| **Page Object Model (POM)** | `HeatShieldPage` class encapsulates all page interactions — login, navigation, station search, advisory review, settings |
| **Data-Driven Testing (DDT)** | CSV datasets (`valid`, `invalid`, `boundary`) fed via `pytest.mark.parametrize` |
| **Keyword-Driven Testing (KDT)** | CSV workflow definitions → `KeywordEngine` parser → `HeatShieldKeywords` action library |
| **Session-scoped fixtures** | Single browser instance reused across all tests for performance |
| **Automatic failure screenshots** | `pytest_runtest_makereport` hook captures PNG on assertion failure |

---

## 3. Directory & File Inventory

```
testing/
├── conftest.py                          # Pytest config: WebDriver fixture, screenshot hook
├── synthetic_data_generator.py          # Generates valid/invalid/boundary CSVs programmatically
│
├── pages/
│   └── heatshield_page.py               # Page Object Model (275 lines, 20+ methods)
│
├── tests/
│   ├── test_functional.py               # 14 functional test cases (TC001–TC014)
│   ├── test_data_driven.py              # Parametrized DDT suite (20 records × 4 test functions)
│   └── test_keyword_driven.py           # KDT suite (4 keyword scenarios: KTC001–KTC004)
│
├── keywords/
│   ├── keyword_engine.py                # CSV parser + step executor engine
│   └── keywords.py                      # 15 keyword action implementations
│
├── data/
│   ├── valid_data.csv                   # 10 positive test records
│   ├── invalid_data.csv                 # 5 negative test records
│   ├── boundary_data.csv                # 5 edge-case records
│   └── keyword_tests.csv               # 25 keyword steps across 4 scenarios
│
├── utils/
│   └── data_reader.py                   # CSV loading and feature-filtering utility
│
└── reports/
    ├── test_report.html                 # Full pytest-html execution report (1094 lines)
    └── screenshots/                     # 60+ execution evidence PNGs
        ├── TC001_admin_login_success_*.png
        ├── TC002_meteorologist_login_success_*.png
        ├── ...
        ├── DDT_VAL_001_success_*.png
        ├── DDT_INV_001_failure_*.png
        ├── DDT_BND_001_disabled_*.png
        ├── ...
        └── FAIL_test_*.png              # Failure screenshots from earlier runs
```

**Root-level testing docs:**

```
STQA_TESTING_PLAN.md        # Feature analysis, selection criteria, traceability matrix
STQA_TEST_CASES.md          # 14 test case specifications table
TEST_EXECUTION_REPORT.md    # Full execution summary (38 tests, 100% pass)
DEFECT_REPORT.md            # 5 discovered defects with reproduction steps
```

---

## 4. Feature Candidate Analysis & Traceability

Every feature in HeatShield AI was rigorously analyzed across the full stack before selecting candidates for automation. The traceability matrix maps each feature from frontend component → API endpoint → database/backend → rendered output:

| Feature | Frontend | Backend/API | E2E Working? | Suitable for Testing? |
|---------|----------|-------------|:------------:|:--------------------:|
| **User Authentication & Role Access** | `Login.tsx` | `POST /api/auth/login` | ✅ YES | ✅ YES |
| **Advisory Lifecycle (Approve/Reject)** | `Advisories.tsx` | `POST /api/advisories/{id}/approve`, `/reject` | ✅ YES | ✅ YES |
| **Weather Station Search & Filtering** | `Stations.tsx` | `GET /api/stations` | ✅ YES | ✅ YES |
| **Platform Automation Settings** | `Settings.tsx` | `GET /api/settings`, `PUT /api/settings` | ✅ YES | ✅ YES |
| On-Demand Forecast Generation | `Forecasts.tsx` | `POST /api/forecasts/generate` | ✅ YES | ⚠️ PARTIAL |
| Forecast Period & Model Selectors | `Forecasts.tsx` | None (disconnected) | ❌ NO | ❌ NO |
| Forecast Region Filter (Delhi) | `Forecasts.tsx` | `GET /api/forecasts` | ❌ BROKEN | ❌ NO |
| Heatwave Incident Drawer | `Heatwaves.tsx` | `GET /api/heatwaves` | ⚠️ PARTIAL | ❌ NO |
| Validation Error Trend Chart | `Validation.tsx` | `GET /api/validation` | ❌ BROKEN | ❌ NO |
| Live Weather Ingestion | None (API only) | `POST /api/weather/ingest` | Backend only | ❌ NO |
| Model Retraining | None (API only) | `POST /api/ml/train` | Backend only | ❌ NO |
| Station Signal Strength Bars | `Stations.tsx` | None | UI mock only | ❌ NO |

---

## 5. Selected Features for Automation

Four features were selected based on end-to-end functional stability, deterministic outcomes, and testable DOM selectors:

### Feature 1: User Authentication & Role Access
- **Frontend:** `Login.tsx` with stable IDs (`#login-username`, `#login-password`, `#demo-role-*`)
- **Backend:** `POST /api/auth/login` — bcrypt password verification + JWT token generation
- **Why:** Deterministic success/failure states, stable element IDs, foundational for all other tests

### Feature 2: Advisory Review (Approve & Reject)
- **Frontend:** `Advisories.tsx` — audience tabs + status pill badges
- **Backend:** `POST /api/advisories/{id}/approve`, `POST /api/advisories/{id}/reject`
- **Why:** Core operational workflow with visible state machine transitions (`pending` → `approved`/`rejected`), database persistence

### Feature 3: Weather Station Search & Filtering
- **Frontend:** `Stations.tsx` — search input, data table, empty state component
- **Backend:** `GET /api/stations`
- **Why:** High-value interactive data table with real-time client-side text filtering, column sorting, and empty state handling

### Feature 4: Automation & Notification Settings
- **Frontend:** `Settings.tsx` — toggle switches with `role="switch"` and `aria-checked`
- **Backend:** `GET /api/settings`, `PUT /api/settings`
- **Why:** Standard W3C accessible selectors, persistent state across sessions via PostgreSQL

---

## 6. Excluded Features & Justification

| Feature | Reason for Exclusion |
|---------|---------------------|
| **Validation Error Trend Chart** | Code defect: `ErrorTrend.tsx` binds `dataKey="observed"` but API returns `{ time, mae }` — chart renders blank |
| **Forecast Region Filter** | Naming defect: frontend uses `"Delhi NCR"`, backend stores `"Delhi"` — filter returns 0 results |
| **Forecast Detail Table** | Backend `/api/forecasts` does not join observed data — "Observed" column always shows `—` |
| **Heatwave Incident Drawer** | Hardcoded placeholder fields (`population: "—"`, `peak: null`) not backed by DB schema |
| **Weather Ingestion & ML APIs** | Backend endpoints exist but no UI controls implemented |
| **Signal Strength Bars** | Purely aesthetic mock; backend telemetry doesn't provide RSSI data |

---

## 7. Test Case Specifications (14 Functional TCs)

| TC ID | Feature | Type | Input | Expected Result |
|-------|---------|------|-------|-----------------|
| **TC001** | Authentication | Positive / Smoke | `admin` / `admin123` | Dashboard rendered, role = ADMIN |
| **TC002** | Authentication | Positive / Functional | Demo role: METEOROLOGIST | Auto-populates `meteorologist` / `met123`, logs in as Dr. Priya Sharma |
| **TC003** | Authentication | Negative | `admin` / `wrongpass123` | Red error banner: "Invalid username or password" |
| **TC004** | Authentication | Negative | `unknown_user_99` / `anypass` | Red error banner, no JWT issued |
| **TC005** | Authentication | Boundary / Validation | Empty username + password | Submit button `disabled`, no network request |
| **TC006** | Advisory Review | Positive / State Transition | Approve pending card (CITIZENS) | Status badge: `pending` → `approved` (green pill) |
| **TC007** | Advisory Review | Positive / State Transition | Reject pending card (FARMERS) | Status badge: `pending` → `rejected` (red pill) |
| **TC008** | Advisory Review | Functional / Navigation | Cycle through 4 audience tabs | Cards filter by audience, no errors |
| **TC009** | Advisory Review | State Persistence | Navigate away and back | Approved/rejected statuses persist |
| **TC010** | Station Search | Positive / Search | Query: `"Delhi"` | Only Delhi stations displayed |
| **TC011** | Station Search | Boundary / Precision | Query: `"AWS-JAI"` | Only Jaipur stations with prefix displayed |
| **TC012** | Station Search | Negative / Boundary | Query: `"NonExistentCityXYZ"` | Empty state: "No stations match your filters" |
| **TC013** | Station Search | Functional / Interactive | Click Temperature column header | Rows sort desc then asc on second click |
| **TC014** | Settings | Positive / Persistence | Toggle "Auto-refresh dashboard" | `aria-checked` flips, change persisted to PostgreSQL |

---

## 8. Testing Methodologies

### 8.1 Functional Testing

**File:** `testing/tests/test_functional.py` (194 lines)

Traditional Selenium functional tests organized into a single `TestHeatShieldFunctional` class with 14 test methods (TC001–TC014). Each test:
1. Navigates to the application
2. Ensures correct authentication state (login/logout as needed)
3. Performs the feature-specific actions
4. Asserts expected outcomes
5. Captures a timestamped screenshot

**Key characteristics:**
- Uses POM abstraction — tests call `page.login()`, `page.search_stations()`, etc.
- Session-scoped WebDriver — single browser instance for the entire suite
- Tests are **independent** — each resets state as needed via `page.logout()` / `page.navigate()`

### 8.2 Data-Driven Testing (DDT)

**File:** `testing/tests/test_data_driven.py` (133 lines)

Demonstrates the principle: **ONE test script + MULTIPLE data records = Data-Driven Testing**

The test reads records dynamically from 3 CSV files:
- `valid_data.csv` — 10 positive test records
- `invalid_data.csv` — 5 negative test records
- `boundary_data.csv` — 5 edge-case records

Records are grouped by `feature` field and fed via `@pytest.mark.parametrize`:

| Test Function | Records Fed | Features Covered |
|---------------|-------------|-----------------|
| `test_ddt_authentication` | 7 records | Valid logins (4 roles), invalid passwords (3), empty credentials (1) |
| `test_ddt_station_search` | 8 records | Valid cities (3), non-existent (2), prefix (1), single-char (1), whitespace (1) |
| `test_ddt_advisory_review` | 2 records | Approve (CITIZENS), Reject (FARMERS) |
| `test_ddt_automation_settings` | 1 record | Toggle auto-refresh |

**Total:** 20 parameterized test executions from a single test file.

### 8.3 Keyword-Driven Testing (KDT)

**File:** `testing/tests/test_keyword_driven.py` (30 lines)

Implements a full keyword-driven framework with the flow:

```
CSV Definition  →  KeywordEngine (parser)  →  HeatShieldKeywords (actions)  →  Selenium  →  App
```

**Components:**

| Component | File | Purpose |
|-----------|------|---------|
| **Test definitions** | `data/keyword_tests.csv` | 25 steps across 4 scenarios |
| **Keyword engine** | `keywords/keyword_engine.py` | Parses CSV, groups by `test_id`, executes sequentially |
| **Keywords library** | `keywords/keywords.py` | 15 keyword implementations mapping to POM methods |

**Available Keywords (15):**

| Keyword | Action |
|---------|--------|
| `OPEN_APP` | Navigate to application root |
| `ENTER_USERNAME` | Type into `#login-username` |
| `ENTER_PASSWORD` | Type into `#login-password` |
| `SELECT_DEMO_ROLE` | Click demo role card |
| `CLICK_SUBMIT_LOGIN` | Click Sign In button |
| `VERIFY_LOGIN_SUCCESS` | Assert logged in + optional role check |
| `VERIFY_LOGIN_ERROR` | Assert error banner text |
| `NAVIGATE_TO` | Click sidebar navigation item |
| `SEARCH_STATIONS` | Type into station search field |
| `VERIFY_STATION_RESULTS` | Assert MATCH or EMPTY state |
| `SELECT_AUDIENCE_TAB` | Switch advisory audience tab |
| `APPROVE_ADVISORY` | Approve first pending advisory |
| `REJECT_ADVISORY` | Reject first pending advisory |
| `TOGGLE_SETTING` | Toggle a settings switch |
| `LOGOUT` | Log out and verify login page |

**Keyword Test Scenarios:**

| ID | Scenario | Steps |
|----|----------|-------|
| **KTC001** | Admin Authentication | `OPEN_APP` → `ENTER_USERNAME(admin)` → `ENTER_PASSWORD(admin123)` → `CLICK_SUBMIT_LOGIN` → `VERIFY_LOGIN_SUCCESS(ADMIN)` → `LOGOUT` |
| **KTC002** | Invalid Credential Rejection | `OPEN_APP` → `ENTER_USERNAME(admin)` → `ENTER_PASSWORD(wrongpass99)` → `CLICK_SUBMIT_LOGIN` → `VERIFY_LOGIN_ERROR` |
| **KTC003** | Station Search & Empty State | `OPEN_APP` → `SELECT_DEMO_ROLE(ADMIN)` → `NAVIGATE_TO(Weather Stations)` → `SEARCH_STATIONS(Delhi)` → `VERIFY_STATION_RESULTS(MATCH)` → `SEARCH_STATIONS(NonExistent)` → `VERIFY_STATION_RESULTS(EMPTY)` |
| **KTC004** | Advisory Approval Workflow | `OPEN_APP` → `SELECT_DEMO_ROLE(METEOROLOGIST)` → `NAVIGATE_TO(Advisories)` → `SELECT_AUDIENCE_TAB(CITIZENS)` → `APPROVE_ADVISORY` → `LOGOUT` |

---

## 9. Test Data Design

### 9.1 Valid Data

**File:** `testing/data/valid_data.csv` (10 records)

| Test ID | Feature | Input | Expected |
|---------|---------|-------|----------|
| DDT_VAL_001 | authentication | `admin` / `admin123` | LOGIN_SUCCESS |
| DDT_VAL_002 | authentication | `meteorologist` / `met123` | LOGIN_SUCCESS |
| DDT_VAL_003 | authentication | `authority` / `auth123` | LOGIN_SUCCESS |
| DDT_VAL_004 | authentication | `citizen` / `citizen123` | LOGIN_SUCCESS |
| DDT_VAL_005 | station_search | Query: `Delhi` | MATCH_FOUND |
| DDT_VAL_006 | station_search | Query: `Jaipur` | MATCH_FOUND |
| DDT_VAL_007 | station_search | Query: `Pune` | MATCH_FOUND |
| DDT_VAL_008 | advisory_review | Audience: CITIZENS, Action: APPROVE | STATUS_APPROVED |
| DDT_VAL_009 | advisory_review | Audience: FARMERS, Action: REJECT | STATUS_REJECTED |
| DDT_VAL_010 | automation_settings | Key: `auto_refresh` | TOGGLE_SUCCESS |

### 9.2 Invalid Data

**File:** `testing/data/invalid_data.csv` (5 records)

| Test ID | Feature | Input | Expected |
|---------|---------|-------|----------|
| DDT_INV_001 | authentication | `admin` / `wrong_password_999` | LOGIN_FAILURE_ERROR_MESSAGE |
| DDT_INV_002 | authentication | `non_existent_scientist` / `password123` | LOGIN_FAILURE_ERROR_MESSAGE |
| DDT_INV_003 | authentication | `guest_user` / `invalid_format_password` | LOGIN_FAILURE_ERROR_MESSAGE |
| DDT_INV_004 | station_search | Query: `AtlantisUnderwaterCity` | EMPTY_STATE_DISPLAYED |
| DDT_INV_005 | station_search | Query: `XYZ_999_FAKE_STATION` | EMPTY_STATE_DISPLAYED |

### 9.3 Boundary Data

**File:** `testing/data/boundary_data.csv` (5 records)

| Test ID | Feature | Input | Expected |
|---------|---------|-------|----------|
| DDT_BND_001 | authentication | Empty username + password | SUBMIT_DISABLED |
| DDT_BND_002 | authentication | 50-char username + 100-char password (max Pydantic schema) | LOGIN_FAILURE_ERROR_MESSAGE |
| DDT_BND_003 | station_search | Query: `AWS-` (prefix matching all stations) | ALL_STATIONS_MATCHED |
| DDT_BND_004 | station_search | Query: `D` (single character) | PARTIAL_MATCH |
| DDT_BND_005 | station_search | Query: `"   "` (whitespace only) | DEFAULT_VIEW_PRESERVED |

### 9.4 Keyword Test Definitions

**File:** `testing/data/keyword_tests.csv` (25 steps across 4 test IDs)

Format: `test_id, step_no, keyword, test_data, description`

Each row defines one step in a sequential keyword workflow. The `KeywordEngine` groups rows by `test_id` and executes them in `step_no` order.

---

## 10. Synthetic Data Generator

**File:** `testing/synthetic_data_generator.py` (312 lines)

A standalone Python script that programmatically generates all 3 CSV test data files. Contains:

| Function | Output | Records |
|----------|--------|---------|
| `generate_valid_data()` | `valid_data.csv` | 10 records |
| `generate_invalid_data()` | `invalid_data.csv` | 5 records |
| `generate_boundary_data()` | `boundary_data.csv` | 5 records |

**Usage:**
```bash
python testing/synthetic_data_generator.py
```

This regenerates all CSVs deterministically from hardcoded data definitions, ensuring reproducibility. Boundary cases like 50-char usernames and 100-char passwords are generated using `"a" * 50` and `"p" * 100`.

---

## 11. Page Object Model (POM)

**File:** `testing/pages/heatshield_page.py` (275 lines)

The `HeatShieldPage` class encapsulates all interactions with the HeatShield AI web application, providing a clean API layer between tests and Selenium commands.

### Class Structure

```python
class HeatShieldPage:
    def __init__(self, driver, base_url)   # Initialize with WebDriver + app URL
```

### Method Inventory (20+ methods)

| Category | Method | Purpose |
|----------|--------|---------|
| **Navigation** | `navigate(path)` | Open base URL or specific path |
| | `navigate_to_page(name)` | Click sidebar nav button by label |
| **Authentication** | `login(username, password)` | Fill form and submit |
| | `login_via_demo_role(role)` | Click demo role card + submit |
| | `logout()` | Click logout button or force navigate |
| | `is_logged_in()` | Check for logout button presence |
| | `get_logged_in_user_role()` | Extract role text from sidebar |
| | `get_login_error_message()` | Get red error banner text |
| | `is_login_submit_disabled()` | Check submit button `disabled` attr |
| **Stations** | `search_stations(query)` | Type into search input |
| | `get_station_table_row_count()` | Count visible table rows |
| | `get_station_regions()` | Extract region column text |
| | `is_station_empty_state_displayed()` | Check "No stations match" message |
| | `sort_stations_by_column(col)` | Click column header for sorting |
| | `get_station_temperatures()` | Extract temperature values as floats |
| **Advisories** | `select_advisory_tab(audience)` | Click audience tab |
| | `approve_first_pending_advisory()` | Click Approve on first pending card |
| | `reject_first_pending_advisory()` | Click Reject on first pending card |
| | `get_advisory_statuses()` | List all status pill texts |
| **Settings** | `toggle_setting(title)` | Click toggle switch by label |
| | `get_setting_state(title)` | Get `aria-checked` value |
| **Utility** | `capture_screenshot(name)` | Save timestamped PNG to reports/ |

### WebDriver Configuration

```python
# Session-scoped headless Chrome (conftest.py)
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1440,900")
driver.implicitly_wait(4)  # seconds
```

---

## 12. Test Execution Results

### Executive Summary

| Metric | Value |
|--------|-------|
| **Total Functional Tests** | 14 |
| **Total Keyword Scenarios** | 4 |
| **Total Data-Driven Records** | 20 |
| **Grand Total Executed** | **38** |
| **Overall Pass Rate** | **38 / 38 (100%)** |
| **Status** | ✅ **ALL PASSED** |

### 12.1 Functional Test Results (14/14 Passed)

| TC | Feature | Type | Status |
|----|---------|------|:------:|
| TC001 | Admin login | Positive / Smoke | ✅ PASSED |
| TC002 | Demo role login | Positive / Functional | ✅ PASSED |
| TC003 | Invalid password | Negative | ✅ PASSED |
| TC004 | Non-existent user | Negative | ✅ PASSED |
| TC005 | Empty credentials disabled | Boundary | ✅ PASSED |
| TC006 | Approve advisory | State Transition | ✅ PASSED |
| TC007 | Reject advisory | State Transition | ✅ PASSED |
| TC008 | Audience tab navigation | Functional | ✅ PASSED |
| TC009 | Advisory persistence | State Persistence | ✅ PASSED |
| TC010 | Station search by city | Search | ✅ PASSED |
| TC011 | Station search by code | Boundary / Precision | ✅ PASSED |
| TC012 | Non-existent station | Negative / Boundary | ✅ PASSED |
| TC013 | Column sorting | Interactive | ✅ PASSED |
| TC014 | Settings toggle | Persistence | ✅ PASSED |

### 12.2 Keyword-Driven Results (4/4 Passed)

| ID | Scenario | Status |
|----|----------|:------:|
| KTC001 | Admin Authentication | ✅ PASSED |
| KTC002 | Invalid Credential Rejection | ✅ PASSED |
| KTC003 | Station Search & Empty State | ✅ PASSED |
| KTC004 | Advisory Approval Workflow | ✅ PASSED |

### 12.3 Data-Driven Results (20/20 Passed)

| Dataset | Records | Status |
|---------|---------|:------:|
| Valid Data | 10 / 10 | ✅ ALL PASSED |
| Invalid Data | 5 / 5 | ✅ ALL PASSED |
| Boundary Data | 5 / 5 | ✅ ALL PASSED |

---

## 13. Defect Report

Five genuine defects were discovered during the testing analysis phase. **No application code was altered to mask them** — they are documented as-is:

### DEF001: Blank ML Error Trend Chart (Severity: HIGH)

| Field | Details |
|-------|---------|
| **Component** | `frontend/src/components/validation/ErrorTrend.tsx:28` |
| **Root Cause** | Recharts `<Line>` uses `dataKey="observed"`, but API returns `{ time, mae }` — key mismatch |
| **Impact** | Error trend chart renders completely blank |
| **Repro** | Login → Model Validation → Scroll to Error Trend panel |
| **Status** | Documented |

### DEF002: Forecast Chart Empty by Default (Severity: MEDIUM)

| Field | Details |
|-------|---------|
| **Component** | `frontend/src/pages/Forecasts.tsx:16` |
| **Root Cause** | Frontend initializes filter as `"Delhi NCR"`, backend stores `"Delhi"` — 0 matches returned |
| **Impact** | Chart empty on initial page load |
| **Repro** | Login → Forecasts → Observe 7-day temperature chart |
| **Status** | Documented |

### DEF003: Forecast "Observed" Column Always `—` (Severity: MEDIUM)

| Field | Details |
|-------|---------|
| **Component** | `backend/main.py:230` |
| **Root Cause** | `/api/forecasts` queries `Forecast` table without joining observed weather data |
| **Impact** | No forecast verification possible |
| **Repro** | Login → Forecasts → Scroll to tabular log → Inspect "Observed" column |
| **Status** | Documented |

### DEF004: Heatwave Drawer Mock Placeholders (Severity: LOW)

| Field | Details |
|-------|---------|
| **Component** | `frontend/src/pages/Heatwaves.tsx:189-195` |
| **Root Cause** | Drawer displays hardcoded `—` for population/narrative not in backend schema |
| **Impact** | Incomplete UI detail view |
| **Repro** | Login → Heatwave Events → Click any heatwave card → Inspect drawer |
| **Status** | Documented |

### DEF005: Session Lost on Page Refresh (Severity: MEDIUM)

| Field | Details |
|-------|---------|
| **Component** | `frontend/src/App.tsx:29` |
| **Root Cause** | Auth state in React `useState` only; no `useEffect` to restore from `localStorage` token |
| **Impact** | Browser refresh returns user to login screen despite valid stored token |
| **Repro** | Login as admin → Press F5 → Observe login screen |
| **Status** | Documented |

---

## 14. Test Evidence & Artifacts

### Screenshots Captured (60+ files)

All screenshots are stored in `testing/reports/screenshots/` with naming convention:

| Pattern | Meaning |
|---------|---------|
| `TC{ID}_{description}_{timestamp}.png` | Functional test execution evidence |
| `DDT_{category}_{ID}_{outcome}_{timestamp}.png` | Data-driven test evidence |
| `FAIL_test_{name}.png` | Automatic failure captures from earlier runs |

### HTML Report

- **File:** `testing/reports/test_report.html` (1,094 lines)
- **Generator:** `pytest-html` plugin
- **Contents:** Individual test durations, assertion details, metadata, environment info

---

## 15. How to Run Tests

### Prerequisites

```bash
pip install selenium pytest pytest-html
# ChromeDriver must be in PATH (matching installed Chrome version)
```

### Generate Test Data (Optional — CSVs already exist)

```bash
python testing/synthetic_data_generator.py
```

### Run All Tests

```bash
# From project root
pytest testing/ -v --html=testing/reports/test_report.html --self-contained-html
```

### Run Individual Suites

```bash
# Functional tests only
pytest testing/tests/test_functional.py -v

# Data-driven tests only
pytest testing/tests/test_data_driven.py -v

# Keyword-driven tests only
pytest testing/tests/test_keyword_driven.py -v
```

### Custom Target URL

```bash
# Test against a different deployment
set HEATSHIELD_URL=http://localhost:5173
pytest testing/ -v
```

---

> **Document generated on:** September 26, 2026  
> **Branch merged:** `feature/updates` → `main` (safe merge, zero deployment impact)  
> **Total test count:** 38 tests across 3 methodologies — **100% pass rate**
