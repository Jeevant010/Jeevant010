// Lightweight agent loop: Gemini plans JSON tool calls, we execute them against
// the same MongoDB collections the admin UI uses. No extra dependency, and a
// deterministic fallback when no key is configured.

import { executeTool, TOOL_CATALOG, type ToolResult } from "./tools";
import { groqChat, groqConfigured, groqModel } from "@/lib/integrations/groq";
import connectDB from "@/lib/db";
import { Memory, ChatMessage } from "@/lib/database/models";
import { getGuardrailSettings } from "@/lib/guardrails/policy";
import { getStyleGuide } from "@/lib/style";

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
      const res = await fetch(
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

function fallback(prompt: string): { reply: string; actions: { tool: string; args: any }[] } {
  const text = prompt.trim();
  const match = (pattern: RegExp) => text.match(pattern)?.[1]?.trim();

  if (/^(?:brief(?:\s+me)?|catch me up|what(?:'s| is) up|status|what(?:'s| is) going on)[?.!]*$/i.test(text)) {
    return { reply: "Reading the live state.", actions: [{ tool: "get_briefing", args: {} }] };
  }

  if (/^(?:what(?:'s| is) due(?:\s+today)?|due today|my tasks?|open tasks?|list tasks?|show tasks?)[?.!]*$/i.test(text)) {
    return { reply: "Here are your open tasks.", actions: [{ tool: "list_tasks", args: {} }] };
  }

  if (/^(?:what did i do(?: today)?|summari[sz]e my day|day summary|how did today go)[?.!]*$/i.test(text)) {
    return { reply: "Reading today's log.", actions: [{ tool: "day_summary", args: {} }] };
  }

  if (/^(?:list|show|any|pending)?\s*approvals?[?.!]*$/i.test(text)) {
    return { reply: "Checking approvals.", actions: [{ tool: "list_approvals", args: {} }] };
  }

  const focus = match(/^(?:start|begin)\s+focus(?:\s+on)?[:\s]+(.+)$/i);
  if (focus) return { reply: "Starting focus.", actions: [{ tool: "start_focus", args: { intent: focus } }] };
  if (/^(?:end|stop|close)\s+focus$/i.test(text)) {
    return { reply: "Closing focus.", actions: [{ tool: "end_focus", args: {} }] };
  }

  const open = match(/^(?:open|go to|show me|show)\s+(?:the\s+)?([a-z /-]+?)[.!]*$/i);
  if (open) {
    return { reply: `Opening ${open}.`, actions: [{ tool: "open_page", args: { page: open } }] };
  }

  const addTask = match(/^(?:add|create)\s+task[:\s]+(.+)$/i);
  if (addTask) return { reply: "Adding that task.", actions: [{ tool: "create_task", args: { title: addTask } }] };

  const complete = match(/^(?:complete|finish|done)\s+task[:\s]+(.+)$/i);
  if (complete) return { reply: "Marking it complete.", actions: [{ tool: "complete_task", args: { query: complete } }] };

  const remove = match(/^(?:delete|remove)\s+task[:\s]+(.+)$/i);
  if (remove)
    return {
      reply: "This is destructive. Say 'confirm delete task: …' to proceed.",
      actions: [{ tool: "delete_task", args: { query: remove, confirm: false } }],
    };

  const confirm = match(/^confirm\s+(?:delete|remove)\s+task[:\s]+(.+)$/i);
  if (confirm) return { reply: "Confirmed.", actions: [{ tool: "delete_task", args: { query: confirm, confirm: true } }] };

  const removeNote = match(/^(?:delete|remove)\s+note[:\s]+(.+)$/i);
  if (removeNote)
    return {
      reply: "This is destructive. Say 'confirm delete note: …' to proceed.",
      actions: [{ tool: "delete_note", args: { query: removeNote, confirm: false } }],
    };

  const confirmNote = match(/^confirm\s+(?:delete|remove)\s+note[:\s]+(.+)$/i);
  if (confirmNote)
    return { reply: "Confirmed.", actions: [{ tool: "delete_note", args: { query: confirmNote, confirm: true } }] };

  const note = match(/^(?:note|remember)[:\s]+(.+)$/i);
  if (note) {
    const [title, ...rest] = note.split("|").map((part) => part.trim());
    return {
      reply: "Saving that note.",
      actions: [{ tool: "create_note", args: { title: title.slice(0, 80), content: rest.join(" ") || note } }],
    };
  }

  const project = match(/^(?:project|new project)[:\s]+(.+)$/i);
  if (project)
    return {
      reply: "Creating the project.",
      actions: [{ tool: "create_project", args: { title: project, description: project } }],
    };

  return {
    reply:
      "I could not reach an LLM, so I only understood basic commands. Check GROQ_API_KEY in .env.local and restart the dev server. Basic commands: 'add task: …', 'complete task: …', 'note: title | body', 'list tasks'.",
    actions: [],
  };
}

export type AgentRunOptions = {
  persist?: boolean;
  onStep?: (step: string) => void;
};

export async function runAgent(prompt: string, opts: AgentRunOptions = {}): Promise<AgentRun> {
  const trimmed = prompt.trim();
  if (!trimmed) return { reply: "Give me a request.", actions: [], simulated: true, provider: "none" };

  opts.onStep?.("connecting to the operator");
  const planned = await plan(trimmed, opts.onStep);
  const resolved = planned ?? fallback(trimmed);
  const provider = planned ? (keys().length ? `gemini:${modelName()}` : `groq:${groqModel()}`) : "fallback-parser";

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
    simulated: !planned,
    provider,
  };
}
