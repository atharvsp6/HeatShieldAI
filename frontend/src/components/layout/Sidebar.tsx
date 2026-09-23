import {
  Bell,
  BellRing,
  ChevronLeft,
  Flame,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  RadioTower,
  Settings,
  ShieldHalf,
  Target,
} from "lucide-react";
import type { PageKey } from "./nav";
import { navItems, systemItems } from "./nav";
import type { User } from "../../types";
import { cn } from "../../utils/cn";

const icons: Record<string, typeof Bell> = {
  "layout-dashboard": LayoutDashboard,
  "line-chart": LineChart,
  "radio-tower": RadioTower,
  flame: Flame,
  "bell-ring": BellRing,
  megaphone: Megaphone,
  target: Target,
  settings: Settings,
};

interface Props {
  active: PageKey;
  onNavigate: (k: PageKey) => void;
  collapsed: boolean;
  onToggle: () => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle, user, onLogout }: Props) {
  return (
    <aside
      className={cn(
        "relative z-30 flex h-full shrink-0 flex-col border-r border-hairline bg-navy/80 backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      {/* brand */}
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-hairline px-4", collapsed && "justify-center px-0")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal-dim shadow-[0_6px_16px_-8px_rgba(34,211,197,0.7)]">
          <ShieldHalf className="h-5 w-5 text-[#04211f]" strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade">
            <p className="text-[15px] font-bold leading-tight tracking-tight text-ink">HEATSHIELD</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">Climate Intelligence</p>
          </div>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onNavigate(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    isActive ? "bg-teal/10 text-ink" : "text-ink-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-teal" />}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-teal")} strokeWidth={2} />
                  {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 px-3">
          {!collapsed && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">System</p>}
          <div className={cn("border-t border-hairline pt-3", collapsed && "border-t-0 pt-0")} />
        </div>
        <ul className="space-y-1">
          {systemItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onNavigate(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    isActive ? "bg-teal/10 text-ink" : "text-ink-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-teal")} strokeWidth={2} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* user */}
      <div className="border-t border-hairline p-3">
        <div className={cn("flex items-center gap-3 rounded-lg px-2 py-2", collapsed && "justify-center px-0")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-teal ring-1 ring-hairline-strong">
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade">
              <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
              <p className="truncate text-[11px] text-ink-faint">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={onLogout} title="Log out" className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-white/5 hover:text-[#f43f5e]">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* collapse toggle */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[74px] hidden h-6 w-6 items-center justify-center rounded-full border border-hairline-strong bg-elevated text-ink-muted shadow-md transition-colors hover:text-ink lg:flex"
      >
        <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
