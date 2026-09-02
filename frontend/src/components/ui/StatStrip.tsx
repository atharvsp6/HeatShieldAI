import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
  icon?: ReactNode;
}

export default function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="rounded-xl border border-hairline bg-surface/70 p-4"
          style={{ animation: `inUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both` }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">{s.label}</p>
            {s.icon && <span className="text-ink-faint">{s.icon}</span>}
          </div>
          <p className={cn("mt-2 font-mono text-2xl font-semibold tracking-tight", s.tone ?? "text-ink")}>{s.value}</p>
          {s.hint && <p className="mt-1 text-[11px] text-ink-faint">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
