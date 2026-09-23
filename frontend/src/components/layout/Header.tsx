import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search, X, MapPin, Radio, AlertTriangle } from "lucide-react";
import type { NavItem } from "./nav";
import type { Alert, User } from "../../types";
import { cn } from "../../utils/cn";
import SeverityBadge from "../ui/SeverityBadge";
import { api } from "../../services/api";

interface Props {
  nav: NavItem;
  user: User;
  notifications: Alert[];
  onMobileMenu: () => void;
}

const levelToSeverity = { critical: "severe", high: "heatwave", medium: "watch" } as const;

export default function Header({ nav, user, notifications, onMobileMenu }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => n.status === "active").length;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchPool, setSearchPool] = useState<{ regions: any[]; stations: any[] }>({
    regions: [],
    stations: [],
  });

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearchFocus = () => {
    setSearchOpen(true);
    if (searchPool.regions.length === 0) {
      Promise.all([api.getRegions(), api.getStations()])
        .then(([regions, stations]) => {
          setSearchPool({ regions, stations });
        })
        .catch(() => {});
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const matchedRegions = q ? searchPool.regions.filter((r) => r.name?.toLowerCase().includes(q)) : [];
  const matchedStations = q ? searchPool.stations.filter((s) => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)) : [];
  const matchedAlerts = q ? notifications.filter((a) => a.region?.toLowerCase().includes(q) || a.message?.toLowerCase().includes(q)) : [];
  const totalMatches = matchedRegions.length + matchedStations.length + matchedAlerts.length;

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
      <div className="relative hidden md:block" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          placeholder="Search regions, stations, alerts…"
          className="h-9 w-56 rounded-lg border border-hairline bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-teal/50 focus:outline-none lg:w-72"
        />

        {searchOpen && q && (
          <div className="absolute left-0 top-12 z-40 w-80 origin-top-left animate-scale-in overflow-hidden rounded-xl border border-hairline-strong bg-[#0b1120] shadow-2xl">
            <div className="border-b border-hairline px-3 py-2 text-[11px] font-medium text-ink-faint">
              {totalMatches} {totalMatches === 1 ? "result" : "results"} for "{searchQuery}"
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-hairline/40">
              {matchedRegions.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Regions</div>
                  {matchedRegions.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/5 cursor-pointer" onClick={() => setSearchOpen(false)}>
                      <span className="flex items-center gap-2 text-xs text-ink">
                        <MapPin className="h-3.5 w-3.5 text-teal" />
                        {r.name}
                      </span>
                      <span className="text-xs font-mono text-ink-muted">{r.temp}°C</span>
                    </div>
                  ))}
                </div>
              )}
              {matchedStations.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Stations</div>
                  {matchedStations.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/5 cursor-pointer" onClick={() => setSearchOpen(false)}>
                      <span className="flex items-center gap-2 text-xs text-ink">
                        <Radio className="h-3.5 w-3.5 text-ink-faint" />
                        {s.name}
                      </span>
                      <span className="text-[11px] font-mono text-ink-faint">{s.code}</span>
                    </div>
                  ))}
                </div>
              )}
              {matchedAlerts.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Alerts</div>
                  {matchedAlerts.slice(0, 4).map((a) => (
                    <div key={a.id} className="rounded-lg px-2.5 py-1.5 hover:bg-white/5 cursor-pointer" onClick={() => setSearchOpen(false)}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-[#f43f5e]" />
                          {a.region}
                        </span>
                        <span className="text-[11px] font-mono text-[#f43f5e]">{a.temp}°C</span>
                      </div>
                      <p className="line-clamp-1 text-[11px] text-ink-faint mt-0.5">{a.message}</p>
                    </div>
                  ))}
                </div>
              )}
              {totalMatches === 0 && (
                <div className="p-4 text-center text-xs text-ink-faint">
                  No matching regions, stations, or alerts found.
                </div>
              )}
            </div>
          </div>
        )}
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
