You are a senior product designer and frontend engineer.

Build ONLY the frontend UI for a project called:

HEATSHIELD
AI Heatwave Intelligence & Early Warning Platform

I already have a backend/application being developed separately.
DO NOT build or modify any backend.
DO NOT implement database logic.
DO NOT implement authentication APIs.
DO NOT create FastAPI endpoints.

Your job is to create an exceptionally polished, production-quality
frontend that I will later integrate with an existing backend.

==================================================
PRODUCT VISION
==================================================

HeatShield is a climate intelligence and heatwave early-warning platform.

It monitors:
- Automated Weather Stations (AWS)
- Temperature and humidity
- Regional heat conditions
- AI temperature forecasts
- Heatwave severity
- Alerts
- Stakeholder advisories
- Forecast accuracy

The product should feel like a combination of:

- professional weather intelligence platform
- disaster management command center
- modern AI analytics product
- government/public safety monitoring system

It must NOT look like:
- a basic college CRUD project
- a generic SaaS dashboard
- an AI-generated template
- a collection of random cards
- an overly futuristic neon dashboard

==================================================
DESIGN DIRECTION
==================================================

Create a premium, highly polished visual design.

Overall aesthetic:

"Climate Intelligence Command Center"

Use a sophisticated dark interface.

Primary palette:
- deep navy / near-black backgrounds
- slate surfaces
- cool cyan/teal accents
- warm amber/orange for warnings
- red only for severe/critical heat conditions
- white and muted gray typography

Use color intentionally.

The interface should have strong hierarchy and excellent spacing.

Use subtle:
- borders
- shadows
- gradients
- background textures
- glass effects where appropriate

BUT DO NOT overuse glassmorphism, gradients, glow or neon effects.

The result should look like a real product designed by a professional
product design team.

==================================================
TECHNOLOGY
==================================================

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts for charts
- Lucide React for icons
- Leaflet/react-leaflet for maps if practical

Use reusable components.

Create a clean component architecture.

Use mock data for now.

IMPORTANT:
All mock data must be structured in a way that can easily be replaced
later by REST API responses.

For example:

services/
  api.ts

mock/
  dashboard.ts
  forecasts.ts
  stations.ts
  alerts.ts
  advisories.ts

Do NOT hard-code data directly throughout UI components.

==================================================
APPLICATION STRUCTURE
==================================================

Create the following pages:

1. Login
2. Dashboard
3. Forecast Intelligence
4. Weather Stations
5. Heatwave Events
6. Alerts
7. Advisories
8. Forecast Validation

Use a consistent application shell.

==================================================
LOGIN PAGE
==================================================

Create a visually impressive but minimal login page.

Do NOT use the huge horizontal login card design.

Use a sophisticated split-screen composition.

LEFT ~55%:

Create the HeatShield brand experience.

Include:

HEATSHIELD

"AI-powered heat intelligence & early warning"

A concise statement explaining:

"Turn weather signals into actionable intelligence before extreme heat
becomes a public health emergency."

Show 3 small capabilities:

• Live heatwave monitoring
• AI temperature forecasting
• Action-ready early warnings

Add a subtle visual representation of:
- India
- temperature contours
- heatwave zones
- weather signals

This should be elegant and subtle, not a giant illustration.

RIGHT ~45%:

Compact login panel.

"Welcome back"

Username
Password

Sign In

Then a small:

"Demo access"

with four compact role options:

ADMIN
METEOROLOGIST
AUTHORITY
CITIZEN

The login page should fit comfortably in one viewport.

==================================================
MAIN APPLICATION SHELL
==================================================

After login, create:

LEFT SIDEBAR

Logo:

HEATSHIELD
Climate Intelligence

Navigation:

Overview
Forecast Intelligence
Weather Stations
Heatwave Events
Alerts
Advisories
Validation

Separate section:

SYSTEM
Settings

Bottom:

User avatar
Name
Role
Logout

Sidebar should be approximately 240px wide.

Allow collapsing it on smaller screens.

TOP HEADER

Left:
Current page title
Short description

Right:
Search
Notifications
Current date
User avatar

==================================================
DASHBOARD
==================================================

This must be the strongest page.

Header:

"Heat Intelligence Overview"

Subtitle:

"Real-time regional risk, forecast signals and early warnings."

At top, include a small status indicator:

● SYSTEM OPERATIONAL
Last updated: 2 min ago

--------------------------------------------------

KPI ROW

Create 4 sophisticated KPI cards:

CURRENT MAX
42.6°C
+3.8°C vs normal

HEATWAVE REGIONS
03
2 severe

ACTIVE ALERTS
07
3 critical

AWS STATIONS
18 / 20
90% online

Do not make these giant cards.

They should be compact and information dense.

--------------------------------------------------

MAIN ANALYTICS AREA

LEFT ~65%:

Temperature Intelligence chart.

Show:

Observed
Forecast
Normal range

Use a beautiful Recharts visualization.

Include:
- temperature axis
- time axis
- legend
- tooltip
- °C

RIGHT ~35%:

"Regional Heat Risk"

Show ranked regions:

Delhi
SEVERE
45.2°C

Jaipur
HEATWAVE
43.8°C

Nagpur
HEATWAVE
42.9°C

Pune
WATCH
39.4°C

Use clear severity indicators.

--------------------------------------------------

HEATWAVE MAP

Make this a major visual section.

Title:

"Regional Heatwave Map"

Subtitle:

"Current heat risk across monitored regions"

Show an India map with regional markers.

Markers should communicate:

NORMAL
WATCH
HEATWAVE
SEVERE

