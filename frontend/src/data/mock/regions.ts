import type { Region } from "../../types";

// x/y are percentage coordinates on the stylized India map viewbox
export const regions: Region[] = [
  { id: "delhi", name: "Delhi", severity: "severe", temp: 45.2, forecast: 46.1, departure: 5.4, station: "AWS-07", x: 44, y: 30, updated: "2 min ago" },
  { id: "jaipur", name: "Jaipur", severity: "heatwave", temp: 43.8, forecast: 44.2, departure: 4.1, station: "AWS-03", x: 36, y: 34, updated: "5 min ago" },
  { id: "nagpur", name: "Nagpur", severity: "heatwave", temp: 42.9, forecast: 43.4, departure: 3.6, station: "AWS-14", x: 47, y: 55, updated: "8 min ago" },
  { id: "ahmedabad", name: "Ahmedabad", severity: "heatwave", temp: 43.1, forecast: 43.9, departure: 3.9, station: "AWS-09", x: 30, y: 47, updated: "4 min ago" },
  { id: "pune", name: "Pune", severity: "watch", temp: 39.4, forecast: 40.8, departure: 2.1, station: "AWS-11", x: 38, y: 62, updated: "11 min ago" },
  { id: "bhopal", name: "Bhopal", severity: "watch", temp: 40.2, forecast: 41.0, departure: 2.4, station: "AWS-08", x: 44, y: 46, updated: "9 min ago" },
  { id: "hyderabad", name: "Hyderabad", severity: "watch", temp: 39.9, forecast: 40.5, departure: 1.9, station: "AWS-16", x: 46, y: 66, updated: "13 min ago" },
  { id: "lucknow", name: "Lucknow", severity: "heatwave", temp: 42.4, forecast: 43.0, departure: 3.3, station: "AWS-05", x: 52, y: 35, updated: "7 min ago" },
  { id: "kolkata", name: "Kolkata", severity: "watch", temp: 38.6, forecast: 39.2, departure: 1.6, station: "AWS-18", x: 66, y: 46, updated: "15 min ago" },
  { id: "bengaluru", name: "Bengaluru", severity: "normal", temp: 33.1, forecast: 34.0, departure: 0.8, station: "AWS-12", x: 44, y: 74, updated: "12 min ago" },
  { id: "chennai", name: "Chennai", severity: "normal", temp: 35.4, forecast: 35.9, departure: 1.1, station: "AWS-19", x: 50, y: 78, updated: "10 min ago" },
  { id: "guwahati", name: "Guwahati", severity: "normal", temp: 32.2, forecast: 33.1, departure: 0.6, station: "AWS-20", x: 76, y: 36, updated: "16 min ago" },
];
