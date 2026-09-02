import { useState } from "react";
import { Activity, CheckCircle2, ChevronRight, Cpu, FileCheck2, RadioReceiver, Wind } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { ActivityItem, Region } from "../types";
import Panel, { PanelHeader } from "../components/ui/Panel";
import KpiCard from "../components/ui/KpiCard";
import TemperatureChart from "../components/charts/TemperatureChart";
import IndiaMap from "../components/maps/IndiaMap";
import Legend from "../components/ui/Legend";
import SeverityBadge from "../components/ui/SeverityBadge";
import AlertItem from "../components/alerts/AlertItem";
import { Skeleton } from "../components/ui/States";
import { severityMeta, severityRank, tempTone } from "../utils/severity";
import { cn } from "../utils/cn";

const activityIcons = {
  forecast: Cpu,
  observation: RadioReceiver,
  classification: Wind,
  advisory: FileCheck2,
  system: Activity,
} as const;

export default function Dashboard() {
  const kpis = useAsync(api.getDashboardKpis, []);
  const series = useAsync(api.getTempSeries, []);
  const regions = useAsync(api.getRegions, []);
  const alerts = useAsync(api.getAlerts, []);
  const activity = useAsync(api.getActivity, []);
  const [selected, setSelected] = useState<Region | null>(null);

  const ranked = [...(regions.data ?? [])].sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.temp - a.temp);

  return (
    <div className="space-y-5">
      {/* status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-[#34d399]/20 bg-[#34d399]/[0.06] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#34d399] pulse-dot" />
          <span className="text-xs font-semibold tracking-wide text-[#34d399]">SYSTEM OPERATIONAL</span>
          <span className="text-xs text-ink-faint">· Last updated 2 min ago</span>
        </div>
        <p className="font-mono text-xs text-ink-faint">Peak season · Pre-monsoon 2026</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px]" />)
          : kpis.data?.map((k, i) => <KpiCard key={k.id} kpi={k} index={i} />)}
      </div>

      {/* analytics */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        <Panel>
          <PanelHeader
            title="Temperature Intelligence"
            subtitle="Observed vs AI forecast against seasonal normal · °C"
            right={
              <div className="flex items-center gap-3">
                <LegendDot color="#22d3c5" label="Observed" />
                <LegendDot color="#fb923c" label="Forecast" dashed />
                <LegendDot color="#3a4a63" label="Normal" square />
              </div>
            }
          />
          <div className="px-2 pb-3">
            {series.loading ? <Skeleton className="mx-3 h-[300px]" /> : <TemperatureChart data={series.data ?? []} />}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Regional Heat Risk" subtitle="Ranked by current severity" />
          <div className="divide-y divide-hairline/60">
            {regions.loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mx-4 my-2.5 h-12" />)
              : ranked.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="h-8 w-1 rounded-full" style={{ backgroundColor: severityMeta[r.severity].color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">{r.name}</p>
                      <div className="mt-0.5">
                        <SeverityBadge severity={r.severity} size="sm" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-mono text-[15px] font-semibold", tempTone(r.temp))}>{r.temp}°C</p>
                      <p className="text-[10px] text-ink-faint">+{r.departure}° dep.</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
          </div>
        </Panel>
      </div>

      {/* map */}
      <Panel>
        <PanelHeader
          title="Regional Heatwave Map"
          subtitle="Current heat risk across monitored regions"
          right={<Legend />}
        />
        <div className="grid grid-cols-1 gap-4 p-4 pt-1 lg:grid-cols-[1fr_320px]">
          <div className="relative rounded-lg border border-hairline bg-navy/40 p-2">
            <div className="mx-auto max-w-xl">
              <IndiaMap regions={regions.data ?? []} selectedId={selected?.id} onSelect={setSelected} />
            </div>
          </div>
          <RegionDetail region={selected} onClear={() => setSelected(null)} />
        </div>
      </Panel>

      {/* bottom */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Recent Alerts" subtitle="Latest heat alerts across regions" right={<span className="font-mono text-[11px] text-ink-faint">Live</span>} />
          <div className="divide-y divide-hairline/60">
            {alerts.loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mx-4 my-2 h-16" />)
              : alerts.data?.slice(0, 5).map((a) => <AlertItem key={a.id} alert={a} compact />)}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="System Activity" subtitle="Recent pipeline and platform events" />
          <div className="p-4 pt-1">
            <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-hairline">
              {activity.loading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="ml-9 h-10" />)
                : activity.data?.map((item: ActivityItem) => {
                    const Icon = activityIcons[item.type] ?? Activity;
                    return (
                      <li key={item.id} className="relative flex gap-3">
                        <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-elevated text-ink-muted">
                          <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                        </span>
                        <div className="pt-1">
                          <p className="text-[13px] leading-snug text-ink">{item.text}</p>
                          <p className="mt-0.5 text-[11px] text-ink-faint">{item.time}</p>
                        </div>
                      </li>
                    );
                  })}
            </ol>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed, square }: { color: string; label: string; dashed?: boolean; square?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
      {square ? (
        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.6 }} />
      ) : (
        <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color, borderTop: dashed ? `2px dashed ${color}` : undefined, background: dashed ? "none" : color }} />
      )}
      {label}
    </span>
  );
}

function RegionDetail({ region, onClear }: { region: Region | null; onClear: () => void }) {
  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-navy/30 px-6 py-10 text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-elevated text-ink-faint">
          <Activity className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-ink-muted">Select a region</p>
        <p className="mt-1 max-w-[200px] text-xs text-ink-faint">Click any marker on the map to inspect current conditions and forecast.</p>
      </div>
    );
  }
  const m = severityMeta[region.severity];
  return (
    <div key={region.id} className="animate-scale-in rounded-lg border bg-navy/40 p-4" style={{ borderColor: `${m.color}33` }}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-base font-semibold text-ink">{region.name}</h4>
          <p className="font-mono text-[11px] text-ink-faint">Station {region.station}</p>
        </div>
        <SeverityBadge severity={region.severity} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Current" value={`${region.temp}°C`} tone={tempTone(region.temp)} />
        <Metric label="Forecast" value={`${region.forecast}°C`} tone="text-[#fb923c]" />
        <Metric label="Departure" value={`+${region.departure}°C`} tone="text-ink" />
        <Metric label="Updated" value={region.updated} tone="text-ink-muted" small />
      </div>
      <button onClick={onClear} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-hairline py-2 text-xs text-ink-muted transition-colors hover:text-ink">
        <CheckCircle2 className="h-3.5 w-3.5" /> Clear selection
      </button>
    </div>
  );
}

function Metric({ label, value, tone, small }: { label: string; value: string; tone: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={cn("mt-0.5 font-mono font-semibold", small ? "text-xs" : "text-lg", tone)}>{value}</p>
    </div>
  );
}
