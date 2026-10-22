import type { ReactNode } from "react";
import Atmosphere from "@/components/ui/Atmosphere";

export type ShellAccent = "emerald" | "amber" | "blue" | "sky" | "rose" | "violet" | "pink" | "green";

// A single restrained tone. The old per-page rainbow (pink/green/blue/violet)
// made the admin feel like different products glued together.
const NEUTRAL = {
  text: "text-[#d8cfbe]",
  border: "border-white/10",
  bg: "bg-white/5",
  glow: "shadow-[0_0_40px_rgba(200,180,138,0.08)]",
  dot: "bg-[#c8b48a]",
};

const ACCENTS: Record<ShellAccent, typeof NEUTRAL> = {
  emerald: NEUTRAL,
  amber: NEUTRAL,
  blue: NEUTRAL,
  sky: NEUTRAL,
  rose: NEUTRAL,
  violet: NEUTRAL,
  pink: NEUTRAL,
  green: NEUTRAL,
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
