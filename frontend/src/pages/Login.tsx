import { useState, useEffect, useRef } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Radar,
  ShieldHalf,
  Thermometer,
  MapPin,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { Role, User } from "../types";
import { severityMeta } from "../utils/severity";
import Button from "../components/ui/Button";
import { api } from "../services/api";

/* ── role profiles for demo access ─────────────────────────────── */

const roleProfiles: Record<Role, { name: string; role: Role; initials: string; username: string; password: string; desc: string }> = {
  ADMIN: { name: "A. Sharma", role: "ADMIN", initials: "AS", username: "admin", password: "admin123", desc: "Full system control" },
  METEOROLOGIST: { name: "Dr. R. Iyer", role: "METEOROLOGIST", initials: "RI", username: "meteorologist", password: "met123", desc: "Forecast & analysis" },
  AUTHORITY: { name: "K. Menon", role: "AUTHORITY", initials: "KM", username: "authority", password: "auth123", desc: "Emergency response" },
  CITIZEN: { name: "P. Nair", role: "CITIZEN", initials: "PN", username: "citizen", password: "citizen123", desc: "Public safety info" },
};

/* ── capabilities list ─────────────────────────────────────────── */

const capabilities = [
  { icon: Radar, title: "Live heatwave monitoring", desc: "Multi-station weather network, updated in real time", color: "#22d3c5" },
  { icon: BrainCircuit, title: "AI temperature forecasting", desc: "72-hour horizon at 94% validated accuracy", color: "#38bdf8" },
  { icon: Activity, title: "Action-ready early warnings", desc: "Advisories routed to the right stakeholders", color: "#fb923c" },
];

/* ── live stat tickers ─────────────────────────────────────────── */

const stats = [
  { label: "Stations Online", value: 24, suffix: "", icon: MapPin },
  { label: "Regions Covered", value: 12, suffix: "", icon: Globe },
  { label: "Forecast Accuracy", value: 94, suffix: "%", icon: TrendingUp },
  { label: "Active Alerts", value: 7, suffix: "", icon: Zap },
];

/* ── animated counter hook ─────────────────────────────────────── */

