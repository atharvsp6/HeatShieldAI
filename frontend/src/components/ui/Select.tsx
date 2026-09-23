import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface Props {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}

export default function Select({ value, options, onChange, label, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-surface/80 px-3 text-sm text-ink transition-colors hover:border-hairline-strong"
      >
        <span className="flex items-center gap-1.5 truncate">
          {label && <span className="text-ink-faint">{label}:</span>}
          <span className="font-medium">{current?.label}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-40 min-w-full origin-top animate-scale-in overflow-hidden rounded-lg border border-hairline-strong bg-[#0b1120] p-1 shadow-2xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                o.value === value ? "bg-teal/10 text-ink" : "text-ink-muted hover:bg-white/5 hover:text-ink",
              )}
            >
              <span className="whitespace-nowrap">{o.label}</span>
              {o.value === value && <Check className="h-3.5 w-3.5 text-teal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
