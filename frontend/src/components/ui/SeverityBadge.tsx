import type { Severity } from "../../types";
import { severityMeta } from "../../utils/severity";
import { cn } from "../../utils/cn";

export default function SeverityBadge({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" }) {
  const m = severityMeta[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono font-medium tracking-wide",
        m.bg,
        m.border,
        m.text,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}
