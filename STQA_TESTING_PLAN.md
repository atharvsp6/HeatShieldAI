# STQA Testing Plan: HeatShield AI Web Application

## 1. Candidate Features Analysis & End-to-End Traceability

Each candidate feature in the HeatShield AI platform was analyzed across the full stack: from the user interface component through the network API layer, backend database/model processing, and back to the rendered client output.

| Feature | Frontend | Backend/API | Input | Output | End-to-End Working | Suitable for Testing |
|---|---|---|---|---|---|---|
| **User Authentication & Role Access** | `Login.tsx` | `POST /api/auth/login` | Username, Password (or Demo Role button) | JWT token, User profile, Sidebar badge | **YES** | **YES** (Stable IDs `#login-username`, `#login-password`, deterministic states) |
| **Advisory Lifecycle (Approve & Reject)** | `Advisories.tsx` | `POST /api/advisories/{id}/approve`, `POST /api/advisories/{id}/reject` | Advisory selection, "Approve" / "Reject" button click | Status badge transitions to `APPROVED` or `REJECTED`, persistent DB update | **YES** | **YES** (Clear state machine, verified persistence in PostgreSQL) |
| **Weather Station Search & Filtering** | `Stations.tsx` | `GET /api/stations` | Search query string, Status dropdown, Region dropdown | Filtered station table rows, live temperatures, empty state | **YES** | **YES** (Interactive data table with search, sorting, and multi-filter criteria) |
| **Platform Automation Settings** | `Settings.tsx` | `GET /api/settings`, `PUT /api/settings` | Toggle switch clicks (`notifications_enabled`, `auto_refresh`, etc.) | Switch state translation, teal highlight, persistent DB setting | **YES** | **YES** (Standard W3C accessible `role="switch"` and `aria-checked` states) |
| **On-Demand Forecast Generation** | `Forecasts.tsx` | `POST /api/forecasts/generate` | "Generate Forecast" button click | Re-runs ML Random Forest predictions, updates forecasts table | **YES** | **PARTIAL** (Heavy computational pipeline; table has missing observed data) |
| **Forecast Period & Model Selectors** | `Forecasts.tsx` | None (Disconnected) | Period dropdown (72h/7d/14d), Model dropdown (HeatNet v2.4/v2.3) | None (ignored by backend prediction engine) | **NO** | **NO** (UI aesthetic only; parameters are not transmitted to backend) |
| **Forecast Region Filter (Delhi)** | `Forecasts.tsx` | `GET /api/forecasts` | Selecting "Delhi NCR" from Region dropdown | Empty chart (name mismatch: "Delhi NCR" vs "Delhi") | **NO (BROKEN)** | **NO** (Defect in region naming prevents rendering) |
| **Heatwave Incident Drawer Details** | `Heatwaves.tsx` | `GET /api/heatwaves` | Card click to open slide-out drawer | Static mock placeholders (`population: "—"`, `peak: null`, `narrative: "—"`) | **PARTIAL** | **NO** (Contains hardcoded placeholder fields not backed by DB) |
| **Validation Error Trend Bar Chart** | `Validation.tsx` | `GET /api/validation` | Page load | Blank/zero-height bars due to key mismatch (`mae` vs `observed`) | **NO (BROKEN)** | **NO** (Defect prevents rendering actual error values) |
| **Live Weather Data Ingestion** | None (UI-less) | `POST /api/weather/ingest` | None in UI (Function exists in `api.ts` only) | Ingests real Open-Meteo observations | **BACKEND ONLY** | **NO** (No user-facing UI trigger exists) |
| **Model Retraining Trigger** | None (UI-less) | `POST /api/ml/train` | None in UI (Function exists in `api.ts` only) | Retrains Random Forest model | **BACKEND ONLY** | **NO** (No user-facing UI trigger exists) |
| **Station Signal Strength Bars** | `Stations.tsx` | None | None | Signal bars always render `—` | **UI ONLY** | **NO** (Hardware RSSI/signal not implemented in backend schema) |

---

## 2. Selected Features for STQA Automation

Based on rigorous end-to-end verification, the following **4 features** have been selected as the best fully functional, stable candidates practical for Selenium automated testing:

### SELECTED FEATURE 1: User Authentication & Role Access
* **Frontend:** `Login.tsx`
* **Backend API:** `POST /api/auth/login`
* **Why Selected:** Fully functional end-to-end authentication with bcrypt verification and JWT generation. Has stable element IDs (`#login-username`, `#login-password`, `#demo-role-*`) and deterministic success and error states.

### SELECTED FEATURE 2: Advisory Review (Approve & Reject Workflow)
* **Frontend:** `Advisories.tsx`
* **Backend API:** `POST /api/advisories/{id}/approve`, `POST /api/advisories/{id}/reject`, `GET /api/advisories`
* **Why Selected:** Core operational feature of the platform. Demonstrates real-time state machine transitions (`pending` -> `approved` or `rejected`) with database persistence and visual feedback.

### SELECTED FEATURE 3: Weather Station Search & Filtering
* **Frontend:** `Stations.tsx`
* **Backend API:** `GET /api/stations`
* **Why Selected:** High-value data presentation component. Validates real-time client-side text filtering against dynamic database records, verifies table row counts, and tests empty state handling.

### SELECTED FEATURE 4: Automation & Notification Settings Persistence
* **Frontend:** `Settings.tsx`
* **Backend API:** `GET /api/settings`, `PUT /api/settings`
* **Why Selected:** Directly tests user preferences persistence across sessions with standard accessible selectors (`role="switch"`, `aria-checked="true|false"`).

---

## 3. Features Intentionally Excluded & Justification

1. **Validation Error Trend Chart (`Validation.tsx`):**
   * *Reason:* Discovered a confirmed code defect. `api.ts` returns `{ time, mae }`, but `ErrorTrend.tsx` binds to `dataKey="observed"`. The chart renders empty zero-height bars.
2. **Forecast Region Filter (`Forecasts.tsx`):**
   * *Reason:* Discovered a naming defect. The frontend hardcodes option label `"Delhi NCR"`, while the backend returns `"Delhi"`. Filtering for Delhi results in 0 matches and an empty chart.
3. **Forecast Detail Table (`Forecasts.tsx`):**
   * *Reason:* The backend `/api/forecasts` endpoint does not join observed historical readings, causing the "Observed" column to display static `—` and "Difference" to remain permanently `pending`.
4. **Heatwave Incident Details Drawer (`Heatwaves.tsx`):**
   * *Reason:* The slide-out drawer displays hardcoded placeholders (`population: "—"`, `peak: null`, `narrative: "—"`) that do not exist in the backend schema.
5. **Weather Ingestion & ML Retraining APIs (`/api/weather/ingest`, `/api/ml/train`):**
   * *Reason:* The backend endpoints and TypeScript client functions exist, but no user-facing buttons or controls were implemented in the UI.
6. **Station Signal Strength Bars (`Stations.tsx`):**
   * *Reason:* Purely aesthetic mock; backend telemetry does not provide signal strength.
