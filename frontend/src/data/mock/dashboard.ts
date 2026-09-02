import type { ActivityItem, Kpi, TempPoint } from "../../types";

export const kpis: Kpi[] = [
  {
    id: "max",
    label: "Current Max",
    value: "42.6",
    unit: "°C",
    delta: "+3.8°C",
    deltaTone: "up",
    sub: "vs seasonal normal",
    icon: "thermometer",
  },
  {
    id: "regions",
    label: "Heatwave Regions",
    value: "03",
    delta: "2 severe",
    deltaTone: "up",
    sub: "under active classification",
    icon: "flame",
  },
  {
    id: "alerts",
    label: "Active Alerts",
    value: "07",
    delta: "3 critical",
    deltaTone: "up",
    sub: "across 5 districts",
    icon: "bell",
  },
  {
    id: "stations",
    label: "AWS Stations",
    value: "18 / 20",
    delta: "90% online",
    deltaTone: "neutral",
    sub: "2 reporting faults",
    icon: "radio",
  },
];

// 24h observed, then forecast horizon
export const tempSeries: TempPoint[] = [
  { time: "00:00", observed: 31.2, forecast: null, normalLow: 27, normalHigh: 33 },
  { time: "03:00", observed: 29.4, forecast: null, normalLow: 26, normalHigh: 32 },
  { time: "06:00", observed: 30.8, forecast: null, normalLow: 27, normalHigh: 33 },
  { time: "09:00", observed: 36.5, forecast: null, normalLow: 31, normalHigh: 36 },
  { time: "12:00", observed: 40.9, forecast: null, normalLow: 34, normalHigh: 39 },
  { time: "15:00", observed: 42.6, forecast: 42.6, normalLow: 35, normalHigh: 40 },
  { time: "18:00", observed: null, forecast: 41.2, normalLow: 33, normalHigh: 38 },
  { time: "21:00", observed: null, forecast: 36.4, normalLow: 30, normalHigh: 35 },
  { time: "Tue", observed: null, forecast: 43.8, normalLow: 34, normalHigh: 39 },
  { time: "Wed", observed: null, forecast: 44.9, normalLow: 34, normalHigh: 39 },
  { time: "Thu", observed: null, forecast: 43.1, normalLow: 34, normalHigh: 39 },
  { time: "Fri", observed: null, forecast: 40.6, normalLow: 33, normalHigh: 38 },
];

export const activity: ActivityItem[] = [
  { id: "a1", type: "forecast", text: "AI forecast generated for North-West zone (72h horizon)", time: "2 min ago" },
  { id: "a2", type: "observation", text: "AWS-07 Delhi observation received — 45.2°C", time: "6 min ago" },
  { id: "a3", type: "classification", text: "Jaipur reclassified NORMAL → HEATWAVE", time: "18 min ago" },
  { id: "a4", type: "advisory", text: "Healthcare advisory approved for Delhi NCR", time: "34 min ago" },
  { id: "a5", type: "system", text: "Model v2.4 validation batch completed — MAE 0.82°C", time: "1 hr ago" },
  { id: "a6", type: "observation", text: "AWS-14 Nagpur observation received — 42.9°C", time: "1 hr ago" },
];
