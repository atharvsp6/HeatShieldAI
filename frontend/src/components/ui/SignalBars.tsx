import { cn } from "../../utils/cn";

export default function SignalBars({ level }: { level: number }) {
  const tone = level === 0 ? "bg-[#f43f5e]" : level <= 1 ? "bg-[#fbbf24]" : "bg-teal";
  return (
    <div className="flex items-end gap-0.5" aria-label={`Signal strength ${level} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-1 rounded-sm transition-colors", i < level ? tone : "bg-white/10")}
          style={{ height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  );
}
