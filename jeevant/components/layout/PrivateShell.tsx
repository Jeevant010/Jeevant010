import type { ReactNode } from "react";
import Atmosphere from "@/components/ui/Atmosphere";

export type ShellAccent = "emerald" | "amber" | "blue" | "sky" | "rose" | "violet" | "pink" | "green";

const ACCENTS: Record<ShellAccent, { text: string; border: string; bg: string; glow: string; dot: string }> = {
  emerald: {
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.16)]",
    dot: "bg-emerald-400",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.16)]",
    dot: "bg-amber-400",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.16)]",
    dot: "bg-blue-400",
  },
  sky: {
    text: "text-sky-400",
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    glow: "shadow-[0_0_40px_rgba(14,165,233,0.16)]",
    dot: "bg-sky-400",
  },
  rose: {
    text: "text-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.16)]",
    dot: "bg-rose-400",
  },
  violet: {
    text: "text-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.16)]",
    dot: "bg-violet-400",
  },
  pink: {
    text: "text-pink-400",
    border: "border-pink-500/40",
    bg: "bg-pink-500/10",
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.16)]",
    dot: "bg-pink-400",
  },
  green: {
    text: "text-green-400",
    border: "border-green-500/40",
    bg: "bg-green-500/10",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.16)]",
    dot: "bg-green-400",
  },
};

export default function PrivateShell({
  eyebrow,
  title,
  description,
  accent = "emerald",
  icon,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  accent?: ShellAccent;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const tone = ACCENTS[accent];

  return (
    <div className="relative min-h-full overflow-hidden bg-[#07080a] p-5 font-mono text-shell-text sm:p-8 lg:p-10">
      <Atmosphere />

      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <header className="private-header mb-8 border-b border-white/5 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              {icon ? (
                <div className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${tone.border} ${tone.bg} ${tone.glow} sm:flex`}>
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${tone.text}`}>
                  <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${tone.dot}`} />
                  {eyebrow}
                </p>
                <h1 className="private-title mt-2">{title}</h1>
                {description ? (
                  <p className="mt-2 max-w-2xl text-[11px] uppercase tracking-[0.16em] text-shell-muted/80">{description}</p>
                ) : null}
              </div>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
