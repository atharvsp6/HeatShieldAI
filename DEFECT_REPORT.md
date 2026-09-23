# HeatShield AI — STQA Defect Report

**Project:** HeatShield AI (STQA Automated Testing)  
**Target Environment:** Deployed Web Application (`https://heatshield.atharvpatil.me`)  
**Backend Environment:** Render Fastify/PostgreSQL API (`https://heatshield-backend-so9r.onrender.com`)  
**Assessment Date:** September 2026  
**Defects Discovered:** 5 Genuine Defect(s) Discovered (No application code was altered to mask defects)

---

## Defect Summary Table

| Defect ID | Component / Source File | Severity | Title | Status |
| --------- | ----------------------- | -------- | ----- | ------ |
| **DEF001** | `frontend/src/components/validation/ErrorTrend.tsx` | High | Blank ML Error Trend Chart due to dataKey property mismatch | Documented |
| **DEF002** | `frontend/src/pages/Forecasts.tsx` | Medium | Forecast chart empty by default due to `"Delhi NCR"` vs `"Delhi"` region naming mismatch | Documented |
| **DEF003** | `backend/main.py` (`/api/forecasts`) | Medium | Forecast comparison table always displays `—` for Observed temperature | Documented |
| **DEF004** | `frontend/src/pages/Heatwaves.tsx` | Low | Heatwave drawer displays disconnected mock placeholders for population and narrative | Documented |
| **DEF005** | `frontend/src/App.tsx` | Medium | Session state reset to login screen on page refresh despite valid stored token | Documented |

---

## Detailed Defect Specifications

### DEF001: Blank ML Error Trend Chart due to dataKey property mismatch

* **Test Scenario:** Inspect ML Model Validation performance chart
* **Component:** `frontend/src/components/validation/ErrorTrend.tsx:28`
* **API Traced:** `GET /api/model/metrics`
* **Severity:** **High** (Key analytical feature unusable)
* **Description:**
  In `ErrorTrend.tsx:28`, the Recharts `<Line />` component specifies `dataKey="observed"`. However, inspecting `frontend/src/services/api.ts:499` shows that the response from `/api/model/metrics` is mapped to objects with keys `{ time, mae }`. Because `"observed"` is undefined on the transformed data array, Recharts cannot plot any points, causing the error trend chart to render completely blank.
* **Steps to Reproduce:**
  1. Log in with Meteorologist credentials.
  2. Click on **Model Validation** in the sidebar navigation.
  3. Scroll to the **Error Trend Over Validation Windows** panel.
* **Expected Result:** A continuous line chart plotting error metrics across observation timestamps.
* **Actual Result:** The chart bounding box and grid render, but the chart body is empty with no visible line series.

---

### DEF002: Forecast chart empty by default due to region naming discrepancy

* **Test Scenario:** View regional temperature forecasts on Forecasts page
* **Component:** `frontend/src/pages/Forecasts.tsx:16` & `backend/main.py:171`
* **API Traced:** `GET /api/forecasts?region=Delhi%20NCR`
* **Severity:** **Medium** (Degraded user experience upon initial page view)
* **Description:**
  `Forecasts.tsx` initializes the region state filter with `useState("Delhi NCR")`. However, database seeding (`backend/main.py:171`) and telemetry ingestion store the region string strictly as `"Delhi"`. When the page issues `GET /api/forecasts?region=Delhi%20NCR`, the backend filters return 0 records.
* **Steps to Reproduce:**
  1. Log in to HeatShield AI.
  2. Click on **Forecasts** in the sidebar navigation.
  3. Observe the 7-day temperature projection chart.
* **Expected Result:** Chart immediately displays predicted temperature curves for Delhi.
* **Actual Result:** Chart renders empty with 0 plotted points until the user manually changes the dropdown to a different region.

---

### DEF003: Forecast table "Observed" column always renders em-dash (`—`)

* **Test Scenario:** Historical forecast verification against ground truth
* **Component:** `frontend/src/pages/Forecasts.tsx:161` & `backend/main.py:230`
* **API Traced:** `GET /api/forecasts`
* **Severity:** **Medium** (Missing forecast verification telemetry)
* **Description:**
  In the Forecasts table, the "Observed" column is designed to display actual temperatures alongside predicted values. The backend endpoint `/api/forecasts` queries the `Forecast` table directly without joining against historical weather observations from the `WeatherStation` or `Observation` tables, returning `null` for every row.
* **Steps to Reproduce:**
  1. Log in and navigate to **Forecasts**.
  2. Scroll down to the tabular forecast log.
  3. Inspect the **Observed** column.
* **Expected Result:** Past timestamps show the ground-truth observed temperature for validation.
* **Actual Result:** The Observed column displays `—` for 100% of rows.

---

### DEF004: Heatwave drawer displays disconnected mock placeholders

* **Test Scenario:** Heatwave event detail inspection
* **Component:** `frontend/src/pages/Heatwaves.tsx:189-195`
* **Severity:** **Low** (Incomplete UI implementation)
* **Description:**
  Clicking any historical heatwave event opens an inspection drawer. The drawer template contains stat cards for "Affected Population", "Peak Temperature Recorded", and "Meteorological Synopsis", but displays hardcoded `—` placeholders because the backend schema (`backend/models.py`) only tracks `start_date`, `end_date`, `severity`, and `region`.
* **Steps to Reproduce:**
  1. Navigate to **Heatwave Events**.
  2. Click on any heatwave card (e.g. "April 2024 Northern Plains Heatwave").
  3. Inspect drawer right-side panel.
* **Expected Result:** Populated impact numbers and synopsis.
* **Actual Result:** Shows `—` for population and unpopulated synopsis.

---

### DEF005: Session state reset to login screen on page reload

* **Test Scenario:** Browser refresh / page reload retention
* **Component:** `frontend/src/App.tsx:29`
* **Severity:** **Medium** (User inconvenience)
* **Description:**
  The `user` authentication state is maintained purely in React component state (`useState<User | null>(null)`). Although `api.login()` saves the bearer token to `localStorage.getItem("token")`, `App.tsx` has no startup `useEffect` to validate the cached token or restore the user object. Pressing `Cmd+R` / `F5` immediately reverts the app to the `<Login />` view.
* **Steps to Reproduce:**
  1. Log in successfully as `admin`.
  2. Observe the Dashboard overview.
  3. Reload the browser page (`F5`).
* **Expected Result:** Session is maintained, dashboard remains visible.
* **Actual Result:** Application displays the login screen again.
