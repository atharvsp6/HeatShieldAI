import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ScatterPoint } from "../../types";
import { axisProps, gridProps, TipRow, TooltipShell } from "./chartTheme";

interface TipPayload {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}

function CustomTip({ active, payload }: TipPayload) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <TooltipShell active={active} label={p.region}>
      <TipRow color="#38bdf8" name="Predicted" value={`${p.predicted.toFixed(1)}°C`} />
      <TipRow color="#22d3c5" name="Observed" value={`${p.observed.toFixed(1)}°C`} />
      <TipRow color="#93a2ba" name="Error" value={`${(p.observed - p.predicted).toFixed(1)}°C`} />
    </TooltipShell>
  );
}

export default function ScatterAccuracy({ data, height = 320 }: { data: ScatterPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 16, bottom: 8, left: -4 }}>
        <CartesianGrid {...gridProps} vertical />
        <XAxis type="number" dataKey="predicted" name="Predicted" domain={[32, 48]} tickFormatter={(v) => `${v}°`} {...axisProps} />
        <YAxis type="number" dataKey="observed" name="Observed" domain={[32, 48]} tickFormatter={(v) => `${v}°`} width={40} {...axisProps} />
        <ZAxis range={[70, 70]} />
        <ReferenceLine
          segment={[{ x: 32, y: 32 }, { x: 48, y: 48 }]}
          stroke="#3ee3d6"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          ifOverflow="extendDomain"
        />
        <Tooltip content={<CustomTip />} cursor={{ stroke: "#2a3a52" }} />
        <Scatter data={data} fill="#38bdf8" fillOpacity={0.85} isAnimationActive animationDuration={700} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
