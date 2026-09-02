import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { PageKey } from "./nav";
import { navItems, systemItems } from "./nav";
import type { Alert, User } from "../../types";
import { cn } from "../../utils/cn";

interface Props {
  active: PageKey;
  onNavigate: (k: PageKey) => void;
  user: User;
  onLogout: () => void;
  notifications: Alert[];
  children: React.ReactNode;
}

export default function AppShell({ active, onNavigate, user, onLogout, notifications, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [...navItems, ...systemItems].find((n) => n.key === active) ?? navItems[0];

  function navigate(k: PageKey) {
    onNavigate(k);
    setMobileOpen(false);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-abyss text-ink">
      {/* desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar active={active} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} user={user} onLogout={onLogout} />
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-in-up">
            <Sidebar active={active} onNavigate={navigate} collapsed={false} onToggle={() => {}} user={user} onLogout={onLogout} />
            <button onClick={() => setMobileOpen(false)} className="absolute -right-11 top-4 rounded-lg bg-elevated p-2 text-ink-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header nav={nav} user={user} notifications={notifications} onMobileMenu={() => setMobileOpen(true)} />
        <main className={cn("relative flex-1 overflow-y-auto")}>
          <div className="radial-glow pointer-events-none absolute inset-0" />
          <div className="grid-texture pointer-events-none absolute inset-0 opacity-60" />
          <div key={active} className="relative mx-auto w-full max-w-[1600px] animate-in-up px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
