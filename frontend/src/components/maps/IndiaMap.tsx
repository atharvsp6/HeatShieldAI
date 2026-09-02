import { useState } from "react";
import type { Region } from "../../types";
import { severityMeta } from "../../utils/severity";
import { cn } from "../../utils/cn";

// Stylized, low-poly India silhouette on a 0..100 viewBox.
const INDIA_PATH =
  "M40 10 L47 9 L52 13 L58 12 L62 15 L60 20 L65 22 L72 20 L78 26 L82 24 L80 30 L74 33 L70 31 L66 34 L70 38 L68 43 L63 45 L66 50 L64 55 L58 60 L55 66 L52 73 L49 80 L46 86 L44 82 L45 74 L42 68 L40 60 L36 55 L33 49 L29 50 L26 46 L29 41 L27 36 L31 33 L34 35 L35 30 L32 26 L34 21 L38 18 Z";

interface Props {
  regions: Region[];
  selectedId?: string | null;
  onSelect?: (r: Region) => void;
  compact?: boolean;
}

export default function IndiaMap({ regions, selectedId, onSelect, compact }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Heatwave severity map of India">
        <defs>
          <radialGradient id="landFill" cx="45%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#16223a" />
            <stop offset="100%" stopColor="#0e1626" />
          </radialGradient>
          <filter id="markerGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={INDIA_PATH} fill="url(#landFill)" stroke="#2a3a52" strokeWidth={0.5} strokeLinejoin="round" />

        {regions.map((r) => {
          const m = severityMeta[r.severity];
          const active = selectedId === r.id || hover === r.id;
          const size = r.severity === "severe" ? 2.4 : r.severity === "heatwave" ? 2 : 1.6;
          return (
            <g
              key={r.id}
              transform={`translate(${r.x} ${r.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(r)}
              role="button"
              aria-label={`${r.name}, ${m.label}, ${r.temp} degrees`}
            >
              {(r.severity === "severe" || r.severity === "heatwave") && (
                <circle r={size * 2.2} fill={m.color} opacity={active ? 0.22 : 0.12} className="pulse-dot" />
              )}
              <circle r={size} fill={m.color} filter="url(#markerGlow)" stroke="#0b1120" strokeWidth={0.3} />
              {active && <circle r={size + 1.4} fill="none" stroke={m.color} strokeWidth={0.5} opacity={0.8} />}
              {!compact && (
                <text x={size + 1.6} y={1} fontSize={2.6} fill={active ? "#e8edf5" : "#93a2ba"} fontFamily="Inter, sans-serif" fontWeight={active ? 600 : 400}>
                  {r.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
