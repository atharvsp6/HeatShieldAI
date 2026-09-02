import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface PanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Panel({ children, className, hover }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-surface/70 backdrop-blur-sm",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset,0_12px_28px_-18px_rgba(0,0,0,0.7)]",
        hover && "transition-colors duration-200 hover:border-hairline-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

export function PanelHeader({ title, subtitle, right, className }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-4 pb-3", className)}>
      <div className="min-w-0">
        <h3 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
