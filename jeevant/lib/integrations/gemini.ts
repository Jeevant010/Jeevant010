// Drafting engine. Uses Google Gemini with a rotating pool of API keys
// (GEMINI_API_KEYS is a comma-separated list). Falls back to a deterministic
// local draft when no keys are configured, so the pipeline is always usable.

import type { DraftBundle, DraftArtifact, Intent, PlanBlock, TaskSuggestion } from "./types";
import { groqChat, groqConfigured, groqModel } from "./groq";

function apiKeys(): string[] {
  return (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export function geminiConfigured(): boolean {
  return apiKeys().length > 0;
}

let cursor = 0;
function nextKey(): string {
  const keys = apiKeys();
  const key = keys[cursor % keys.length];
  cursor = (cursor + 1) % Math.max(keys.length, 1);
  return key;
}

function modelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

const SYSTEM_PROMPT = `You are the drafting engine inside Jeevant's personal operating system.
You receive a raw, spoken voice note and turn it into ready-to-use artifacts.

Decide the intent:
- "email": the note asks to reply/write/send a message or email to someone.
- "content": the note is a brain-dump about work, a bug, an architecture decision, a win — material for social/content.
- "schedule": the note lists tasks, targets, deadlines, or things to block time for.
- "mixed": more than one of the above.

Then produce artifacts. Rules:
- Always produce a "linkedin" draft (a crisp first-person post with a strong hook and a light call to action) AND a "youtube" draft (a structured outline: hook, 3-6 sections with talking points, outro) when the intent is "content" or "mixed".
- Produce an "email" draft (subject + polite, formal, concise body) when the intent is "email" or "mixed". Resolve relative dates ("Friday 5 PM") against the CURRENT DATETIME provided.
- Produce "twitter" (<= 280 chars) and "whatsapp" (short, casual) drafts for "content"/"mixed".
- For "schedule"/"mixed", fill calendarBlocks (title + ISO start/end) and taskSuggestions (title + priority).
- Never invent facts that are not implied by the note. Keep the author's voice. No emoji unless it fits.

Return ONLY valid JSON matching this shape:
{
  "intent": "email" | "content" | "schedule" | "mixed",
  "drafts": [{ "kind": "email"|"linkedin"|"youtube"|"whatsapp"|"twitter"|"generic", "title": string, "body": string }],
  "calendarBlocks": [{ "title": string, "start": string, "end": string, "notes": string }],
  "taskSuggestions": [{ "title": string, "priority": "low"|"medium"|"high" }]
}`;

function buildPrompt(transcript: string, hint?: string): string {
  const now = new Date();
  return [
    `CURRENT_DATETIME: ${now.toISOString()} (local: ${now.toString()})`,
    hint ? `REQUESTED_FOCUS: ${hint}` : "",
    "",
    "VOICE_NOTE_TRANSCRIPT:",
    '"""',
    transcript,
    '"""',
  ]
    .filter(Boolean)
    .join("\n");
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

function coerce(raw: any): DraftBundle {
  const allowedKinds = ["email", "linkedin", "youtube", "whatsapp", "twitter", "generic"];
  const drafts: DraftArtifact[] = Array.isArray(raw?.drafts)
    ? raw.drafts
        .filter((d: any) => d && typeof d.body === "string")
        .map((d: any) => ({
          kind: allowedKinds.includes(d.kind) ? d.kind : "generic",
          title: typeof d.title === "string" ? d.title : "",
          body: String(d.body),
          meta: d.meta && typeof d.meta === "object" ? d.meta : undefined,
        }))
    : [];

  const calendarBlocks: PlanBlock[] = Array.isArray(raw?.calendarBlocks)
    ? raw.calendarBlocks
        .filter((b: any) => b && b.title)
        .map((b: any) => ({
          title: String(b.title),
          start: typeof b.start === "string" ? b.start : undefined,
          end: typeof b.end === "string" ? b.end : undefined,
          notes: typeof b.notes === "string" ? b.notes : undefined,
        }))
    : [];

  const taskSuggestions: TaskSuggestion[] = Array.isArray(raw?.taskSuggestions)
    ? raw.taskSuggestions
        .filter((t: any) => t && t.title)
        .map((t: any) => ({
          title: String(t.title),
          priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
        }))
    : [];

  const intent: Intent = ["email", "content", "schedule", "mixed"].includes(raw?.intent)
    ? raw.intent
    : "mixed";

  return { intent, drafts, calendarBlocks, taskSuggestions, simulated: false, provider: `gemini:${modelName()}` };
}

// --- Local fallback (no keys) -------------------------------------------------
function simulate(transcript: string, note?: string): DraftBundle {
  const text = transcript.trim() || "(no transcript captured — transcription is stubbed without GROQ_API_KEY)";
  const lower = text.toLowerCase();
  const isEmail = /(reply|email|mail|write to|send to|coordinator|professor|team will|submit)/.test(lower);
  const isSchedule = /(today|tomorrow|deadline|by friday|schedule|block|target|task)/.test(lower);

  const drafts: DraftArtifact[] = [];
  if (isEmail) {
    drafts.push({
      kind: "email",
      title: "Re: Requested update",
      body: `Dear Sir/Madam,\n\n${text}\n\nWe will ensure this is completed on time and will share the formatted document as requested.\n\nWarm regards,\nJeevant`,
    });
  }
  drafts.push({
    kind: "linkedin",
    title: "Draft post",
    body: `I spent part of today on something worth writing down.\n\n${text}\n\nStill learning, still shipping.`,
  });
  drafts.push({
    kind: "youtube",
    title: "Video outline",
    body: `HOOK\n- Say the one line that frames the whole video.\n\nMAIN\n- The problem\n- What I tried\n- What actually worked\n\nCLOSE\n- The takeaway and what is next.`,
  });
  drafts.push({ kind: "twitter", title: "Short post", body: text.slice(0, 260) });
  drafts.push({ kind: "whatsapp", title: "Update", body: `Quick update: ${text}` });

  return {
    intent: isEmail && isSchedule ? "mixed" : isEmail ? "email" : isSchedule ? "schedule" : "content",
    drafts,
    calendarBlocks: [],
    taskSuggestions: [],
    simulated: true,
    provider: "local-heuristic",
    error:
      note ||
      "GEMINI_API_KEYS not set — using local heuristic drafts. Add keys for real AI drafting.",
  };
}

async function groqDraft(transcript: string, hint?: string): Promise<DraftBundle | null> {
  if (!groqConfigured()) return null;
  const text = await groqChat(SYSTEM_PROMPT, buildPrompt(transcript, hint), true);
  if (!text) return null;
  try {
    const bundle = coerce(extractJson(text));
    return { ...bundle, provider: `groq:${groqModel()}` };
  } catch {
    return null;
  }
}

export async function draftFromTranscript(transcript: string, hint?: string): Promise<DraftBundle> {
  const keys = apiKeys();
  if (!keys.length) {
    const viaGroq = await groqDraft(transcript, hint);
    return viaGroq ?? simulate(transcript);
  }

  let lastError = "";
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = nextKey();
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName()}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: buildPrompt(transcript, hint) }] }],
            generationConfig: { temperature: 0.75, responseMimeType: "application/json" },
          }),
        }
      );

      if (res.status === 429 || res.status === 403 || res.status >= 500) {
        lastError = `key attempt ${attempt + 1} returned ${res.status}`;
        continue;
      }
      if (!res.ok) {
        lastError = `Gemini error ${res.status}: ${(await res.text().catch(() => "")).slice(0, 180)}`;
        continue;
      }

      const json: any = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "";
      if (!text) {
        lastError = "Gemini returned an empty response";
        continue;
      }
      return coerce(extractJson(text));
    } catch (error) {
      lastError = (error as Error).message;
    }
  }

  const viaGroq = await groqDraft(transcript, hint);
  if (viaGroq) return viaGroq;

  return simulate(transcript, `All Gemini and Groq attempts failed (${lastError}). Showing heuristic drafts.`);
}
