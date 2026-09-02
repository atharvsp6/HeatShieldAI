import { ArrowDownRight, ArrowUpRight, Bell, Flame, Radio, Thermometer } from "lucide-react";
import type { Kpi } from "../../types";
import { cn } from "../../utils/cn";

const icons: Record<string, typeof Bell> = { thermometer: Thermometer, flame: Flame, bell: Bell, radio: Radio };

export default function KpiCard({ kpi, index = 0 }: { kpi: Kpi; index?: number }) {
  const Icon = icons[kpi.icon] ?? Thermometer;
  const up = kpi.deltaTone === "up";
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-hairline bg-surface/70 p-4 transition-all duration-200 hover:border-hairline-strong hover:bg-surface"
      style={{ animation: `inUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">{kpi.label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-elevated text-ink-muted transition-colors group-hover:text-teal">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-[26px] font-semibold leading-none tracking-tight text-ink">{kpi.value}</span>
        {kpi.unit && <span className="font-mono text-sm text-ink-muted">{kpi.unit}</span>}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        {kpi.delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              kpi.deltaTone === "up" && "bg-[#fb923c]/12 text-[#fb923c]",
              kpi.deltaTone === "down" && "bg-[#34d399]/12 text-[#34d399]",
              kpi.deltaTone === "neutral" && "bg-white/5 text-ink-muted",
            )}
          >
            {kpi.deltaTone !== "neutral" && <Arrow className="h-3 w-3" />}
            {kpi.delta}
          </span>
        )}
        <span className="text-[11px] text-ink-faint">{kpi.sub}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
