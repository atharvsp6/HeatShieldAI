import type { Alert } from "../../types";

export const alerts: Alert[] = [
  { id: "AL-2041", level: "critical", region: "Delhi NCR", temp: 45.2, message: "Severe heatwave — max temp exceeded 45°C for 3rd consecutive day. Public health emergency protocol advised.", time: "2 min ago", status: "active" },
  { id: "AL-2040", level: "critical", region: "Jaipur", temp: 43.8, message: "Heatwave conditions persisting with overnight minimums above 30°C. Vulnerable-group risk elevated.", time: "24 min ago", status: "active" },
  { id: "AL-2039", level: "critical", region: "Ahmedabad", temp: 43.1, message: "Departure from normal reached +3.9°C. Cooling-center activation recommended.", time: "41 min ago", status: "acknowledged" },
  { id: "AL-2038", level: "high", region: "Nagpur", temp: 42.9, message: "Heatwave threshold crossed. Outdoor labor advisories issued for 11:00–16:00.", time: "1 hr ago", status: "active" },
  { id: "AL-2037", level: "high", region: "Lucknow", temp: 42.4, message: "Rising trend across AWS-05. Forecast confidence 91% for continued heatwave.", time: "1 hr ago", status: "active" },
  { id: "AL-2036", level: "high", region: "Bhopal", temp: 40.2, message: "Watch escalated to high. Hydration advisory distributed to district authorities.", time: "2 hr ago", status: "acknowledged" },
  { id: "AL-2035", level: "medium", region: "Pune", temp: 39.4, message: "Heat watch active. Monitoring humidity-adjusted heat index.", time: "3 hr ago", status: "active" },
  { id: "AL-2034", level: "medium", region: "Hyderabad", temp: 39.9, message: "Temperatures approaching heatwave threshold. Preparatory advisory queued.", time: "4 hr ago", status: "active" },
  { id: "AL-2031", level: "high", region: "Kota", temp: 42.0, message: "Heatwave conditions eased below threshold. Alert closed after 2-day event.", time: "Yesterday", status: "resolved" },
  { id: "AL-2029", level: "critical", region: "Bikaner", temp: 46.1, message: "Extreme heat event concluded. Post-event impact assessment archived.", time: "2 days ago", status: "resolved" },
];
