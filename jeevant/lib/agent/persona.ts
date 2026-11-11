// One consistent persona for text and voice. Stored as a single Setting so it
// can be changed from the phone without a redeploy.

import connectDB from "@/lib/db";
import { Setting } from "@/lib/database/models";

export type PersonaTone = "direct" | "warm" | "playful" | "formal";
export type PersonaLanguage = "auto" | "english" | "hinglish";

export type Persona = {
  name: string;
  tone: PersonaTone;
  language: PersonaLanguage;
};

const DEFAULTS: Persona = { name: "Jeevant", tone: "direct", language: "auto" };
const TONES: PersonaTone[] = ["direct", "warm", "playful", "formal"];
const LANGUAGES: PersonaLanguage[] = ["auto", "english", "hinglish"];

export function normalizePersona(value: unknown): Persona {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const name = String(source.name || DEFAULTS.name).trim().slice(0, 30) || DEFAULTS.name;
  const tone = TONES.includes(source.tone as PersonaTone) ? (source.tone as PersonaTone) : DEFAULTS.tone;
  const language = LANGUAGES.includes(source.language as PersonaLanguage)
    ? (source.language as PersonaLanguage)
    : DEFAULTS.language;
  return { name, tone, language };
}

export async function getPersona(): Promise<Persona> {
  try {
    await connectDB();
    const doc: any = await Setting.findOne({ key: "persona" });
    return normalizePersona(doc?.value);
  } catch {
    return DEFAULTS;
  }
}

export async function savePersona(patch: unknown): Promise<Persona> {
  await connectDB();
  const current = await getPersona();
  const source = patch && typeof patch === "object" ? (patch as Record<string, unknown>) : {};
  const next = normalizePersona({ ...current, ...source });
  await Setting.findOneAndUpdate(
    { key: "persona" },
    { key: "persona", value: next, updatedAt: new Date() },
    { upsert: true }
  );
  return next;
}

export function personaPrompt(persona: Persona): string {
  const tone =
    persona.tone === "warm"
      ? "Calm, supportive, and human. Still concise; no gushing."
      : persona.tone === "playful"
      ? "Light wit is fine, never at the user's expense. Keep the useful answer first."
      : persona.tone === "formal"
      ? "Polished and precise. No slang unless the user uses it first."
      : "Short, concrete, no filler. Lead with the answer.";

  const language =
    persona.language === "english"
      ? "Reply in clear English even if the user mixes languages. Keep names and quoted text intact."
      : persona.language === "hinglish"
      ? "Reply in natural Hinglish (Hindi-English in Latin script) unless the user explicitly asks for English."
      : "Mirror the user's language and register. Match Hinglish naturally instead of translating it.";

  return `IDENTITY:
You are ${persona.name}, the user's personal operator. Stay in this one voice across text and voice.
Tone: ${tone}
Language: ${language}
Spoken replies: keep them to 1-3 short sentences unless the user asks for detail. No markdown headings in speech.
Never refer to yourself as a generic "AI assistant". Do not read tool names, JSON, or internal IDs aloud unless asked.`;
}

export function ttsLocale(persona: Persona): string {
  return persona.language === "english" ? "en-US" : "en-IN";
}
