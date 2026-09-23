import { cn } from "../../utils/cn";

interface Props<T extends string> {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  className?: string;
}

export default function SegmentedTabs<T extends string>({ value, options, onChange, className }: Props<T>) {
  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-surface/60 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              active ? "bg-elevated text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
            {o.count != null && (
              <span className={cn("ml-1.5 font-mono text-[10px]", active ? "text-teal" : "text-ink-faint")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
