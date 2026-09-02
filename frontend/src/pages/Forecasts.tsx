import { useState } from "react";
import { BrainCircuit, Gauge, ThermometerSun, TrendingUp } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import Panel, { PanelHeader } from "../components/ui/Panel";
import Select from "../components/ui/Select";
import StatStrip from "../components/ui/StatStrip";
import TemperatureChart from "../components/charts/TemperatureChart";
import SeverityBadge from "../components/ui/SeverityBadge";
import { Skeleton } from "../components/ui/States";
import { cn } from "../utils/cn";
import { tempTone } from "../utils/severity";

const regionOpts = [
  { value: "delhi", label: "Delhi NCR" },
  { value: "jaipur", label: "Jaipur" },
  { value: "nagpur", label: "Nagpur" },
  { value: "ahmedabad", label: "Ahmedabad" },
];
const periodOpts = [
  { value: "72h", label: "72 hours" },
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
];
const modelOpts = [
  { value: "v24", label: "HeatNet v2.4" },
  { value: "v23", label: "HeatNet v2.3" },
  { value: "ens", label: "Ensemble" },
];

export default function Forecasts() {
  const [region, setRegion] = useState("delhi");
  const [period, setPeriod] = useState("72h");
  const [model, setModel] = useState("v24");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const selectedRegionName = regionOpts.find(r => r.value === region)?.label;

  const series = useAsync(() => api.getForecastSeries(selectedRegionName), [selectedRegionName]);
  const rows = useAsync(api.getForecastRows, []);
  const summary = useAsync(api.getForecastSummary, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await api.generateForecasts();
      series.reload();
      rows.reload();
      summary.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={region} options={regionOpts} onChange={setRegion} label="Region" className="w-44" />
        <Select value={period} options={periodOpts} onChange={setPeriod} label="Period" className="w-40" />
        <Select value={model} options={modelOpts} onChange={setModel} label="Model" className="w-48" />
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-teal/20 bg-teal/[0.06] px-3 py-1.5 text-xs font-medium text-teal">
          <BrainCircuit className="h-3.5 w-3.5" /> AI forecast · updated 2 min ago
        </span>
      </div>

      {summary.loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}
        </div>
      ) : (
        <StatStrip
          stats={[
            { label: "Predicted Maximum", value: `${summary.data?.predictedMax}°C`, hint: "Peak within horizon", tone: "text-[#f43f5e]", icon: <ThermometerSun className="h-4 w-4" /> },
            { label: "Heatwave Risk", value: summary.data?.heatwaveRisk ?? "—", hint: "Classification", tone: "text-[#fb923c]", icon: <TrendingUp className="h-4 w-4" /> },
            { label: "Departure from Normal", value: `+${summary.data?.departure}°C`, hint: "vs 30-yr climatology", tone: "text-[#fbbf24]", icon: <TrendingUp className="h-4 w-4" /> },
            { label: "Model Confidence", value: `${summary.data?.confidence}%`, hint: "Calibrated probability", tone: "text-teal", icon: <Gauge className="h-4 w-4" /> },
          ]}
        />
      )}

      <Panel>
        <PanelHeader
          title="Observed vs Forecast Temperature"
          subtitle={`${regionOpts.find((r) => r.value === region)?.label} · ${modelOpts.find((m) => m.value === model)?.label}`}
        />
        <div className="px-2 pb-3">
          {series.loading ? <Skeleton className="mx-3 h-[320px]" /> : <TemperatureChart data={series.data ?? []} height={340} />}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Forecast Detail" subtitle="Predicted vs observed with error breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-hairline text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <Th>Date</Th>
                <Th>Region</Th>
                <Th right>Predicted</Th>
                <Th right>Observed</Th>
                <Th right>Difference</Th>
                <Th>Risk</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {rows.loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-2.5"><Skeleton className="h-6" /></td>
                    </tr>
                  ))
                : rows.data?.map((r, i) => {
                    const diff = r.observed != null ? r.observed - r.predicted : null;
                    return (
                      <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{r.date}</td>
                        <td className="px-4 py-2.5 font-medium text-ink">{r.region}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-ink-muted">{r.predicted.toFixed(1)}°</td>
                        <td className={cn("px-4 py-2.5 text-right font-mono", r.observed != null ? tempTone(r.observed) : "text-ink-faint")}>
                          {r.observed != null ? `${r.observed.toFixed(1)}°` : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {diff != null ? (
                            <span className={diff > 0 ? "text-[#fb923c]" : "text-[#34d399]"}>
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(1)}°
                            </span>
                          ) : (
                            <span className="text-ink-faint">pending</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5"><SeverityBadge severity={r.risk} size="sm" /></td>
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

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={cn("px-4 py-2.5 font-semibold", right && "text-right")}>{children}</th>;
}