Include a compact legend.

Clicking a region should show:

Region
Current temperature
Forecast temperature
Severity
AWS station
Last updated

--------------------------------------------------

BOTTOM SECTION

Two columns:

LEFT:

"Recent Alerts"

Display 5 alerts with:

severity
location
temperature
time
status

RIGHT:

"System Activity"

Examples:

Forecast generated
AWS observation received
Heatwave classification updated
Advisory approved

==================================================
FORECAST INTELLIGENCE
==================================================

Create an analytics-focused page.

Top:

Region selector
Forecast period
Model selector

Then summary cards:

Predicted Maximum
Heatwave Risk
Departure from Normal
Model Confidence

Main chart:

Observed vs Forecast Temperature

Below:

Forecast table

Date
Region
Predicted
Observed
Difference
Risk

Use professional data visualization.

==================================================
WEATHER STATIONS
==================================================

Create a monitoring dashboard rather than a basic CRUD table.

Top summary:

Total Stations
Online
Warning
Offline

Then:

Station Monitoring Table

Columns:

Station
Region
Temperature
Humidity
Status
Last Observation
Signal

Add:
Search
Region filter
Status filter

Use status badges.

Include a small map/overview section if visually useful.

==================================================
HEATWAVE EVENTS
==================================================

Create a serious incident-monitoring page.

Top summary:

Active Events
Severe
Heatwave
Resolved

Event cards/table:

Region
Severity
Observed Temp
Forecast Temp
Departure
Started
Status

Allow filtering.

Clicking an event should open a polished detail drawer/modal.

==================================================
ALERTS
==================================================

Create an alert center.

Top:

Critical
High
Medium
Resolved

Main alert list.

Each alert should have:

severity indicator
region
temperature
message
timestamp
status

Include:
All
Critical
High
Medium
Resolved

filters.

Critical alerts should be visually distinct without making the entire
interface red.

==================================================
ADVISORIES
==================================================

Create a professional stakeholder communication interface.

Header:

"Advisory Center"

Tabs:

CITIZENS
AUTHORITIES
FARMERS
HEALTHCARE

Each advisory card:

Heatwave severity
Region
Generated time
Advisory text
Status

Actions:

Approve
Reject
Regenerate

Use realistic advisory content.

==================================================
VALIDATION
==================================================

Create an ML/model validation page.

Header:

"Forecast Validation"

Show:

Prediction Accuracy
MAE
RMSE
Bias

Main visualization:

Predicted vs Observed Temperature

Include a table:

Region
Predicted
Observed
Error
Status

Use green/amber/red indicators intelligently.

==================================================
INTERACTIONS
==================================================

The prototype should feel like a real application.

Implement:

- sidebar navigation
- active navigation states
- dropdowns
- filters
- tabs
- search
- modals/drawers
- tooltips
- hover states
- notification panel
- responsive sidebar
- table sorting where appropriate
- realistic loading states
- empty states
- error states

Use mock data to make all interactions demonstrable.

==================================================
MICRO-INTERACTIONS
==================================================

Use subtle animations.

Examples:

- page transitions
- card hover
- chart transitions
- sidebar transitions
- modal appearance
- button feedback
- alert appearance

Keep animations fast and professional.

Do NOT make the application flashy.

==================================================
TYPOGRAPHY
==================================================

Use a modern professional font such as Inter or another highly readable
UI font.

Hierarchy should be obvious:

Page title
Section title
Metric
Supporting text
Metadata

Avoid oversized typography.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop must look excellent first.

Also support:

1440px
1280px
1024px
768px
mobile

On smaller screens:
- sidebar collapses
- KPI cards stack
- charts resize
- tables become horizontally scrollable or transform appropriately
- map remains usable

==================================================
ACCESSIBILITY
==================================================

Use:

- semantic HTML
- accessible labels
- keyboard navigation
- visible focus states
- sufficient contrast
- aria labels where necessary

==================================================
CODE QUALITY
==================================================

Create reusable components.

Suggested structure:

src/
  components/
    layout/
    navigation/
    cards/
    charts/
    maps/
    tables/
    alerts/
    ui/

  pages/
    Login/
    Dashboard/
    Forecasts/
    Stations/
    Heatwaves/
    Alerts/
    Advisories/
    Validation/

  data/
    mock/

  services/
    api.ts

  types/

  hooks/

  utils/

Avoid putting huge amounts of code into a single component.

==================================================
MOST IMPORTANT REQUIREMENT
==================================================

I care MUCH MORE about visual quality than about adding extra features.

Before finishing, inspect every page and ask:

"Does this look like a real climate intelligence product?"

If not, improve it.

The UI must have:

- excellent spacing
- strong hierarchy
- consistent components
- sophisticated charts
- useful information density
- polished empty/loading states
- professional color usage
- beautiful navigation
- realistic data
- excellent visual balance

DO NOT create a generic dashboard with:

"4 cards + 1 chart + 1 table"

repeated everywhere.

Each page should have its own information hierarchy while maintaining
the same design system.

==================================================
FINAL REQUIREMENT
==================================================

Build the frontend completely.

Use realistic mock data.

Make it runnable with:

npm install
npm run dev

Do not wait for backend integration.

Do not ask me to provide API endpoints.

The frontend must work independently with mock data.

Keep the API/data layer clean so I can later replace mock functions
with my existing HeatShield backend APIs.

At the end, verify that:
- every route works
- navigation works
- charts render
- map renders
- mock data renders
- no console errors exist
- responsive layouts work
- login → dashboard flow works

Focus on making this frontend visually exceptional.