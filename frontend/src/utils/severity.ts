import type { Severity } from "../types";

export const severityMeta: Record<Severity, { label: string; color: string; text: string; bg: string; border: string }> = {
  normal: { label: "NORMAL", color: "var(--color-normal)", text: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/25" },
  watch: { label: "WATCH", color: "var(--color-watch)", text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/25" },
  heatwave: { label: "HEATWAVE", color: "var(--color-heatwave)", text: "text-[#fb923c]", bg: "bg-[#fb923c]/10", border: "border-[#fb923c]/25" },
  severe: { label: "SEVERE", color: "var(--color-severe)", text: "text-[#f43f5e]", bg: "bg-[#f43f5e]/10", border: "border-[#f43f5e]/25" },
};

export const severityRank: Record<Severity, number> = { severe: 3, heatwave: 2, watch: 1, normal: 0 };

export function tempTone(temp: number): string {
  if (temp >= 45) return "text-[#f43f5e]";
  if (temp >= 42) return "text-[#fb923c]";
  if (temp >= 39) return "text-[#fbbf24]";
  return "text-ink";
}
