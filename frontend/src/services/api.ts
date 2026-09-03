/**
 * HeatShield data-access layer.
 *
 * Every function here returns a Promise, mirroring how a REST client behaves.
 * To integrate the real backend later, replace the mock body of each function
 * with a `fetch()` / axios call to the corresponding endpoint — the component
 * layer consumes these Promises and does not depend on the mock source.
 *
 * e.g.  export const getDashboardKpis = () => http.get<Kpi[]>("/dashboard/kpis")
 */
import { activity, kpis, tempSeries } from "../data/mock/dashboard";
import { regions } from "../data/mock/regions";
import { alerts } from "../data/mock/alerts";
import { stations } from "../data/mock/stations";
import { forecastRows, forecastSeries, forecastSummary } from "../data/mock/forecasts";
import { heatEvents } from "../data/mock/heatwaves";
import { advisories } from "../data/mock/advisories";
import { errorTrend, scatterData, validationMetrics, validationRows } from "../data/mock/validation";
import type { Alert, Station, ActivityItem, Kpi, TempPoint, Region, AlertLevel, AlertStatus } from "../types";

const LATENCY = 450;

function respond<T>(data: T, latency = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), latency));
}

// Token management
const TOKEN_KEY = "heatshield_token";
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Base fetch wrapper
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const baseUrl = import.meta.env.VITE_API_URL || "";
  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Region coordinates mapping for SVG map positioning
const REGION_COORDS: Record<string, { x: number; y: number }> = {
  Delhi: { x: 44, y: 30 },
  Jaipur: { x: 36, y: 34 },
  Nagpur: { x: 47, y: 55 },
  Ahmedabad: { x: 30, y: 47 },
  Pune: { x: 38, y: 62 },
  Kolkata: { x: 66, y: 46 },
  Chennai: { x: 50, y: 78 },
  Mumbai: { x: 30, y: 56 }, // Not in mock, estimated
};

// Cached dashboard fetcher
let dashboardCache: Promise<any> | null = null;
const getDashboardData = () => {
  if (!dashboardCache) {
    dashboardCache = fetchApi<any>("/dashboard").finally(() => {
      setTimeout(() => { dashboardCache = null; }, 5000);
    });
  }
  return dashboardCache;
};

