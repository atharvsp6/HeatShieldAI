export type Severity = "normal" | "watch" | "heatwave" | "severe";

export type Role = "ADMIN" | "METEOROLOGIST" | "AUTHORITY" | "CITIZEN";

export interface User {
  name: string;
  role: Role;
  initials: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  sub: string;
  icon: string;
}

export interface TempPoint {
  time: string;
  observed: number | null;
  forecast: number | null;
  normalLow: number;
  normalHigh: number;
}

export interface Region {
  id: string;
  name: string;
  severity: Severity;
  temp: number;
  forecast: number;
  departure: number;
  station: string;
  x: number; // map coords (0-100)
  y: number;
  updated: string;
}

export type AlertStatus = "active" | "acknowledged" | "resolved";
export type AlertLevel = "critical" | "high" | "medium";

export interface Alert {
  id: string;
  level: AlertLevel;
  region: string;
  temp: number;
  message: string;
  time: string;
  status: AlertStatus;
}

export interface ActivityItem {
  id: string;
  type: "forecast" | "observation" | "classification" | "advisory" | "system";
  text: string;
  time: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  region: string;
  temp: number | null;
  humidity: number | null;
  status: "online" | "warning" | "offline";
  lastObs: string;
  signal?: number; // 0-4, optional as backend doesn't provide this
}

export interface ForecastRow {
  date: string;
  region: string;
  predicted: number;
  observed: number | null;
  risk: Severity;
}

export interface HeatEvent {
  id: string;
  region: string;
  severity: Severity;
  observed: number | null;
  forecast: number;
  departure: number;
  started: string;
  status: "active" | "resolved";
  station: string;
  population: string;
  peak: number | null;
  duration: string;
  narrative: string;
}

export type AudienceKey = "CITIZENS" | "AUTHORITIES" | "FARMERS" | "HEALTHCARE";

export interface Advisory {
  id: string;
  audience: AudienceKey;
  severity: Severity;
  region: string;
  generated: string;
  text: string;
  status: "pending" | "approved" | "rejected";
}

export interface ValidationRow {
  region: string;
  predicted: number;
  observed: number;
  error: number;
  status: "good" | "fair" | "poor";
}

export interface ScatterPoint {
  predicted: number;
  observed: number;
  region: string;
}
