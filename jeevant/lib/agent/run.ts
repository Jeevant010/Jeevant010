// Lightweight agent loop: deterministic router first, then Gemini/Groq plans
// JSON tool calls, and we execute them against the same MongoDB collections the
// admin UI uses. Fixed commands never touch an LLM.

import { executeTool, TOOL_CATALOG, type ToolResult } from "./tools";
import { routeIntent, UNKNOWN_REPLY } from "./router";
import { groqChat, groqConfigured, groqModel } from "@/lib/integrations/groq";
import connectDB from "@/lib/db";
import { Memory, ChatMessage } from "@/lib/database/models";
import { getGuardrailSettings } from "@/lib/guardrails/policy";
import { getStyleGuide } from "@/lib/style";
import { safeFetch } from "@/lib/http/fetch";

async function recentMemories(): Promise<string[]> {
  try {
    await connectDB();
    const docs = await Memory.find({}).sort({ createdAt: -1 }).limit(20);
    return docs.map((doc: any) => String(doc.text));
  } catch {
    return [];
  }
}

async function recentConversation(): Promise<string> {
  try {
    await connectDB();
    const docs = await ChatMessage.find({ thread: "main" }).sort({ createdAt: -1 }).limit(10);
    return docs
      .reverse()
      .map((doc: any) => `${doc.role}: ${doc.content}`)
      .join("\n");
  } catch {
    return "";
  }
}

export type AgentAction = { tool: string; args: Record<string, unknown> } & ToolResult;

export type AgentRun = { reply: string; actions: AgentAction[]; simulated: boolean; provider: string };

function keys(): string[] {
  return (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function modelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

const SYSTEM = `You are the operator agent for Jeevant's personal OS.
You can change the real database through these tools:

${TOOL_CATALOG}

Rules:
- Return ONLY JSON: { "reply": string, "actions": [ { "tool": string, "args": object } ] }.
- Use zero actions if the request is a question you can answer from context.
- Never invent tool results. Never claim something happened unless you emitted the action.
- Destructive tool (delete_task): always set confirm=false on the first attempt and ask the user to confirm. Set confirm=true only when the user explicitly says to confirm.
- Keep replies short and concrete, as if speaking out loud.
- Reply in the same language and register the user used. Hinglish is fine.
- Resolve relative dates against the supplied current datetime.
- When the user states a durable fact or preference, call "remember". When they ask what you know, call "recall".
- If a tool result says something is queued for approval, say it is queued. Never claim a message, post, email, or call was sent when it is only pending approval.
- If a tool result is not ok (blocked, failed, or rejected), say exactly that and give the reason. Never claim success for a blocked or failed action.
- Do not assume the current guardrail mode from earlier turns. The authoritative mode is GUARDRAIL_MODE in this request. Always call the tool and let it decide; never refuse pre-emptively based on conversation history.
- To send a WhatsApp, SMS, or call, use "send_message". Use "request_approval" only for actions that have no dedicated tool.
- When the user asks what is going on, for a briefing, or about today, call "get_briefing" first. Do not invent the state.
- When the user says open, go to, or show a page, call "open_page" with the page name. It actually navigates.
- Pending external actions are visible with "list_approvals".
- "start_focus" and "end_focus" control the focus session. Use them instead of describing focus.
- For email questions, call gmail_search, email_digest, or summarize_email. Never invent inbox contents.
- To schedule, call check_availability first, then schedule_block. Say the block is queued for approval; never claim it is on the calendar.
- Prefer doing over explaining: if a tool can answer the request, call it.`;

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

async function plan(
  prompt: string,
  onStep?: (step: string) => void
): Promise<{ reply: string; actions: { tool: string; args: any }[] } | null> {
  const memories = await recentMemories();
  const conversation = await recentConversation();
  onStep?.("reading memory and the last turns");
  const memoryBlock = memories.length
    ? `KNOWN FACTS ABOUT THE USER (memory):\n- ${memories.join("\n- ")}\n\n`
    : "";
  const conversationBlock = conversation ? `RECENT CONVERSATION:\n${conversation}\n\n` : "";
  const guardrail = await getGuardrailSettings();
  const guardBlock = `GUARDRAIL_MODE: ${guardrail.mode} (approval = queue the action; blocked = refuse it).\n\n`;
  const style = await getStyleGuide();
  const styleBlock = style ? `WRITING STYLE (match this in your reply):\n${style}\n\n` : "";
  const userMessage = `CURRENT_DATETIME: ${new Date().toISOString()}\n\n${guardBlock}${styleBlock}${memoryBlock}${conversationBlock}REQUEST: ${prompt}`;
  const pool = keys();
  onStep?.("planning the action");

  if (!pool.length) {
    if (!groqConfigured()) return null;
    const text = await groqChat(SYSTEM, userMessage, true);
    if (!text) return null;
    try {
      const parsed = extractJson(text);
      return {
        reply: typeof parsed.reply === "string" ? parsed.reply : "",
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      };
    } catch {
      return null;
    }
  }

  for (let attempt = 0; attempt < pool.length; attempt++) {
    const key = pool[attempt % pool.length];
    try {
      const res = await safeFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName()}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.15, responseMimeType: "application/json" },
          }),
        }
      );
      if (!res.ok) continue;
      const json: any = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || "").join("") || "";
      const parsed = extractJson(text);
      return {
        reply: typeof parsed.reply === "string" ? parsed.reply : "",
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      };
    } catch {
      // try the next key
    }
  }
  return null;
}

