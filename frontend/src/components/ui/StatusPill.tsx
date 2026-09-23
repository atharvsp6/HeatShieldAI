import { cn } from "../../utils/cn";

type Tone = "online" | "warning" | "offline" | "active" | "acknowledged" | "resolved" | "pending" | "approved" | "rejected";

const map: Record<Tone, { label?: string; dot: string; text: string; bg: string }> = {
  online: { dot: "bg-[#34d399]", text: "text-[#34d399]", bg: "bg-[#34d399]/10" },
  active: { dot: "bg-[#fb923c]", text: "text-[#fb923c]", bg: "bg-[#fb923c]/10" },
  warning: { dot: "bg-[#fbbf24]", text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10" },
  acknowledged: { dot: "bg-[#38bdf8]", text: "text-[#38bdf8]", bg: "bg-[#38bdf8]/10" },
  pending: { dot: "bg-[#fbbf24]", text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10" },
  approved: { dot: "bg-[#34d399]", text: "text-[#34d399]", bg: "bg-[#34d399]/10" },
  offline: { dot: "bg-[#5f7089]", text: "text-ink-faint", bg: "bg-white/5" },
  resolved: { dot: "bg-[#5f7089]", text: "text-ink-faint", bg: "bg-white/5" },
  rejected: { dot: "bg-[#f43f5e]", text: "text-[#f43f5e]", bg: "bg-[#f43f5e]/10" },
};

export default function StatusPill({ tone, label }: { tone: Tone; label?: string }) {
  const m = map[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", m.bg, m.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {label ?? tone}
    </span>
  );
}
