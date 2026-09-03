import { useMemo, useState } from "react";
import { ArrowUpDown, Radio, Search, WifiOff } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { Station } from "../types";
import Panel, { PanelHeader } from "../components/ui/Panel";
import Select from "../components/ui/Select";
import StatStrip from "../components/ui/StatStrip";
import StatusPill from "../components/ui/StatusPill";
import SignalBars from "../components/ui/SignalBars";
import { EmptyState, Skeleton } from "../components/ui/States";
import { cn } from "../utils/cn";
import { tempTone } from "../utils/severity";

type SortKey = "code" | "region" | "temp" | "humidity";

export default function Stations() {
  const { data, loading } = useAsync(api.getStations, []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState<SortKey>("temp");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const stations = data ?? [];
  const regionOpts = [{ value: "all", label: "All regions" }, ...[...new Set(stations.map((s) => s.region))].sort().map((r) => ({ value: r, label: r }))];

  const filtered = useMemo(() => {
    let out = stations.filter((s) => {
      const q = search.toLowerCase();
      const matchQ = !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q);
      const matchS = status === "all" || s.status === status;
      const matchR = region === "all" || s.region === region;
      return matchQ && matchS && matchR;
    });
    out = [...out].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [stations, search, status, region, sort, dir]);

  function toggleSort(k: SortKey) {
    if (sort === k) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(k);
      setDir("desc");
    }
  }

  const counts = {
    total: stations.length,
    online: stations.filter((s) => s.status === "online").length,
    warning: stations.filter((s) => s.status === "warning").length,
    offline: stations.filter((s) => s.status === "offline").length,
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}</div>
      ) : (
        <StatStrip
          stats={[
            { label: "Total Stations", value: String(counts.total), hint: "Station network", icon: <Radio className="h-4 w-4" /> },
            { label: "Online", value: String(counts.online), hint: `${Math.round((counts.online / counts.total) * 100)}% uptime`, tone: "text-[#34d399]" },
            { label: "Warning", value: String(counts.warning), hint: "Degraded signal", tone: "text-[#fbbf24]" },
            { label: "Offline", value: String(counts.offline), hint: "No recent data", tone: "text-[#f43f5e]", icon: <WifiOff className="h-4 w-4" /> },
          ]}
        />
      )}

      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stations…"
              className="h-9 w-full rounded-lg border border-hairline bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-teal/50 focus:outline-none"
            />
          </div>
          <Select value={region} options={regionOpts} onChange={setRegion} label="Region" className="w-44" />
          <Select
            value={status}
            options={[
              { value: "all", label: "All statuses" },
              { value: "online", label: "Online" },
              { value: "warning", label: "Warning" },
              { value: "offline", label: "Offline" },
            ]}
            onChange={setStatus}
            label="Status"
            className="w-44"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <SortTh label="Station" k="code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortTh label="Region" k="region" sort={sort} dir={dir} onSort={toggleSort} />
                <SortTh label="Temperature" k="temp" sort={sort} dir={dir} onSort={toggleSort} right />
                <SortTh label="Humidity" k="humidity" sort={sort} dir={dir} onSort={toggleSort} right />
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Last Observation</th>
                <th className="px-4 py-2.5 text-right font-semibold">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-2.5"><Skeleton className="h-7" /></td></tr>
                  ))
                : filtered.map((s: Station) => {
                    const off = s.status === "offline";
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={cn("font-mono text-xs font-medium", off ? "text-ink-faint" : "text-teal")}>{s.code}</span>
                            <span className="font-medium text-ink">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{s.region}</td>
                        <td className={cn("px-4 py-3 text-right font-mono font-medium", off || s.temp == null ? "text-ink-faint" : tempTone(s.temp))}>
                          {off || s.temp == null ? "—" : `${s.temp.toFixed(1)}°C`}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-ink-muted">{off || s.humidity == null ? "—" : `${s.humidity}%`}</td>
                        <td className="px-4 py-3"><StatusPill tone={s.status} /></td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-faint">{s.lastObs}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">{typeof s.signal === 'number' ? <SignalBars level={s.signal} /> : <span className="text-ink-faint">—</span>}</div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <EmptyState icon={<Search className="h-5 w-5" />} title="No stations match your filters" hint="Try adjusting the search term or clearing the region and status filters." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function SortTh({ label, k, sort, dir, onSort, right }: { label: string; k: SortKey; sort: SortKey; dir: string; onSort: (k: SortKey) => void; right?: boolean }) {
  const active = sort === k;
  return (
    <th className={cn("px-4 py-2.5 font-semibold", right && "text-right")}>
      <button onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 transition-colors hover:text-ink", active && "text-ink", right && "flex-row-reverse")}>
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active ? "text-teal" : "text-ink-faint/50")} />
      </button>
    </th>
  );
}
