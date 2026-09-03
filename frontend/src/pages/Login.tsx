import { useState } from "react";
import { Activity, ArrowRight, BrainCircuit, Radar, ShieldHalf } from "lucide-react";
import type { Role, User } from "../types";
import { regions } from "../data/mock/regions";
import { severityMeta } from "../utils/severity";
import Button from "../components/ui/Button";

import { api } from "../services/api";

const roleProfiles: Record<Role, { name: string; role: Role; initials: string; username: string; password: string }> = {
  ADMIN: { name: "A. Sharma", role: "ADMIN", initials: "AS", username: "admin", password: "admin123" },
  METEOROLOGIST: { name: "Dr. R. Iyer", role: "METEOROLOGIST", initials: "RI", username: "meteorologist", password: "met123" },
  AUTHORITY: { name: "K. Menon", role: "AUTHORITY", initials: "KM", username: "authority", password: "auth123" },
  CITIZEN: { name: "P. Nair", role: "CITIZEN", initials: "PN", username: "citizen", password: "citizen123" },
};

const capabilities = [
  { icon: Radar, title: "Live heatwave monitoring", desc: "Multi-station weather network, updated in real time" },
  { icon: BrainCircuit, title: "AI temperature forecasting", desc: "72-hour horizon at 94% validated accuracy" },
  { icon: Activity, title: "Action-ready early warnings", desc: "Advisories routed to the right stakeholders" },
];

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("METEOROLOGIST");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await api.login(username, password);
      onLogin(user);
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleClick(r: Role) {
    setRole(r);
    setUsername(roleProfiles[r].username);
    setPassword(roleProfiles[r].password);
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-abyss lg:grid-cols-[55fr_45fr]">
      {/* LEFT — brand experience */}
      <div className="radial-glow relative hidden flex-col justify-between overflow-y-auto border-r border-hairline bg-navy p-10 lg:flex xl:p-14">
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal-dim">
            <ShieldHalf className="h-5 w-5 text-[#04211f]" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-ink">HEATSHIELD</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">Climate Intelligence</p>
          </div>
        </div>

        {/* map motif */}
        <div className="relative mx-auto my-8 w-full max-w-md">
          <MapMotif />
        </div>

        <div className="relative">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3 py-1 text-[11px] font-medium text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal pulse-dot" /> AI-powered heat intelligence &amp; early warning
          </p>
          <h2 className="max-w-lg text-[26px] font-semibold leading-snug tracking-tight text-ink xl:text-[30px]">
            Turn weather signals into actionable intelligence before extreme heat becomes a public health emergency.
          </h2>

          <div className="mt-8 grid max-w-lg gap-3">
            {capabilities.map((c) => (
              <div key={c.title} className="flex items-start gap-3 rounded-lg border border-hairline bg-surface/50 p-3 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-teal">
                  <c.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{c.title}</p>
                  <p className="text-xs text-ink-faint">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — login panel */}
      <div className="relative flex items-center justify-center overflow-y-auto p-6 sm:p-10">
        <div className="w-full max-w-sm animate-in-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal-dim">
              <ShieldHalf className="h-5 w-5 text-[#04211f]" strokeWidth={2.4} />
            </div>
            <p className="text-[15px] font-bold tracking-tight text-ink">HEATSHIELD</p>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-faint">Sign in to the command center to continue.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="meteorologist"
                autoComplete="username"
                className="h-11 w-full rounded-lg border border-hairline bg-surface/80 px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-teal/50 focus:outline-none"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-hairline bg-surface/80 px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-teal/50 focus:outline-none"
              />
            </Field>

            <Button type="submit" variant="primary" className="h-11 w-full" disabled={loading || !username || !password}>
              {loading ? "Signing In..." : "Sign In"} {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">Demo access</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(roleProfiles) as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleClick(r)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                  role === r
                    ? "border-teal/50 bg-teal/10"
                    : "border-hairline bg-surface/60 hover:border-hairline-strong"
                }`}
              >
                <p className={`text-[11px] font-semibold tracking-wide ${role === r ? "text-teal" : "text-ink-muted"}`}>{r}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{roleProfiles[r].name}</p>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-faint">
            Selected role signs in instantly · No credentials required for demo
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function MapMotif() {
  return (
    <svg viewBox="0 0 100 100" className="w-full">
      <defs>
        <radialGradient id="motifLand" cx="45%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#16223a" />
          <stop offset="100%" stopColor="#0d1524" />
        </radialGradient>
      </defs>
      {/* contour rings */}
      {[26, 20, 14, 8].map((r, i) => (
        <circle key={r} cx="44" cy="30" r={r} fill="none" stroke="#f43f5e" strokeOpacity={0.06 + i * 0.04} strokeWidth={0.4} />
      ))}
      <path
        d="M40 10 L47 9 L52 13 L58 12 L62 15 L60 20 L65 22 L72 20 L78 26 L82 24 L80 30 L74 33 L70 31 L66 34 L70 38 L68 43 L63 45 L66 50 L64 55 L58 60 L55 66 L52 73 L49 80 L46 86 L44 82 L45 74 L42 68 L40 60 L36 55 L33 49 L29 50 L26 46 L29 41 L27 36 L31 33 L34 35 L35 30 L32 26 L34 21 L38 18 Z"
        fill="url(#motifLand)"
        stroke="#2a3a52"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
      {regions.slice(0, 8).map((r) => {
        const m = severityMeta[r.severity];
        return (
          <g key={r.id} transform={`translate(${r.x} ${r.y})`}>
            {(r.severity === "severe" || r.severity === "heatwave") && (
              <circle r={3.4} fill={m.color} opacity={0.14} className="pulse-dot" />
            )}
            <circle r={1.4} fill={m.color} />
          </g>
        );
      })}
    </svg>
  );
}
