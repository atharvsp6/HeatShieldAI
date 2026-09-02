import type { ScatterPoint, TempPoint, ValidationRow } from "../../types";

export const validationMetrics = {
  accuracy: 94.2,
  mae: 0.82,
  rmse: 1.14,
  bias: -0.19,
};

export const validationRows: ValidationRow[] = [
  { region: "Delhi", predicted: 44.7, observed: 45.2, error: 0.5, status: "good" },
  { region: "Jaipur", predicted: 43.4, observed: 43.8, error: 0.4, status: "good" },
  { region: "Ahmedabad", predicted: 43.9, observed: 43.1, error: -0.8, status: "good" },
  { region: "Nagpur", predicted: 43.0, observed: 42.9, error: -0.1, status: "good" },
  { region: "Lucknow", predicted: 41.8, observed: 42.4, error: 0.6, status: "good" },
  { region: "Bhopal", predicted: 40.1, observed: 40.2, error: 0.1, status: "good" },
  { region: "Pune", predicted: 41.3, observed: 39.4, error: -1.9, status: "fair" },
  { region: "Hyderabad", predicted: 41.6, observed: 39.9, error: -1.7, status: "fair" },
  { region: "Kolkata", predicted: 41.2, observed: 38.6, error: -2.6, status: "poor" },
  { region: "Chennai", predicted: 36.0, observed: 35.4, error: -0.6, status: "good" },
];

export const scatterData: ScatterPoint[] = validationRows.map((r) => ({
  predicted: r.predicted,
  observed: r.observed,
  region: r.region,
}));

// error over time for the accuracy trend
export const errorTrend: TempPoint[] = [
  { time: "Mar 21", observed: 0.9, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 22", observed: 0.7, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 23", observed: 1.1, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 24", observed: 0.6, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 25", observed: 0.8, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 26", observed: 0.5, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 27", observed: 0.9, forecast: null, normalLow: 0, normalHigh: 0 },
  { time: "Mar 28", observed: 0.82, forecast: null, normalLow: 0, normalHigh: 0 },
];