function useCounter(target: number, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = target / (duration / 16);
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

/* ── floating particle canvas ──────────────────────────────────── */

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; hue: number }[] = [];

    function resize() {
      canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }

    resize();
    window.addEventListener("resize", resize);

    // spawn particles
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.6 ? 174 : Math.random() > 0.5 ? 199 : 25,
      });
    }

    function draw() {
      const cw = canvas!.offsetWidth;
      const ch = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, cw, ch);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.o})`;
        ctx!.fill();

        // glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${p.o * 0.3})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(34, 211, 197, ${0.06 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

/* ── animated map motif ────────────────────────────────────────── */

function MapMotif() {
  const [scanY, setScanY] = useState(0);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    api.getRegions().then(setRegions).catch(() => {});
  }, []);

  useEffect(() => {
    let frame: number;
    let y = 0;
    function animate() {
      y = (y + 0.15) % 100;
      setScanY(y);
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg viewBox="0 0 100 100" className="w-full drop-shadow-2xl">
      <defs>
        <radialGradient id="motifLand" cx="45%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1a2d4a" />
          <stop offset="100%" stopColor="#0d1524" />
        </radialGradient>
        <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,197,0)" />
          <stop offset="40%" stopColor="rgba(34,211,197,0.15)" />
          <stop offset="50%" stopColor="rgba(34,211,197,0.4)" />
          <stop offset="60%" stopColor="rgba(34,211,197,0.15)" />
          <stop offset="100%" stopColor="rgba(34,211,197,0)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* contour rings with animation */}
      {[30, 23, 16, 9].map((r, i) => (
        <circle
          key={r}
          cx="44"
          cy="30"
          r={r}
          fill="none"
          stroke="#f43f5e"
          strokeOpacity={0.05 + i * 0.03}
          strokeWidth={0.3}
          strokeDasharray="2 3"
          className="animate-[spin_60s_linear_infinite]"
          style={{ transformOrigin: "44px 30px", animationDuration: `${40 + i * 15}s`, animationDirection: i % 2 === 0 ? "normal" : "reverse" }}
        />
      ))}

      {/* land mass */}
      <path
        d="M40 10 L47 9 L52 13 L58 12 L62 15 L60 20 L65 22 L72 20 L78 26 L82 24 L80 30 L74 33 L70 31 L66 34 L70 38 L68 43 L63 45 L66 50 L64 55 L58 60 L55 66 L52 73 L49 80 L46 86 L44 82 L45 74 L42 68 L40 60 L36 55 L33 49 L29 50 L26 46 L29 41 L27 36 L31 33 L34 35 L35 30 L32 26 L34 21 L38 18 Z"
        fill="url(#motifLand)"
        stroke="#2a3a52"
        strokeWidth={0.4}
        strokeLinejoin="round"
        className="drop-shadow-lg"
      />

      {/* heat gradient overlay on land */}
      <path
        d="M40 10 L47 9 L52 13 L58 12 L62 15 L60 20 L65 22 L72 20 L78 26 L82 24 L80 30 L74 33 L70 31 L66 34 L70 38 L68 43 L63 45 L66 50 L64 55 L58 60 L55 66 L52 73 L49 80 L46 86 L44 82 L45 74 L42 68 L40 60 L36 55 L33 49 L29 50 L26 46 L29 41 L27 36 L31 33 L34 35 L35 30 L32 26 L34 21 L38 18 Z"
        fill="url(#hotspot)"
        opacity={0.5}
      />

      {/* scan line */}
      <rect x="0" y={scanY - 8} width="100" height="16" fill="url(#scanLine)" opacity={0.7} />

      {/* region dots */}
      {regions.slice(0, 8).map((r, i) => {
        const m = severityMeta[r.severity];
        return (
          <g key={r.id} transform={`translate(${r.x} ${r.y})`} filter="url(#glow)">
            {/* outer pulse ring */}
            {(r.severity === "severe" || r.severity === "heatwave") && (
              <>
                <circle r={5} fill="none" stroke={m.color} strokeWidth={0.3} opacity={0.3} className="pulse-dot" />
                <circle r={3.5} fill={m.color} opacity={0.1} className="pulse-dot" />
              </>
            )}
            {/* data dot */}
            <circle r={1.6} fill={m.color} />
            {/* tiny label */}
            <text
              x={3}
              y={-1}
              fontSize={2.8}
              fill={m.color}
              fontFamily="Inter, sans-serif"
              fontWeight={600}
              opacity={0.9}
              style={{ animationDelay: `${i * 0.15}s` }}
              className="animate-fade"
            >
              {r.temp}°
            </text>
          </g>
        );
      })}

      {/* grid overlay */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(148,163,184,0.03)" strokeWidth="0.2" />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(148,163,184,0.03)" strokeWidth="0.2" />
      ))}
    </svg>
  );
}

/* ── stat ticker component ─────────────────────────────────────── */

function StatTicker({ label, value, suffix, icon: Icon, delay }: { label: string; value: number; suffix: string; icon: typeof MapPin; delay: number }) {
  const count = useCounter(value, 1800, delay);
  return (
    <div className="group relative flex flex-col items-center gap-1 rounded-xl border border-hairline/50 bg-surface/30 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-teal/30 hover:bg-teal/5">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-teal/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Icon className="relative h-4 w-4 text-teal/60 transition-colors group-hover:text-teal" strokeWidth={1.8} />
      <p className="relative text-lg font-bold tabular-nums text-ink">
        {count}
        <span className="text-teal">{suffix}</span>
      </p>
      <p className="relative text-[10px] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN PAGE — cinematic landing experience
   ═══════════════════════════════════════════════════════════════════ */

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("METEOROLOGIST");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

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
    <div className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-abyss lg:grid-cols-[55fr_45fr]">

      {/* ─── Aurora background glow ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[30%] -top-[20%] h-[70vh] w-[70vh] rounded-full bg-teal/[0.04] blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute -right-[20%] top-[30%] h-[50vh] w-[50vh] rounded-full bg-[#f43f5e]/[0.03] blur-[100px] animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[10%] left-[40%] h-[40vh] w-[40vh] rounded-full bg-cyan/[0.03] blur-[80px] animate-[float_18s_ease-in-out_infinite_2s]" />
      </div>

      {/* ─── LEFT — immersive brand showcase ─── */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-hairline/40 lg:flex">
        {/* particle canvas */}
        <ParticleField />

        {/* subtle grid texture */}
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-40" />

        {/* radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_15%_0%,rgba(34,211,197,0.1),transparent_60%),radial-gradient(50%_50%_at_100%_100%,rgba(251,146,60,0.07),transparent_60%)]" />

        {/* content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

          {/* logo */}
          <div
            className="flex items-center gap-3 transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)" }}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal via-teal-dim to-cyan shadow-[0_0_24px_rgba(34,211,197,0.3)]">
              <ShieldHalf className="h-5 w-5 text-[#04211f]" strokeWidth={2.4} />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent" />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-ink">HEATSHIELD</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal/70">Climate Intelligence</p>
            </div>
          </div>

          {/* map + hero */}
          <div className="flex flex-col items-center">
            {/* map motif */}
            <div
              className="relative mx-auto w-full max-w-[340px] transition-all duration-1000 delay-200"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)" }}
            >
              <MapMotif />
              {/* glow under map */}
              <div className="absolute -bottom-8 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full bg-teal/10 blur-2xl" />
            </div>

            {/* hero text */}
            <div
              className="mt-6 text-center transition-all duration-700 delay-500"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)" }}
            >
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-teal shadow-[0_0_20px_rgba(34,211,197,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                </span>
                AI-powered heat intelligence
              </p>
              <h2 className="mx-auto max-w-lg text-[24px] font-semibold leading-snug tracking-tight text-ink xl:text-[28px]">
                Turn weather signals into{" "}
                <span className="bg-gradient-to-r from-teal via-cyan to-teal bg-clip-text text-transparent">
                  actionable intelligence
                </span>{" "}
                before extreme heat becomes a crisis.
              </h2>
            </div>
          </div>

          {/* stat tickers */}
          <div
            className="grid grid-cols-4 gap-3 transition-all duration-700 delay-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)" }}
          >
            {stats.map((s, i) => (
              <StatTicker key={s.label} {...s} delay={800 + i * 200} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT — login panel ─── */}
      <div className="relative flex items-center justify-center overflow-y-auto p-6 sm:p-10">
        {/* subtle background effect for right panel */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,197,0.05),transparent_50%)]" />

        <div
          className="relative w-full max-w-sm transition-all duration-700 delay-300"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)" }}
        >
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal via-teal-dim to-cyan shadow-[0_0_24px_rgba(34,211,197,0.3)]">
              <ShieldHalf className="h-5 w-5 text-[#04211f]" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-ink">HEATSHIELD</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal/70">Climate Intelligence</p>
            </div>
          </div>

          {/* welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-ink-faint">
              Sign in to the <span className="text-ink-muted">command center</span> to continue.
            </p>
          </div>

          {/* capabilities — elegant horizontal */}
          <div className="mb-8 flex gap-3">
            {capabilities.map((c, i) => (
              <div
                key={c.title}
                className="group relative flex-1 rounded-xl border border-hairline/50 bg-surface/40 p-3 backdrop-blur-sm transition-all duration-300 hover:border-teal/25 hover:bg-surface/70"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <c.icon className="relative mb-2 h-4 w-4 transition-colors" style={{ color: c.color }} strokeWidth={2} />
                <p className="relative text-[11px] font-semibold leading-tight text-ink">{c.title}</p>
              </div>
            ))}
          </div>

          {/* login form — glassmorphism card */}
          <div className="rounded-2xl border border-hairline/60 bg-surface/50 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <form onSubmit={submit} className="space-y-4">
              <Field label="Username">
                <input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="meteorologist"
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-hairline/80 bg-abyss/60 px-4 text-sm text-ink placeholder:text-ink-faint/50 transition-all duration-200 focus:border-teal/50 focus:shadow-[0_0_0_3px_rgba(34,211,197,0.1)] focus:outline-none"
                />
              </Field>
              <Field label="Password">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-hairline/80 bg-abyss/60 px-4 text-sm text-ink placeholder:text-ink-faint/50 transition-all duration-200 focus:border-teal/50 focus:shadow-[0_0_0_3px_rgba(34,211,197,0.1)] focus:outline-none"
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                className="group/btn relative h-12 w-full overflow-hidden rounded-xl text-[14px] font-bold shadow-[0_8px_24px_-8px_rgba(34,211,197,0.5)]"
                disabled={loading || !username || !password}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#04211f] border-t-transparent" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </>
                  )}
                </span>
                {/* shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              </Button>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-[#f43f5e]/20 bg-[#f43f5e]/5 px-3 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
                  <p className="text-xs font-medium text-[#f43f5e]">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-hairline to-transparent" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">Demo access</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-hairline to-transparent" />
          </div>

          {/* role cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(roleProfiles) as Role[]).map((r) => (
              <button
                key={r}
                id={`demo-role-${r.toLowerCase()}`}
                type="button"
                onClick={() => handleRoleClick(r)}
                className={`group relative overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
                  role === r
                    ? "border-teal/40 bg-teal/10 shadow-[0_0_20px_rgba(34,211,197,0.1)]"
                    : "border-hairline/50 bg-surface/30 hover:border-hairline-strong hover:bg-surface/60"
                }`}
              >
                {role === r && (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent" />
                )}
                <div className="relative flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${
                    role === r
                      ? "bg-teal/20 text-teal"
                      : "bg-elevated text-ink-faint"
                  }`}>
                    {roleProfiles[r].initials}
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold tracking-wide ${role === r ? "text-teal" : "text-ink-muted"}`}>{r}</p>
                    <p className="text-[10px] text-ink-faint">{roleProfiles[r].desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-[10px] font-medium text-ink-faint/60">
            Select a role and click Sign In · No registration required for demo
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── field wrapper ─────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
