import type { ForecastRow, TempPoint } from "../../types";

export const forecastSeries: TempPoint[] = [
  { time: "Mar 24", observed: 38.1, forecast: 38.4, normalLow: 33, normalHigh: 37 },
  { time: "Mar 25", observed: 39.6, forecast: 39.2, normalLow: 33, normalHigh: 37 },
  { time: "Mar 26", observed: 41.2, forecast: 41.6, normalLow: 34, normalHigh: 38 },
  { time: "Mar 27", observed: 42.6, forecast: 42.9, normalLow: 34, normalHigh: 38 },
  { time: "Mar 28", observed: 45.2, forecast: 44.7, normalLow: 34, normalHigh: 39 },
  { time: "Mar 29", observed: null, forecast: 46.1, normalLow: 34, normalHigh: 39 },
  { time: "Mar 30", observed: null, forecast: 45.4, normalLow: 34, normalHigh: 39 },
  { time: "Mar 31", observed: null, forecast: 43.8, normalLow: 34, normalHigh: 39 },
  { time: "Apr 01", observed: null, forecast: 41.2, normalLow: 33, normalHigh: 38 },
];

export const forecastRows: ForecastRow[] = [
  { date: "Mar 28", region: "Delhi", predicted: 44.7, observed: 45.2, risk: "severe" },
  { date: "Mar 28", region: "Jaipur", predicted: 43.4, observed: 43.8, risk: "heatwave" },
  { date: "Mar 28", region: "Ahmedabad", predicted: 43.9, observed: 43.1, risk: "heatwave" },
  { date: "Mar 28", region: "Nagpur", predicted: 43.0, observed: 42.9, risk: "heatwave" },
  { date: "Mar 29", region: "Delhi", predicted: 46.1, observed: null, risk: "severe" },
  { date: "Mar 29", region: "Lucknow", predicted: 43.0, observed: null, risk: "heatwave" },
  { date: "Mar 29", region: "Pune", predicted: 40.8, observed: null, risk: "watch" },
  { date: "Mar 29", region: "Bengaluru", predicted: 34.0, observed: null, risk: "normal" },
  { date: "Mar 30", region: "Delhi", predicted: 45.4, observed: null, risk: "severe" },
  { date: "Mar 30", region: "Bhopal", predicted: 41.0, observed: null, risk: "watch" },
];

export const forecastSummary = {
  predictedMax: 46.1,
  heatwaveRisk: "SEVERE" as const,
  departure: 5.4,
  confidence: 91,
};
