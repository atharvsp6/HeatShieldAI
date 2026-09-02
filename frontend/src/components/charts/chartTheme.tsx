import type { ReactNode } from "react";

export const axisProps = {
  stroke: "#5f7089",
  tick: { fill: "#93a2ba", fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
  tickLine: false,
  axisLine: { stroke: "#1e293b" },
} as const;

export const gridProps = {
  stroke: "#1e293b",
  strokeDasharray: "0",
  vertical: false,
} as const;

interface TipProps {
  active?: boolean;
  label?: string | number;
  children: ReactNode;
}

export function TooltipShell({ active, label, children }: TipProps) {
  if (!active) return null;
  return (
    <div className="rounded-lg border border-hairline-strong bg-[#0b1120]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label !== undefined && (
        <p className="mb-1.5 font-mono text-[11px] font-medium tracking-wide text-ink-muted">{label}</p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function TipRow({ color, name, value }: { color: string; name: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="flex items-center gap-1.5 text-ink-muted">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {name}
      </span>
      <span className="font-mono font-medium text-ink">{value}</span>
    </div>
  );
}
