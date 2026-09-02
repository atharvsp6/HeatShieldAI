import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TempPoint } from "../../types";
import { axisProps, gridProps, TipRow, TooltipShell } from "./chartTheme";

interface Props {
  data: TempPoint[];
  height?: number;
}

interface TipPayload {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload: TempPoint }>;
}

function CustomTip({ active, label, payload }: TipPayload) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <TooltipShell active={active} label={label}>
      {p.observed != null && <TipRow color="#22d3c5" name="Observed" value={`${p.observed.toFixed(1)}°C`} />}
      {p.forecast != null && <TipRow color="#fb923c" name="Forecast" value={`${p.forecast.toFixed(1)}°C`} />}
      <TipRow color="#3a4a63" name="Normal range" value={`${p.normalLow}–${p.normalHigh}°C`} />
    </TooltipShell>
  );
}

export default function TemperatureChart({ data, height = 300 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <defs>
          <linearGradient id="obsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3c5" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#22d3c5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="time" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} domain={[24, 50]} tickFormatter={(v) => `${v}°`} width={44} />
        <Tooltip content={<CustomTip />} cursor={{ stroke: "#2a3a52", strokeWidth: 1 }} />
        {/* seasonal-normal reference band (upper bound) */}
        <Area dataKey="normalHigh" stroke="#2a3a52" strokeWidth={1} strokeDasharray="2 3" fill="#141d30" fillOpacity={0.5} isAnimationActive={false} />
        <Area dataKey="observed" stroke="none" fill="url(#obsFill)" isAnimationActive animationDuration={700} connectNulls />
        <Line
          dataKey="observed"
          stroke="#22d3c5"
          strokeWidth={2.25}
          dot={false}
          activeDot={{ r: 4, fill: "#22d3c5", stroke: "#04211f", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={800}
          connectNulls
        />
        <Line
          dataKey="forecast"
          stroke="#fb923c"
          strokeWidth={2.25}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 4, fill: "#fb923c", stroke: "#2a1405", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={800}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
