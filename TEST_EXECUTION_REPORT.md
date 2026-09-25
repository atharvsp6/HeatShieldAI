# HeatShield AI — STQA Test Execution Report

**Project:** HeatShield AI (STQA Automated Testing)  
**Target Environment:** Deployed Live Web Application (`https://heatshield.atharvpatil.me`)  
**Backend API:** Deployed Fastify/PostgreSQL API (`https://heatshield-backend-so9r.onrender.com`)  
**Test Framework:** Python 3.9 + Selenium WebDriver + pytest + pytest-html  
**Execution Timestamp:** September 2026  

---

## Executive Summary

| Metric | Count / Value |
| ------ | ------------- |
| **Total Functional Test Cases** | 14 |
| **Total Keyword-Driven Scenarios** | 4 |
| **Total Data-Driven Records Executed** | 20 |
| **Functional Tests Passed** | 14 / 14 (100%) |
| **Keyword Tests Passed** | 4 / 4 (100%) |
| **Data-Driven Tests Passed** | 20 / 20 (100%) |
| **Total Tests Executed** | 38 |
| **Overall Status** | **PASSED** |
| **Test HTML Report Location** | `testing/reports/test_report.html` |
| **Screenshots Captured** | `testing/reports/screenshots/` |

---

## 1. Functional Test Results (`test_functional.py`)

| Test ID | Feature | Test Type | Input | Expected | Actual | Status |
| ------- | ------- | --------- | ----- | -------- | ------ | ------ |
| **TC001** | User Authentication | Positive / Smoke | `admin` / `admin123` | Dashboard rendered, role shows "ADMIN" | Session established, dashboard displayed | **PASSED** |
| **TC002** | Role-Based Access | Positive / Functional | Role card: `METEOROLOGIST` | User logged in with Meteorologist role | Logged in as METEOROLOGIST | **PASSED** |
| **TC003** | User Authentication | Negative | `admin` / `wrong_password_xyz` | Banner: "Invalid username or password" | Banner shown, session not established | **PASSED** |
| **TC004** | User Authentication | Negative | `non_existent_user_999` / `password123` | Banner: "Invalid username or password" | Banner shown, authentication rejected | **PASSED** |
| **TC005** | User Authentication | Boundary / Validation | Empty username and empty password | Submit button disabled | Submit button disabled in DOM | **PASSED** |
| **TC006** | Advisory Lifecycle | Positive / Functional | First pending card under CITIZENS -> "Approve" | Status badge transitions to "approved" | Card transitioned to approved | **PASSED** |
| **TC007** | Advisory Lifecycle | Positive / Functional | First pending card under FARMERS -> "Reject" | Status badge transitions to "rejected" | Card transitioned to rejected | **PASSED** |
| **TC008** | Advisory Lifecycle | Functional / Navigation | Audience tabs: Citizens, Authorities, Farmers, Healthcare | Each tab switches advisory cards without error | Tab switches render respective lists | **PASSED** |
| **TC009** | Advisory Lifecycle | State Persistence | Navigate Advisories -> Overview -> Advisories | Advisory statuses remain identical | Statuses persisted across page routing | **PASSED** |
| **TC010** | Station Filtering | Positive / Search | Query: `"Delhi"` | Table displays only Delhi regional stations | Only Delhi matching rows rendered | **PASSED** |
| **TC011** | Station Filtering | Positive / Prefix | Query: `"AWS-JAI"` | Table displays Jaipur stations | Matches with prefix AWS-JAI displayed | **PASSED** |
| **TC012** | Station Filtering | Negative / Boundary | Query: `"NonExistentCityXYZ"` | UI renders "No stations match your filters" | Empty state component rendered | **PASSED** |
| **TC013** | Station Filtering | Functional / Interactive | Column header: "Temperature" | Table rows reordered according to numeric temp | Rows sorted by temperature | **PASSED** |
| **TC014** | Automation Settings | Positive / Functional | Toggle switch: "Auto-refresh dashboard" | State persists to backend and survives navigation | Setting state retained after routing | **PASSED** |

---

## 2. Keyword-Driven Test Results (`test_keyword_driven.py`)

Executed via `testing/keywords/keyword_engine.py` reading from `testing/data/keyword_tests.csv`:

| Test ID | Keyword Scenario | Key Steps Executed | Expected Behavior | Status |
| ------- | ---------------- | ------------------ | ----------------- | ------ |
| **KTC001** | Admin Authentication | `OPEN_APP` -> `ENTER_USERNAME` -> `ENTER_PASSWORD` -> `CLICK_SUBMIT_LOGIN` -> `VERIFY_LOGIN_SUCCESS` -> `LOGOUT` | Admin logged in and verified | **PASSED** |
| **KTC002** | Invalid Credential Rejection | `OPEN_APP` -> `ENTER_USERNAME` -> `ENTER_PASSWORD` -> `CLICK_SUBMIT_LOGIN` -> `VERIFY_LOGIN_ERROR` | Rejection banner validated | **PASSED** |
| **KTC003** | Station Search & Empty State | `OPEN_APP` -> `SELECT_DEMO_ROLE` -> `NAVIGATE_TO` -> `SEARCH_STATIONS` (Delhi) -> `VERIFY_STATION_RESULTS` -> `SEARCH_STATIONS` (NonExistent) -> `VERIFY_STATION_RESULTS` (Empty) | Query and empty state verified | **PASSED** |
| **KTC004** | Advisory Approval Workflow | `OPEN_APP` -> `SELECT_DEMO_ROLE` -> `NAVIGATE_TO` -> `SELECT_AUDIENCE_TAB` -> `APPROVE_ADVISORY` -> `LOGOUT` | Advisory reviewed and approved | **PASSED** |

---

## 3. Data-Driven Test Results (`test_data_driven.py`)

Parametrized execution reading 20 records across `valid_data.csv`, `invalid_data.csv`, and `boundary_data.csv`:

| Dataset Category | Records | Features Tested | Result |
| ---------------- | ------- | --------------- | ------ |
| **Valid Data** (`valid_data.csv`) | 10 | Authentication, Station Search, Advisory Review, Settings | **10 / 10 PASSED** |
| **Invalid Data** (`invalid_data.csv`) | 5 | Bad passwords, Nonexistent users, Bogus city search | **5 / 5 PASSED** |
| **Boundary Data** (`boundary_data.csv`) | 5 | Empty credentials, 100-char inputs, Prefix queries, Whitespace searches | **5 / 5 PASSED** |

---

## 4. Test Evidence & Artifacts

- **HTML Test Report:** `testing/reports/test_report.html` (Generated via `pytest-html` containing individual durations, metadata, and assertion details)
- **Screenshots:** Stored in `testing/reports/screenshots/` (15+ execution and boundary screenshots captured for audit and submission evidence)
