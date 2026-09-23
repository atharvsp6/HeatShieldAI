import { Activity, Gauge, Sigma, TrendingDown } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import Panel, { PanelHeader } from "../components/ui/Panel";
import StatStrip from "../components/ui/StatStrip";
import ScatterAccuracy from "../components/charts/ScatterAccuracy";
import ErrorTrend from "../components/charts/ErrorTrend";
import { Skeleton } from "../components/ui/States";
import { cn } from "../utils/cn";

const statusMeta = {
  good: { label: "Accurate", color: "#34d399" },
  fair: { label: "Acceptable", color: "#fbbf24" },
  poor: { label: "Review", color: "#f43f5e" },
} as const;

export default function Validation() {
  const metrics = useAsync(api.getValidationMetrics, []);
  const rows = useAsync(api.getValidationRows, []);
  const scatter = useAsync(api.getScatterData, []);
  const trend = useAsync(api.getErrorTrend, []);

  return (
    <div className="space-y-5">
      {metrics.loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}</div>
      ) : (
        <StatStrip
          stats={[
            { label: "Prediction Accuracy", value: `${metrics.data?.accuracy}%`, hint: "Within ±1.5°C tolerance", tone: "text-[#34d399]", icon: <Gauge className="h-4 w-4" /> },
            { label: "MAE", value: `${metrics.data?.mae}°C`, hint: "Mean absolute error", tone: "text-teal", icon: <Sigma className="h-4 w-4" /> },
            { label: "RMSE", value: `${metrics.data?.rmse}°C`, hint: "Root mean square error", tone: "text-teal", icon: <Sigma className="h-4 w-4" /> },
            { label: "Bias", value: `${metrics.data?.bias}°C`, hint: "Slight cold bias", tone: "text-[#38bdf8]", icon: <TrendingDown className="h-4 w-4" /> },
          ]}
        />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <Panel>
          <PanelHeader
            title="Predicted vs Observed Temperature"
            subtitle="Each point is a regional forecast · dashed line = perfect prediction"
            right={
              <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Region forecast
              </span>
            }
          />
          <div className="px-2 pb-3">
            {scatter.loading ? <Skeleton className="mx-3 h-[320px]" /> : <ScatterAccuracy data={scatter.data ?? []} />}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Daily Mean Absolute Error" subtitle="Last 8 days · °C" />
          <div className="px-3 pb-4">
            {trend.loading ? <Skeleton className="h-[150px]" /> : <ErrorTrend data={trend.data ?? []} />}
          </div>
          <div className="mx-4 mb-4 rounded-lg border border-hairline bg-navy/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Model Note</p>
            <p className="mt-1 flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
              <Activity className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              HeatNet v2.4 maintains sub-1°C error across arid zones. Coastal humidity continues to drive larger residuals in Kolkata and Chennai.
            </p>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Regional Validation Detail" subtitle="Per-region predicted vs observed error" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-hairline text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-semibold">Region</th>
                <th className="px-4 py-2.5 text-right font-semibold">Predicted</th>
                <th className="px-4 py-2.5 text-right font-semibold">Observed</th>
                <th className="px-4 py-2.5 text-right font-semibold">Error</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {rows.loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-2.5"><Skeleton className="h-6" /></td></tr>
                  ))
                : rows.data?.map((r) => {
                    const s = statusMeta[r.status];
                    return (
                      <tr key={r.region} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-ink">{r.region}</td>
                        <td className="px-4 py-3 text-right font-mono text-ink-muted">{r.predicted.toFixed(1)}°</td>
                        <td className="px-4 py-3 text-right font-mono text-ink">{r.observed.toFixed(1)}°</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-medium" style={{ color: Math.abs(r.error) > 1.5 ? "#fb923c" : "#34d399" }}>
                            {r.error > 0 ? "+" : ""}
                            {r.error.toFixed(1)}°
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium")}
                            style={{ backgroundColor: `${s.color}1a`, color: s.color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
