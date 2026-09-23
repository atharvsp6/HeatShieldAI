import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TempPoint } from "../../types";
import { axisProps, TipRow, TooltipShell } from "./chartTheme";

interface TipPayload {
  active?: boolean;
  label?: string;
  payload?: Array<{ value: number }>;
}

function CustomTip({ active, label, payload }: TipPayload) {
  const v = payload?.[0]?.value;
  if (!active || v == null) return null;
  return (
    <TooltipShell active={active} label={label}>
      <TipRow color="#22d3c5" name="MAE" value={`${v.toFixed(2)}°C`} />
    </TooltipShell>
  );
}

export default function ErrorTrend({ data, height = 150 }: { data: TempPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }} barCategoryGap="35%">
        <XAxis dataKey="time" {...axisProps} interval={0} tick={{ ...axisProps.tick, fontSize: 9 }} />
        <YAxis {...axisProps} domain={[0, 1.5]} tickFormatter={(v) => v.toFixed(1)} width={38} />
        <Tooltip content={<CustomTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="observed" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={600}>
          {data.map((d, i) => (
            <Cell key={i} fill={(d.observed ?? 0) > 1 ? "#fbbf24" : "#22d3c5"} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
