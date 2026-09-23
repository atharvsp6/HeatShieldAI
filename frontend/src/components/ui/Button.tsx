import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "ghost" | "outline" | "subtle" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-teal text-[#04211f] font-semibold hover:bg-[#3ee3d6] shadow-[0_6px_18px_-8px_rgba(34,211,197,0.6)]",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/5",
  outline: "border border-hairline-strong text-ink-muted hover:text-ink hover:border-teal/40",
  subtle: "bg-elevated text-ink hover:bg-[#20304a] border border-hairline",
  danger: "bg-[#f43f5e]/12 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20",
};

export default function Button({ variant = "subtle", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
