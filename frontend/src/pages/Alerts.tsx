import { useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Flame, Search, ThermometerSun } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { Alert } from "../types";
import Panel, { PanelHeader } from "../components/ui/Panel";
import SegmentedTabs from "../components/ui/SegmentedTabs";
import AlertItem from "../components/alerts/AlertItem";
import { EmptyState, Skeleton } from "../components/ui/States";

type Filter = "all" | "critical" | "high" | "medium" | "resolved";

const summaryCards = [
  { key: "critical", label: "Critical", icon: AlertTriangle, color: "#f43f5e" },
  { key: "high", label: "High", icon: Flame, color: "#fb923c" },
  { key: "medium", label: "Medium", icon: ThermometerSun, color: "#fbbf24" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, color: "#5f7089" },
] as const;

export default function Alerts() {
  const { data, loading } = useAsync(api.getAlerts, []);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const alerts = data ?? [];
  const active = alerts.filter((a) => a.status !== "resolved");

  const counts = {
    critical: active.filter((a) => a.level === "critical").length,
    high: active.filter((a) => a.level === "high").length,
    medium: active.filter((a) => a.level === "medium").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  const filtered = useMemo(() => {
    return alerts.filter((a: Alert) => {
      const matchF =
        filter === "all"
          ? true
          : filter === "resolved"
            ? a.status === "resolved"
            : a.level === filter && a.status !== "resolved";
      const q = search.toLowerCase();
      const matchQ = !q || a.region.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      return matchF && matchQ;
    });
  }, [alerts, filter, search]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
          : summaryCards.map((c, i) => (
              <div
                key={c.key}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-surface/70 p-4"
                style={{ animation: `inUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-semibold text-ink">{String(counts[c.key]).padStart(2, "0")}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{c.label}</p>
                </div>
              </div>
            ))}
      </div>

      <Panel>
        <PanelHeader
          title="Alert Feed"
          subtitle="Prioritised heat alerts across all monitored regions"
          right={
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts…"
                className="h-9 w-48 rounded-lg border border-hairline bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-teal/50 focus:outline-none"
              />
            </div>
          }
        />
        <div className="px-5 pb-3">
          <SegmentedTabs<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: alerts.length },
              { value: "critical", label: "Critical", count: counts.critical },
              { value: "high", label: "High", count: counts.high },
              { value: "medium", label: "Medium", count: counts.medium },
              { value: "resolved", label: "Resolved", count: counts.resolved },
            ]}
          />
        </div>

        <div className="divide-y divide-hairline/60 border-t border-hairline">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="mx-4 my-2 h-16" />)
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Bell className="h-5 w-5" />} title="No alerts to show" hint="There are no alerts matching the current filter and search." />
          ) : (
            filtered.map((a) => <AlertItem key={a.id} alert={a} />)
          )}
        </div>
      </Panel>
    </div>
  );
}
