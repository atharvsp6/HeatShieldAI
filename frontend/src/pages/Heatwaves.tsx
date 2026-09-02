import { useMemo, useState } from "react";
import { CalendarClock, Flame, MapPin, TrendingUp, Users } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { HeatEvent, Severity } from "../types";
import Panel from "../components/ui/Panel";
import StatStrip from "../components/ui/StatStrip";
import SegmentedTabs from "../components/ui/SegmentedTabs";
import SeverityBadge from "../components/ui/SeverityBadge";
import StatusPill from "../components/ui/StatusPill";
import Drawer from "../components/ui/Drawer";
import { EmptyState, Skeleton } from "../components/ui/States";
import { severityMeta, tempTone } from "../utils/severity";
import { cn } from "../utils/cn";

type Filter = "all" | "active" | "severe" | "resolved";

export default function Heatwaves() {
  const { data, loading } = useAsync(api.getHeatEvents, []);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<HeatEvent | null>(null);

  const events = data ?? [];
  const filtered = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "active") return events.filter((e) => e.status === "active");
    if (filter === "resolved") return events.filter((e) => e.status === "resolved");
    return events.filter((e) => e.severity === "severe");
  }, [events, filter]);

  const counts = {
    active: events.filter((e) => e.status === "active").length,
    severe: events.filter((e) => e.severity === "severe").length,
    heatwave: events.filter((e) => e.severity === "heatwave").length,
    resolved: events.filter((e) => e.status === "resolved").length,
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}</div>
      ) : (
        <StatStrip
          stats={[
            { label: "Active Events", value: String(counts.active), hint: "Currently monitored", tone: "text-[#fb923c]", icon: <Flame className="h-4 w-4" /> },
            { label: "Severe", value: String(counts.severe), hint: "Critical intensity", tone: "text-[#f43f5e]" },
            { label: "Heatwave", value: String(counts.heatwave), hint: "Above threshold", tone: "text-[#fb923c]" },
            { label: "Resolved", value: String(counts.resolved), hint: "This season", tone: "text-ink-muted" },
          ]}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <SegmentedTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: events.length },
            { value: "active", label: "Active", count: counts.active },
            { value: "severe", label: "Severe", count: counts.severe },
            { value: "resolved", label: "Resolved", count: counts.resolved },
          ]}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel><EmptyState icon={<Flame className="h-5 w-5" />} title="No events in this view" hint="No heatwave events match the selected filter." /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} onOpen={() => setSelected(e)} />
          ))}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.region ?? ""} subtitle={selected ? `${selected.id} · ${selected.station}` : ""}>
        {selected && <EventDetail event={selected} />}
      </Drawer>
    </div>
  );
}

function EventCard({ event, index, onOpen }: { event: HeatEvent; index: number; onOpen: () => void }) {
  const m = severityMeta[event.severity];
  return (
    <button
      onClick={onOpen}
      className="group relative overflow-hidden rounded-xl border border-hairline bg-surface/70 p-4 text-left transition-all duration-200 hover:border-hairline-strong hover:bg-surface"
      style={{ animation: `inUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both` }}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: m.color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-semibold text-ink">{event.region}</p>
          <p className="font-mono text-[11px] text-ink-faint">{event.id}</p>
        </div>
        <SeverityBadge severity={event.severity} size="sm" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className={cn("font-mono text-2xl font-semibold", event.observed != null ? tempTone(event.observed) : "text-ink-faint")}>
            {event.observed != null ? `${event.observed.toFixed(1)}°C` : "—"}
          </p>
          <p className="text-[11px] text-ink-faint">observed · forecast {event.forecast}°C</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-[#fb923c]">+{event.departure}°</p>
          <p className="text-[11px] text-ink-faint">departure</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-hairline/60 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-faint"><CalendarClock className="h-3.5 w-3.5" /> Started {event.started}</span>
        <StatusPill tone={event.status} />
      </div>
    </button>
  );
}

function EventDetail({ event }: { event: HeatEvent }) {
  const m = severityMeta[event.severity];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: `${m.color}33`, background: `${m.color}0d` }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${m.color}1f`, color: m.color }}>
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <SeverityBadge severity={event.severity} />
          <p className="mt-1.5 text-xs text-ink-faint">{event.status === "active" ? "Ongoing event" : "Resolved event"} · duration {event.duration}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Detail icon={<TrendingUp className="h-4 w-4" />} label="Observed" value={event.observed != null ? `${event.observed.toFixed(1)}°C` : "—"} tone={event.observed != null ? tempTone(event.observed) : "text-ink-faint"} />
        <Detail icon={<TrendingUp className="h-4 w-4" />} label="Forecast" value={`${event.forecast.toFixed(1)}°C`} tone="text-[#fb923c]" />
        <Detail icon={<TrendingUp className="h-4 w-4" />} label="Peak" value={event.peak != null ? `${event.peak.toFixed(1)}°C` : "—"} tone={event.peak != null ? "text-[#f43f5e]" : "text-ink-faint"} />
        <Detail icon={<TrendingUp className="h-4 w-4" />} label="Departure" value={`+${event.departure}°C`} tone="text-ink" />
        <Detail icon={<MapPin className="h-4 w-4" />} label="Station" value={event.station} tone="text-ink" small />
        <Detail icon={<Users className="h-4 w-4" />} label="Population" value={event.population} tone="text-ink" small />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Situation Analysis</p>
        <p className="rounded-lg border border-hairline bg-surface/60 p-3 text-[13px] leading-relaxed text-ink-muted">{event.narrative}</p>
      </div>
    </div>
  );
}

function Detail({ icon, label, value, tone, small }: { icon: React.ReactNode; label: string; value: string; tone: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface/60 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint"><span className="text-ink-faint">{icon}</span>{label}</p>
      <p className={cn("mt-1 font-mono font-semibold", small ? "text-xs" : "text-lg", tone)}>{value}</p>
    </div>
  );
}
