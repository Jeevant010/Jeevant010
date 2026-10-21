// Lightweight agent loop: Gemini plans JSON tool calls, we execute them against
// the same MongoDB collections the admin UI uses. No extra dependency, and a
// deterministic fallback when no key is configured.

import { executeTool, TOOL_CATALOG, type ToolResult } from "./tools";

export type AgentAction = { tool: string; args: Record<string, unknown> } & ToolResult;

export type AgentRun = { reply: string; actions: AgentAction[]; simulated: boolean };

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
- Keep replies short and concrete.
- Resolve relative dates against the supplied current datetime.`;

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

async function plan(prompt: string): Promise<{ reply: string; actions: { tool: string; args: any }[] } | null> {
  const pool = keys();
  if (!pool.length) return null;

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
            contents: [
              {
                role: "user",
                parts: [{ text: `CURRENT_DATETIME: ${new Date().toISOString()}\n\nREQUEST: ${prompt}` }],
              },
            ],
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

  if (/^(?:list|show)\s+tasks?$/i.test(text)) return { reply: "Here are your open tasks.", actions: [{ tool: "list_tasks", args: {} }] };

  return {
    reply:
      "I need GEMINI_API_KEYS to understand free-form requests. Without it, try: 'add task: …', 'complete task: …', 'note: title | body', or 'list tasks'.",
    actions: [],
  };
}

export async function runAgent(prompt: string): Promise<AgentRun> {
  const trimmed = prompt.trim();
  if (!trimmed) return { reply: "Give me a request.", actions: [], simulated: true };

  const planned = await plan(trimmed);
  const resolved = planned ?? fallback(trimmed);

  const actions: AgentAction[] = [];
  for (const action of resolved.actions) {
    if (!action || typeof action.tool !== "string") continue;
    const outcome = await executeTool(action.tool, action.args || {});
    actions.push({ tool: action.tool, args: action.args || {}, ...outcome });
  }

  return {
    reply: resolved.reply || (actions.length ? "Done." : "Nothing to do."),
    actions,
    simulated: !planned,
  };
}