export const api = {
  login: async (username: string, password: string) => {
    const data = await fetchApi<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access_token);
    
    // Map backend UserResponse to frontend User
    const user = data.user;
    const nameParts = user.full_name ? user.full_name.split(' ') : user.username.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
      : nameParts[0].substring(0, 2).toUpperCase();

    return {
      name: user.full_name || user.username,
      role: user.role,
      initials,
    };
  },
  
  getDashboardKpis: async (): Promise<Kpi[]> => {
    const data = await getDashboardData();
    return [
      {
        id: "max",
        label: "Current Max",
        value: data.predicted_max_temp.toString(),
        unit: "°C",
        delta: "vs",
        deltaTone: "neutral",
        sub: "predicted high",
        icon: "thermometer",
      },
      {
        id: "regions",
        label: "Heatwave Regions",
        value: data.active_heatwave_regions.toString().padStart(2, '0'),
        delta: "active",
        deltaTone: data.active_heatwave_regions > 0 ? "up" : "neutral",
        sub: "under active classification",
        icon: "flame",
      },
      {
        id: "alerts",
        label: "Active Alerts",
        value: data.active_alerts.toString().padStart(2, '0'),
        deltaTone: data.active_alerts > 0 ? "up" : "neutral",
        sub: "across regions",
        icon: "bell",
      },
      {
        id: "stations",
        label: "Weather Stations",
        value: data.station_count.toString(),
        deltaTone: "neutral",
        sub: `${data.total_observations} total observations`,
        icon: "radio",
      },
    ];
  },

  getTempSeries: async (): Promise<TempPoint[]> => {
    const data = await getDashboardData();
    return (data.temperature_trends || []).map((t: any) => ({
      time: t.date,
      observed: t.avg_temp,
      forecast: t.max_temp,
      normalLow: t.min_temp || 25,
      normalHigh: t.max_temp || 35,
    })).reverse(); // Assuming API returns recent first, chart wants chronological
  },

  getActivity: async (): Promise<ActivityItem[]> => {
    const logs = await fetchApi<any[]>("/audit-logs?limit=6");
    return logs.map((log) => {
      let type: ActivityItem["type"] = "system";
      if (log.action.includes("OBSERVATION")) type = "observation";
      else if (log.action.includes("FORECAST")) type = "forecast";
      else if (log.action.includes("ADVISORY")) type = "advisory";
      else if (log.action.includes("ALERT") || log.action.includes("CLASSIFICATION")) type = "classification";
      
      // Calculate relative time roughly
      const diffMs = new Date().getTime() - new Date(log.timestamp + "Z").getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const timeStr = diffMins < 60 ? `${diffMins} min ago` : `${Math.floor(diffMins/60)} hr ago`;

      return {
        id: log.id.toString(),
        type,
        text: log.detail || `${log.action} by ${log.user}`,
        time: timeStr,
      };
    });
  },

  getRegions: async (): Promise<Region[]> => {
    const data = await getDashboardData();
    return (data.heatwave_regions || []).map((r: any) => {
      const coords = REGION_COORDS[r.name] || { x: 50, y: 50 };
      const s = r.severity?.toLowerCase() || "normal";
      const mappedSeverity = s === "severe_heatwave" ? "severe" : s;
      return {
        id: r.id.toString(),
        name: r.name,
        severity: mappedSeverity as Region["severity"],
        temp: r.predicted_temp || r.normal_temp,
        forecast: r.predicted_temp,
        departure: r.departure,
        station: "AWS-" + r.id.toString().padStart(2, '0'),
        x: coords.x,
        y: coords.y,
        updated: "Just now",
      };
    });
  },
  getAlerts: async (): Promise<Alert[]> => {
    const data = await fetchApi<any[]>("/alerts");
    return data.map((a: any) => {
      let level: AlertLevel = "medium";
      const sev = (a.severity || "").toLowerCase();
      if (sev === "severe_heatwave" || sev === "severe") level = "critical";
      else if (sev === "heatwave") level = "high";
      
      const diffMs = new Date().getTime() - new Date(a.created_at + "Z").getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const timeStr = diffMins < 60 ? `${diffMins} mins ago` : diffMins < 1440 ? `${Math.floor(diffMins/60)} hrs ago` : `${Math.floor(diffMins/1440)} days ago`;

      return {
        id: a.id.toString(),
        level,
        region: a.region_name || `Region ${a.region_id}`,
        temp: a.temperature,
        message: a.message || a.title,
        time: timeStr,
        status: (a.status || "ACTIVE").toLowerCase() as AlertStatus,
      };
    });
  },

  getStations: async (): Promise<Station[]> => {
    const data = await fetchApi<any[]>("/stations");
    return data.map((s: any) => {
      let status: Station["status"] = "online";
      const backendStatus = (s.status || "").toLowerCase();
      if (backendStatus === "offline") status = "offline";
      else if (backendStatus === "maintenance") status = "warning";

      let lastObs = "—";
      if (s.last_updated) {
        const diffMs = new Date().getTime() - new Date(s.last_updated + "Z").getTime();
        const diffMins = Math.floor(diffMs / 60000);
        lastObs = diffMins < 60 ? `${diffMins}m ago` : diffMins < 1440 ? `${Math.floor(diffMins/60)}h ago` : `${Math.floor(diffMins/1440)}d ago`;
      }

      return {
        id: s.id.toString(),
        code: s.station_id,
        name: s.name,
        region: s.region_name || `Region ${s.region_id}`,
        temp: s.current_temp ?? null,
        humidity: s.current_humidity ?? null,
        status,
        lastObs,
        signal: undefined,
      };
    });
  },
  getForecastSeries: async (regionName?: string): Promise<TempPoint[]> => {
    const allForecasts = await fetchApi<any[]>("/forecasts");
    
    // Filter forecasts by region if provided
    const regionForecasts = regionName 
      ? allForecasts.filter((f) => (f.region_name || "").toLowerCase() === regionName.toLowerCase())
      : allForecasts;

    // Group predictions by date
    const predictionsByDate: Record<string, number> = {};
    for (const f of regionForecasts) {
      const dateStr = new Date(f.forecast_date + "Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      predictionsByDate[dateStr] = f.predicted_temp;
    }

    // Since backend GET /api/forecasts does not provide observed history, we do not fabricate it.
    // We will just map the available forecast dates to TempPoints with observed = null.
    
    // Sort dates
    const sortedDates = Object.keys(predictionsByDate).sort((a, b) => new Date(`${a} 2000`).getTime() - new Date(`${b} 2000`).getTime());
    
    return sortedDates.map(dateStr => ({
      time: dateStr,
      observed: null, // No comparable observed data provided by this endpoint
      forecast: predictionsByDate[dateStr],
      normalLow: 25, // Fallback visual range for chart
      normalHigh: 45,
    }));
  },

  getForecastRows: async (): Promise<ForecastRow[]> => {
    const data = await fetchApi<any[]>("/forecasts");
    return data.map((f: any) => {
      let risk: Severity = "normal";
      const s = (f.severity || "").toLowerCase();
      if (s === "severe_heatwave" || s === "severe") risk = "severe";
      else if (s === "heatwave") risk = "heatwave";
      else if (s === "watch") risk = "watch";

      return {
        date: new Date(f.forecast_date + "Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        region: f.region_name || `Region ${f.region_id}`,
        predicted: f.predicted_temp,
        observed: null, // Backend does not provide observed in /api/forecasts
        risk,
      };
    });
  },

  getForecastSummary: async (): Promise<any> => {
    const data = await getDashboardData();
    // Using dashboard's forecast_summary or predicted_max_temp
    
    let highestSeverity = "normal";
    const riskLevels = ["severe", "heatwave", "watch", "normal"];
    
    let maxDeparture = 0;
    let avgConfidence = 0;
    let count = 0;

    if (data.forecast_summary && data.forecast_summary.length > 0) {
      for (const f of data.forecast_summary) {
        let s = (f.severity || "normal").toLowerCase();
        if (s === "severe_heatwave" || s === "severe") s = "severe";
        else if (s === "heatwave") s = "heatwave";
        else if (s === "watch") s = "watch";
        else s = "normal";

        if (riskLevels.indexOf(s) < riskLevels.indexOf(highestSeverity)) {
          highestSeverity = s;
        }
        if (f.departure > maxDeparture) maxDeparture = f.departure;
        avgConfidence += f.confidence || 0;
        count++;
      }
    }

    return {
      predictedMax: data.predicted_max_temp,
      heatwaveRisk: count > 0 ? highestSeverity : "—",
      departure: count > 0 ? Number(maxDeparture.toFixed(1)) : "—",
      confidence: count > 0 ? Math.round(avgConfidence / count) : "—",
    };
  },

  generateForecasts: async () => {
    await fetchApi<any>("/forecasts/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getHeatEvents: async (): Promise<HeatEvent[]> => {
    const data = await fetchApi<any[]>("/heatwaves");
    return data.map((e: any) => {
      let mappedSeverity: Severity = "normal";
      const s = (e.severity || "").toLowerCase();
      if (s === "severe_heatwave" || s === "severe") mappedSeverity = "severe";
      else if (s === "heatwave") mappedSeverity = "heatwave";
      else if (s === "watch") mappedSeverity = "watch";

      return {
        id: `EVT-${e.id.toString().padStart(4, '0')}`,
        region: e.region_name || `Region ${e.region_id}`,
        severity: mappedSeverity,
        observed: null, // Backend only gives predicted and normal temp
        forecast: e.predicted_temp,
        departure: e.departure,
        started: new Date(e.start_date + "Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: e.is_active ? "active" : "resolved",
        station: "—", // Not provided by backend heatwave schema
        population: "—", // Not provided
        peak: null, // Not explicitly defined as peak by backend
        duration: e.end_date 
          ? `${Math.max(1, Math.ceil((new Date(e.end_date + "Z").getTime() - new Date(e.start_date + "Z").getTime()) / (1000 * 60 * 60 * 24)))} days`
          : "Ongoing",
        narrative: "—", // Not provided
      };
    });
  },
  getAdvisories: async (): Promise<Advisory[]> => {
    const data = await fetchApi<any[]>("/advisories");
    return data.map((a: any) => {
      let status: Advisory["status"] = "pending";
      const s = (a.status || "").toLowerCase();
      if (s === "approved") status = "approved";
      else if (s === "rejected") status = "rejected";

      let severity: Severity = "normal";
      const sev = (a.severity || "").toLowerCase();
      if (sev === "severe_heatwave" || sev === "severe") severity = "severe";
      else if (sev === "heatwave") severity = "heatwave";
      else if (sev === "watch") severity = "watch";

      let audience: AudienceKey = "CITIZENS";
      const aud = (a.audience || "").toUpperCase();
      if (["CITIZENS", "AUTHORITIES", "FARMERS", "HEALTHCARE"].includes(aud)) {
        audience = aud as AudienceKey;
      }

      // calculate time ago
      let generated = "—";
      if (a.created_at) {
        const diffMins = Math.floor((new Date().getTime() - new Date(a.created_at + "Z").getTime()) / 60000);
        generated = diffMins < 60 ? `${diffMins} min ago` : `${Math.floor(diffMins/60)} hr ago`;
      }

      return {
        id: a.id.toString(),
        audience,
        severity,
        region: a.region_name || "Unknown",
        generated,
        text: a.content || a.title || "—",
        status,
      };
    });
  },

  approveAdvisory: async (id: string): Promise<void> => {
    await fetchApi<any>(`/advisories/${id}/approve`, { method: "POST" });
  },

  rejectAdvisory: async (id: string): Promise<void> => {
    await fetchApi<any>(`/advisories/${id}/reject`, { method: "POST" });
  },

  generateAdvisories: async (region_name: string, severity: string, temperature: number): Promise<void> => {
    await fetchApi<any>("/advisories/generate", {
      method: "POST",
      body: JSON.stringify({ region_name, severity, temperature }),
    });
  },

  getValidationRows: async (): Promise<ValidationRow[]> => {
    const data = await fetchApi<any[]>("/validation");
    return data.map((r: any) => {
      let status: "good" | "fair" | "poor" = "good";
      if (r.abs_error > 2.0) status = "poor";
      else if (r.abs_error > 1.0) status = "fair";

      return {
        region: r.region_name || "Unknown",
        predicted: r.predicted_temp,
        observed: r.actual_temp,
        error: r.error,
        status,
      };
    });
  },

  getValidationMetrics: async (): Promise<any> => {
    const data = await fetchApi<any[]>("/validation");
    if (!data || data.length === 0) {
      return { mae: 0, rmse: 0, bias: 0, r2: 0, accuracy: 0 };
    }
    
    let sumAbsError = 0;
    let sumSqError = 0;
    let sumError = 0;
    let accurateCount = 0;
    
    // R2 calculation pieces
    let sumActual = 0;
    for (const r of data) {
      sumAbsError += r.abs_error;
      sumSqError += (r.error * r.error);
      sumError += r.error;
      sumActual += r.actual_temp;
      if (r.abs_error <= 1.5) accurateCount++;
    }
    
    const count = data.length;
    const meanActual = sumActual / count;
    
    let ssTot = 0;
    for (const r of data) {
      ssTot += Math.pow(r.actual_temp - meanActual, 2);
    }
    
    const ssRes = sumSqError;
    const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    return {
      mae: Number((sumAbsError / count).toFixed(2)),
      rmse: Number(Math.sqrt(sumSqError / count).toFixed(2)),
      bias: Number((sumError / count).toFixed(2)),
      r2: Number(r2.toFixed(3)),
      accuracy: Number(((accurateCount / count) * 100).toFixed(1)),
    };
  },

  getScatterData: async (): Promise<ScatterPoint[]> => {
    const data = await fetchApi<any[]>("/validation");
    return data.map((r: any) => ({
      predicted: r.predicted_temp,
      observed: r.actual_temp,
      region: r.region_name || "Unknown",
    }));
  },

  getErrorTrend: async (): Promise<any[]> => {
    const data = await fetchApi<any[]>("/validation");
    
    // Group by date
    const byDate: Record<string, { sumError: number, count: number }> = {};
    for (const r of data) {
      const dateStr = new Date(r.forecast_date + "Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDate[dateStr]) byDate[dateStr] = { sumError: 0, count: 0 };
      byDate[dateStr].sumError += r.abs_error;
      byDate[dateStr].count++;
    }

    const sortedDates = Object.keys(byDate).sort((a, b) => new Date(`${a} 2000`).getTime() - new Date(`${b} 2000`).getTime());
    
    return sortedDates.map(date => ({
      time: date,
      mae: Number((byDate[date].sumError / byDate[date].count).toFixed(2)),
    }));
  },

  getSettings: async (): Promise<any> => {
    return await fetchApi<any>("/settings");
  },

  updateSettings: async (settings: any): Promise<any> => {
    return await fetchApi<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  ingestWeather: async (mode: "current" | "recent" = "current"): Promise<any> => {
    return await fetchApi<any>(`/weather/ingest?mode=${mode}`, { method: "POST" });
  },

  getWeatherStatus: async (): Promise<any> => {
    return await fetchApi<any>("/weather/status");
  },

  getMlStatus: async (): Promise<any> => {
    return await fetchApi<any>("/ml/status");
  },

  trainMlModel: async (): Promise<any> => {
    return await fetchApi<any>("/ml/train", { method: "POST" });
  },
};
