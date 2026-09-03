import { useState, useEffect } from "react";
import { Bell, Gauge, Globe, Palette, ShieldCheck } from "lucide-react";
import Panel, { PanelHeader } from "../components/ui/Panel";
import { cn } from "../utils/cn";
import { api } from "../services/api";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-teal" : "bg-elevated")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

const options = [
  { icon: Bell, title: "Critical alert push", desc: "Immediate notification when a region reaches SEVERE", key: "notifications_enabled" },
  { icon: Gauge, title: "Auto-refresh dashboard", desc: "Poll observations every 60 seconds", key: "auto_refresh" },
  { icon: Globe, title: "Regional forecast digest", desc: "Daily 06:00 IST summary email", key: "digest_email" },
  { icon: ShieldCheck, title: "Advisory approval required", desc: "Route AI advisories through human review", key: "approval_required" },
];

export default function Settings() {
  const [state, setState] = useState<Record<string, boolean>>({
    notifications_enabled: true,
    auto_refresh: true,
    digest_email: false,
    approval_required: true,
  });

  useEffect(() => {
    api.getSettings()
      .then((s) => {
        if (s) {
          setState({
            notifications_enabled: s.notifications_enabled ?? true,
            auto_refresh: s.auto_refresh ?? true,
            digest_email: s.digest_email ?? false,
            approval_required: s.approval_required ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleToggle = async (key: string) => {
    const nextVal = !state[key];
    setState((s) => ({ ...s, [key]: nextVal }));
    try {
      await api.updateSettings({ [key]: nextVal });
    } catch (e) {
      console.error("Failed to persist setting:", e);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Panel>
        <PanelHeader title="Notifications & Automation" subtitle="Control how HeatShield surfaces critical intelligence" />
        <div className="divide-y divide-hairline/60">
          {options.map((o) => (
            <div key={o.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-elevated text-teal">
                  <o.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{o.title}</p>
                  <p className="text-xs text-ink-faint">{o.desc}</p>
                </div>
              </div>
              <Toggle on={!!state[o.key]} onClick={() => handleToggle(o.key)} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Appearance" subtitle="Interface theme and density" />
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-elevated text-teal">
            <Palette className="h-[18px] w-[18px]" />
          </div>
          <p className="text-sm text-ink-muted">
            HeatShield is optimised for the <span className="font-medium text-ink">Command Center (dark)</span> theme. Light mode is planned for a future release.
          </p>
        </div>
      </Panel>
    </div>
  );
}
