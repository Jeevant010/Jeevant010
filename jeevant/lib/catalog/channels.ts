// Client-safe channel catalog. No server-only imports here so it can be used
// inside client components (the Composer and Post board).

import type { ChannelMeta } from "@/lib/integrations/types";

export const CHANNELS: ChannelMeta[] = [
  { id: "whatsapp", label: "WhatsApp", hint: "Share link or n8n", accent: "emerald" },
  { id: "telegram", label: "Telegram", hint: "Direct via Bot API", accent: "sky" },
  { id: "twitter", label: "X / Twitter", hint: "Share intent or n8n", accent: "slate" },
  { id: "linkedin", label: "LinkedIn", hint: "Share intent or n8n", accent: "blue" },
  { id: "youtube", label: "YouTube", hint: "Outline → copy / n8n", accent: "rose" },
  { id: "reddit", label: "Reddit", hint: "Submit or n8n", accent: "orange" },
  { id: "discord", label: "Discord", hint: "Webhook", accent: "indigo" },
  { id: "slack", label: "Slack", hint: "Webhook", accent: "amber" },
  { id: "mastodon", label: "Mastodon", hint: "Access token", accent: "violet" },
  { id: "email", label: "Email", hint: "Gmail draft or n8n", accent: "violet" },
];

export const CHANNEL_ACCENT: Record<string, string> = {
  emerald: "border-emerald-600/60 bg-emerald-950/20 text-emerald-400",
  sky: "border-sky-600/60 bg-sky-950/20 text-sky-400",
  slate: "border-slate-600/60 bg-slate-900/40 text-slate-300",
  blue: "border-blue-600/60 bg-blue-950/20 text-blue-400",
  rose: "border-rose-600/60 bg-rose-950/20 text-rose-400",
  orange: "border-orange-600/60 bg-orange-950/20 text-orange-400",
  violet: "border-violet-600/60 bg-violet-950/20 text-violet-400",
  indigo: "border-indigo-600/60 bg-indigo-950/20 text-indigo-400",
};
