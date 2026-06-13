import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pre-defined color classes to ensure Tailwind compiles them correctly.
// Using 5 distinct colors for the Tactical Warfare UI.
const TACTICAL_COLORS = [
  {
    name: "emerald",
    text: "text-emerald-500",
    textHover: "group-hover:text-emerald-400 group-hover/item:text-emerald-400",
    border: "border-emerald-500",
    borderHover: "hover:border-emerald-500 group-hover/item:border-emerald-500",
    bg: "bg-emerald-500",
    bgMuted: "bg-emerald-500/10",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    gradientVia: "via-emerald-500/50",
  },
  {
    name: "cyan",
    text: "text-cyan-500",
    textHover: "group-hover:text-cyan-400 group-hover/item:text-cyan-400",
    border: "border-cyan-500",
    borderHover: "hover:border-cyan-500 group-hover/item:border-cyan-500",
    bg: "bg-cyan-500",
    bgMuted: "bg-cyan-500/10",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    gradientVia: "via-cyan-500/50",
  },
  {
    name: "violet",
    text: "text-violet-500",
    textHover: "group-hover:text-violet-400 group-hover/item:text-violet-400",
    border: "border-violet-500",
    borderHover: "hover:border-violet-500 group-hover/item:border-violet-500",
    bg: "bg-violet-500",
    bgMuted: "bg-violet-500/10",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    gradientVia: "via-violet-500/50",
  },
  {
    name: "amber",
    text: "text-amber-500",
    textHover: "group-hover:text-amber-400 group-hover/item:text-amber-400",
    border: "border-amber-500",
    borderHover: "hover:border-amber-500 group-hover/item:border-amber-500",
    bg: "bg-amber-500",
    bgMuted: "bg-amber-500/10",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    gradientVia: "via-amber-500/50",
  },
  {
    name: "rose",
    text: "text-rose-500",
    textHover: "group-hover:text-rose-400 group-hover/item:text-rose-400",
    border: "border-rose-500",
    borderHover: "hover:border-rose-500 group-hover/item:border-rose-500",
    bg: "bg-rose-500",
    bgMuted: "bg-rose-500/10",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    gradientVia: "via-rose-500/50",
  }
];

export function getTacticalColor(index: number) {
  return TACTICAL_COLORS[index % TACTICAL_COLORS.length];
}