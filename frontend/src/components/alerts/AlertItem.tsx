import { AlertTriangle, CheckCircle2, Flame, ThermometerSun } from "lucide-react";
import type { Alert } from "../../types";
import StatusPill from "../ui/StatusPill";
import { cn } from "../../utils/cn";

const levelMeta = {
  critical: { color: "#f43f5e", icon: AlertTriangle, label: "CRITICAL", ring: "border-l-[#f43f5e]" },
  high: { color: "#fb923c", icon: Flame, label: "HIGH", ring: "border-l-[#fb923c]" },
  medium: { color: "#fbbf24", icon: ThermometerSun, label: "MEDIUM", ring: "border-l-[#fbbf24]" },
} as const;

export default function AlertItem({ alert, compact }: { alert: Alert; compact?: boolean }) {
  const m = levelMeta[alert.level];
  const Icon = alert.status === "resolved" ? CheckCircle2 : m.icon;
  const resolved = alert.status === "resolved";

  return (
    <div
      className={cn(
        "group flex gap-3 border-l-2 bg-surface/40 px-4 py-3 transition-colors hover:bg-white/[0.03]",
        resolved ? "border-l-hairline-strong opacity-70" : m.ring,
      )}
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: resolved ? "rgba(255,255,255,0.05)" : `${m.color}1a`, color: resolved ? "#5f7089" : m.color }}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">{alert.region}</span>
          <span className={cn("font-mono text-xs font-medium", resolved ? "text-ink-faint" : "text-ink-muted")}>{alert.temp}°C</span>
          {!compact && (
            <span className="ml-auto font-mono text-[10px] font-semibold tracking-wide" style={{ color: resolved ? "#5f7089" : m.color }}>
              {m.label}
            </span>
          )}
        </div>
        <p className={cn("mt-0.5 text-xs leading-relaxed", compact ? "line-clamp-1" : "line-clamp-2", "text-ink-faint")}>{alert.message}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink-faint">{alert.id}</span>
          <span className="text-[11px] text-ink-faint">· {alert.time}</span>
          <span className="ml-auto">
            <StatusPill tone={alert.status} />
          </span>
        </div>
      </div>
    </div>
  );
}
