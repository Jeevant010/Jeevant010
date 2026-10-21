// Shared contracts for the automation layer (voice → drafts → distribution).

export type DraftKind = "email" | "linkedin" | "youtube" | "whatsapp" | "twitter" | "generic";

export type Intent = "email" | "content" | "schedule" | "mixed";

export interface DraftArtifact {
  kind: DraftKind;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}

export interface PlanBlock {
  title: string;
  start?: string; // ISO string
  end?: string; // ISO string
  notes?: string;
}

export interface TaskSuggestion {
  title: string;
  priority?: "low" | "medium" | "high";
}

export interface DraftBundle {
  intent: Intent;
  drafts: DraftArtifact[];
  calendarBlocks: PlanBlock[];
  taskSuggestions: TaskSuggestion[];
  simulated: boolean;
  provider: string;
  error?: string;
}

export interface TranscriptResult {
  text: string;
  simulated: boolean;
  provider: string;
  error?: string;
}

export type ChannelId =
  | "telegram"
  | "whatsapp"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "reddit"
  | "email";

export interface ChannelMeta {
  id: ChannelId;
  label: string;
  hint: string;
  accent: string;
}

export interface DispatchOutcome {
  channel: string;
  ok: boolean;
  mode: string; // webhook | direct | link | manual | failed
  url?: string;
  detail?: string;
}
