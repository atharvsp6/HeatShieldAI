export type PageKey =
  | "overview"
  | "forecasts"
  | "stations"
  | "heatwaves"
  | "alerts"
  | "advisories"
  | "validation"
  | "settings";

export interface NavItem {
  key: PageKey;
  label: string;
  icon: string;
  title: string;
  desc: string;
}

export const navItems: NavItem[] = [
  { key: "overview", label: "Overview", icon: "layout-dashboard", title: "Heat Intelligence Overview", desc: "Real-time regional risk, forecast signals and early warnings." },
  { key: "forecasts", label: "Forecast Intelligence", icon: "line-chart", title: "Forecast Intelligence", desc: "AI temperature forecasts and model-driven risk projection." },
  { key: "stations", label: "Weather Stations", icon: "radio-tower", title: "Weather Stations", desc: "Automated weather station network health and observations." },
  { key: "heatwaves", label: "Heatwave Events", icon: "flame", title: "Heatwave Events", desc: "Active and historical heatwave incident monitoring." },
  { key: "alerts", label: "Alerts", icon: "bell-ring", title: "Alert Center", desc: "Prioritised heat alerts across all monitored regions." },
  { key: "advisories", label: "Advisories", icon: "megaphone", title: "Advisory Center", desc: "Stakeholder communication and public-safety advisories." },
  { key: "validation", label: "Validation", icon: "target", title: "Forecast Validation", desc: "Model accuracy, error analysis and prediction fidelity." },
];

export const systemItems: NavItem[] = [
  { key: "settings", label: "Settings", icon: "settings", title: "Settings", desc: "Platform configuration and preferences." },
];
