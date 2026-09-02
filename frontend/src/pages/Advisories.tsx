import { useMemo, useState } from "react";
import { Check, HeartPulse, Landmark, RefreshCw, Sprout, Users, X } from "lucide-react";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { Advisory, AudienceKey } from "../types";
import Panel from "../components/ui/Panel";
import SegmentedTabs from "../components/ui/SegmentedTabs";
import SeverityBadge from "../components/ui/SeverityBadge";
import StatusPill from "../components/ui/StatusPill";
import Button from "../components/ui/Button";
import { EmptyState, Skeleton } from "../components/ui/States";

const audienceMeta: Record<AudienceKey, { label: string; icon: typeof Users }> = {
  CITIZENS: { label: "Citizens", icon: Users },
  AUTHORITIES: { label: "Authorities", icon: Landmark },
  FARMERS: { label: "Farmers", icon: Sprout },
  HEALTHCARE: { label: "Healthcare", icon: HeartPulse },
};

export default function Advisories() {
  const { data, loading, reload } = useAsync(api.getAdvisories, []);
  const [tab, setTab] = useState<AudienceKey>("CITIZENS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Advisory["status"]>>({});

  const advisories = (data ?? []).map((a) => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a));
  const filtered = useMemo(() => advisories.filter((a) => a.audience === tab), [advisories, tab]);

  async function setStatus(id: string, status: Advisory["status"]) {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      if (status === "approved") {
        await api.approveAdvisory(id);
      } else if (status === "pending") {
        // Regenerate button clicked
        const ad = advisories.find((a) => a.id === id);
        if (ad) {
          const regions = await api.getRegions();
          const regionInfo = regions.find((r) => r.name.toLowerCase() === ad.region.toLowerCase());
          
          if (regionInfo?.temp == null) {
            alert("Error: Could not retrieve the current temperature for this region from the backend. Generation requires a valid temperature.");
            return; // Allow retry by returning early without reloading
          }
          
          await api.generateAdvisories(ad.region, ad.severity, regionInfo.temp);
        }
      } else if (status === "rejected") {
        setOverrides((o) => ({ ...o, [id]: status }));
        return; // Don't reload, just override locally
      }
      reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }

  const tabs = (Object.keys(audienceMeta) as AudienceKey[]).map((k) => ({
    value: k,
    label: audienceMeta[k].label,
    count: advisories.filter((a) => a.audience === k).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs<AudienceKey> value={tab} onChange={setTab} options={tabs} />
        <span className="text-xs text-ink-faint">
          {advisories.filter((a) => a.status === "pending").length} advisories awaiting review
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div>
      ) : filtered.length === 0 ? (
        <Panel><EmptyState icon={<Users className="h-5 w-5" />} title="No advisories for this audience" hint="Generated advisories for this stakeholder group will appear here." /></Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((a, i) => (
            <AdvisoryCard key={a.id} advisory={a} index={i} onStatus={setStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdvisoryCard({ advisory, index, onStatus }: { advisory: Advisory; index: number; onStatus: (id: string, s: Advisory["status"]) => void }) {
  const { icon: Icon, label } = audienceMeta[advisory.audience];
  const pending = advisory.status === "pending";
  return (
    <Panel className="flex flex-col" hover>
      <div style={{ animation: `inUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both` }} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-elevated text-teal">
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">{advisory.region}</p>
              <p className="font-mono text-[11px] text-ink-faint">{advisory.id} · {label} · {advisory.generated}</p>
            </div>
          </div>
          <SeverityBadge severity={advisory.severity} size="sm" />
        </div>

        <div className="flex-1 px-4">
          <p className="rounded-lg border border-hairline bg-navy/40 p-3 text-[13px] leading-relaxed text-ink-muted">{advisory.text}</p>
        </div>

        <div className="flex items-center justify-between gap-2 p-4 pt-3">
          <StatusPill tone={advisory.status} />
          {pending ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => onStatus(advisory.id, "pending")}>
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button size="sm" variant="danger" onClick={() => onStatus(advisory.id, "rejected")}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button size="sm" variant="primary" onClick={() => onStatus(advisory.id, "approved")}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onStatus(advisory.id, "pending")}>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
