import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import type { NavItem } from "./nav";
import type { Alert, User } from "../../types";
import { cn } from "../../utils/cn";
import SeverityBadge from "../ui/SeverityBadge";

interface Props {
  nav: NavItem;
  user: User;
  notifications: Alert[];
  onMobileMenu: () => void;
}

const today = new Date(2026, 2, 28);
const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const levelToSeverity = { critical: "severe", high: "heatwave", medium: "watch" } as const;

export default function Header({ nav, user, notifications, onMobileMenu }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => n.status === "active").length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-hairline bg-navy/70 px-4 backdrop-blur-xl md:px-6">
      <button onClick={onMobileMenu} className="rounded-lg p-2 text-ink-muted hover:bg-white/5 hover:text-ink lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink md:text-base">{nav.title}</h1>
        <p className="hidden truncate text-xs text-ink-faint sm:block">{nav.desc}</p>
      </div>

      {/* search */}
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          placeholder="Search regions, stations, alerts…"
          className="h-9 w-56 rounded-lg border border-hairline bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-teal/50 focus:outline-none lg:w-72"
        />
      </div>

      {/* notifications */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative rounded-lg border border-hairline bg-surface/80 p-2 text-ink-muted transition-colors hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-40 w-[340px] origin-top-right animate-scale-in overflow-hidden rounded-xl border border-hairline-strong bg-[#0b1120] shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <button onClick={() => setOpen(false)} className="rounded p-1 text-ink-faint hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="flex gap-3 border-b border-hairline/60 px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.03]">
                  <div className="mt-0.5">
                    <SeverityBadge severity={levelToSeverity[n.level]} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">
                      {n.region} · <span className="font-mono text-ink-muted">{n.temp}°C</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-faint">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-hairline bg-surface/80 px-3 py-2 lg:flex">
        <span className="font-mono text-xs text-ink-muted">{dateLabel}</span>
      </div>

      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-teal ring-1 ring-hairline-strong")}>
        {user.initials}
      </div>
    </header>
  );
}
