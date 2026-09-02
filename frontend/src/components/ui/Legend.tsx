import type { Severity } from "../../types";
import { severityMeta } from "../../utils/severity";

const order: Severity[] = ["normal", "watch", "heatwave", "severe"];

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {order.map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityMeta[s].color }} />
          {severityMeta[s].label}
        </span>
      ))}
    </div>
  );
}