export type AgentRunOptions = {
  persist?: boolean;
  onStep?: (step: string) => void;
};

export async function runAgent(prompt: string, opts: AgentRunOptions = {}): Promise<AgentRun> {
  const trimmed = prompt.trim();
  if (!trimmed) return { reply: "Give me a request.", actions: [], simulated: true, provider: "none" };

  // Deterministic pass: fixed commands resolve here with zero network calls.
  // Only ambiguous requests pay for the planner.
  const routed = routeIntent(trimmed);
  opts.onStep?.(routed ? "handled locally" : "connecting to the operator");
  const planned = routed ? null : await plan(trimmed, opts.onStep);
  const resolved = routed ?? planned ?? { reply: UNKNOWN_REPLY, actions: [] };
  const provider = routed
    ? "local-router"
    : planned
    ? keys().length
      ? `gemini:${modelName()}`
      : `groq:${groqModel()}`
    : "fallback-parser";

  const actions: AgentAction[] = [];
  for (const action of resolved.actions) {
    if (!action || typeof action.tool !== "string") continue;
    let outcome: ToolResult;
    opts.onStep?.(`running ${action.tool.replace(/_/g, " ")}`);
    try {
      outcome = await executeTool(action.tool, action.args || {});
    } catch (error) {
      outcome = { ok: false, result: `Tool "${action.tool}" failed: ${(error as Error).message}` };
    }
    actions.push({ tool: action.tool, args: action.args || {}, ...outcome });
  }

  opts.onStep?.(actions.length ? "writing the reply" : "composing the answer");
  let reply = resolved.reply || (actions.length ? "Done." : "Nothing to do.");

  // Code-enforced truth: never let the model claim success for a blocked or
  // failed tool call, and never let it say "sent" when everything is queued.
  const failures = actions.filter((action) => !action.ok && !action.needsConfirm);
  if (failures.length) {
    reply = failures.map((action) => action.result).join(" ");
  } else if (
    actions.length > 0 &&
    actions.every((action) => action.ok && /queued for approval/i.test(action.result))
  ) {
    reply = "Queued for approval — nothing has been sent.";
  } else {
    // Speak the tool results verbatim. This prevents the model from adding
    // claims like "queued for approval" to actions that actually completed.
    const results = actions
      .filter((action) => action.ok && action.result)
      .map((action) => action.result);
    if (results.length) reply = results.join(" ");
  }

  if (opts.persist !== false) {
    try {
      await connectDB();
      await ChatMessage.create({ role: "user", content: trimmed });
      await ChatMessage.create({ role: "assistant", content: reply, provider });
    } catch {
      // conversation memory is best-effort
    }
  }

  return {
    reply,
    actions,
    simulated: !routed && !planned,
    provider,
  };
}
