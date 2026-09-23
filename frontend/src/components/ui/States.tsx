import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.04]", className)} />;
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-elevated text-ink-faint">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      {hint && <p className="max-w-xs text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-medium text-[#f43f5e]">Failed to load data</p>
      <p className="max-w-xs text-xs text-ink-faint">The request could not be completed. Check your connection and try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-lg border border-hairline-strong px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink">
          Retry
        </button>
      )}
    </div>
  );
}
