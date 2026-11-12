// Lightweight agent loop: deterministic router first, then Gemini/Groq plans
// JSON tool calls, and we execute them against the same MongoDB collections the
// admin UI uses. Fixed commands never touch an LLM.

import { executeTool, type ToolResult } from "./tools";
import { retrieveTools, catalogForTools } from "./registry";
import { refreshConnectorRegistry } from "@/lib/connectors/store";
import { isRetryableTool, recordToolMetric, refreshToolHealth } from "./reliability";
import { routeIntent, UNKNOWN_REPLY } from "./router";
import { groqChat, groqConfigured, groqModel } from "@/lib/integrations/groq";
import { getGuardrailSettings } from "@/lib/guardrails/policy";
import { getStyleGuide } from "@/lib/style";
import { getPersona, personaPrompt } from "./persona";
import { retrieveConversation, retrieveMemories } from "./memory";
import { safeFetch } from "@/lib/http/fetch";
import connectDB from "@/lib/db";
import { ChatMessage } from "@/lib/database/models";

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

function systemPrompt(toolsText: string, personaText: string): string {
  return `${personaText}

You can change the real database through these tools:

${toolsText}

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
- Prefer doing over explaining: if a tool can answer the request, call it.
- Only a relevant subset of tools is listed. If the needed tool is missing, call "search_tools", then "describe_tool", then call the tool. Never invent a tool name.`;
}

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
  const persona = await getPersona();
  const personaBlock = personaPrompt(persona);
  const memories = await retrieveMemories(prompt, 8);
  const conversation = await retrieveConversation(prompt, 6);
  onStep?.("reading memory and relevant turns");
  const memoryBlock = memories.length
    ? `KNOWN FACTS ABOUT THE USER (most relevant first):\n- ${memories.join("\n- ")}\n\n`
    : "";
  const conversationBlock = conversation ? `RELEVANT RECENT CONVERSATION:\n${conversation}\n\n` : "";
  const guardrail = await getGuardrailSettings();
  const guardBlock = `GUARDRAIL_MODE: ${guardrail.mode} (approval = queue the action; blocked = refuse it).\n\n`;
  const style = await getStyleGuide();
  const styleBlock = style ? `WRITING STYLE (match this in your reply):\n${style}\n\n` : "";
  const userMessage = `CURRENT_DATETIME: ${new Date().toISOString()}\n\n${guardBlock}${styleBlock}${memoryBlock}${conversationBlock}REQUEST: ${prompt}`;
  await refreshConnectorRegistry();
  await refreshToolHealth();
  const toolsText = catalogForTools(retrieveTools(prompt, 16));
  const pool = keys();
  onStep?.("planning the action");

  if (!pool.length) {
    if (!groqConfigured()) return null;
    const model = process.env.AGENT_MODEL || "openai/gpt-oss-120b";
    // Groq occasionally returns an empty choice under load. One immediate retry
    // is cheaper than dropping to the deterministic fallback parser.
    const text =
      (await groqChat(systemPrompt(toolsText, personaBlock), userMessage, true, { model })) ||
      (await groqChat(systemPrompt(toolsText, personaBlock), userMessage, true, { model }));
    if (!text) {
      console.warn("[agent] planner returned no text for:", prompt.slice(0, 120));
      return null;
    }
    try {
      const parsed = extractJson(text);
      return {
        reply: typeof parsed.reply === "string" ? parsed.reply : "",
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      };
    } catch {
      console.warn("[agent] planner returned invalid JSON for:", prompt.slice(0, 120), text.slice(0, 240));
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
            systemInstruction: { parts: [{ text: systemPrompt(toolsText, personaBlock) }] },
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

  const actions: AgentAction[] = [];
  const runActions = async (list: { tool: string; args: any }[]): Promise<AgentAction[]> => {
    const outcomes: AgentAction[] = [];
    for (const action of list) {
      if (!action || typeof action.tool !== "string") continue;
      opts.onStep?.(`running ${action.tool.replace(/_/g, " ")}`);
      const started = Date.now();
      const attempts = isRetryableTool(action.tool) ? 2 : 1;
      let outcome: ToolResult = { ok: false, result: `Tool "${action.tool}" failed.` };

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          outcome = await executeTool(action.tool, action.args || {});
        } catch (error) {
          outcome = { ok: false, result: `Tool "${action.tool}" failed: ${(error as Error).message}` };
        }
        if (outcome.ok || attempt === attempts - 1) break;
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      const elapsed = Date.now() - started;
      await recordToolMetric(action.tool, outcome.ok, elapsed, outcome.ok ? undefined : outcome.result);
      const record: AgentAction = { tool: action.tool, args: action.args || {}, ...outcome };
      actions.push(record);
      outcomes.push(record);
    }
    return outcomes;
  };

  let planned: { reply: string; actions: { tool: string; args: any }[] } | null = null;
  let resolved: { reply: string; actions: { tool: string; args: any }[] } | null = routed;

  if (!routed) {
    planned = await plan(trimmed, opts.onStep);

    // If the planner asked for discovery, run it and re-plan once with the
    // discovered tools. This is the "I don't have that tool" escape hatch.
    if (planned) {
      const discovery = planned.actions.filter(
        (action) => action?.tool === "search_tools" || action?.tool === "describe_tool"
      );
      if (discovery.length) {
        // Models sometimes emit the same discovery call twice. Run it once.
        const seenDiscovery = new Set<string>();
        const uniqueDiscovery = discovery.filter((action) => {
          const key = `${action.tool}:${JSON.stringify(action.args || {})}`;
          if (seenDiscovery.has(key)) return false;
          seenDiscovery.add(key);
          return true;
        });
        const discoveryOutcomes = await runActions(uniqueDiscovery);
        const discoveryText = discoveryOutcomes
          .map((outcome) => {
            const data = outcome.data ? `\n${JSON.stringify(outcome.data).slice(0, 2000)}` : "";
            return `${outcome.tool}: ${outcome.result}${data}`;
          })
          .join("\n");
        const second = await plan(
          `${trimmed}\n\nTOOL DISCOVERY RESULT:\n${discoveryText}\nNow call the actual discovered tool(s). Do not call search_tools again unless you still lack the capability.`,
          opts.onStep
        );
        if (second) planned = second;
      }
    }

    resolved = planned ?? { reply: UNKNOWN_REPLY, actions: [] };
  }

  await runActions(resolved?.actions || []);

  const agentModel = process.env.AGENT_MODEL || "openai/gpt-oss-120b";
  const provider = routed
    ? "local-router"
    : planned
    ? keys().length
      ? `gemini:${modelName()}`
      : `groq:${agentModel}`
    : "fallback-parser";

  opts.onStep?.(actions.length ? "writing the reply" : "composing the answer");
  let reply = resolved?.reply || (actions.length ? "Done." : "Nothing to do.");

  // Code-enforced truth: never let the model claim success for a blocked or
  // failed tool call, and never let it say "sent" when everything is queued.
  // Discovery meta-tools are internal; do not speak their results.
  const visibleActions = actions.filter(
    (action) => action.tool !== "search_tools" && action.tool !== "describe_tool"
  );
  const failures = visibleActions.filter((action) => !action.ok && !action.needsConfirm);
  if (failures.length) {
    reply = failures.map((action) => action.result).join(" ");
  } else if (
    visibleActions.length > 0 &&
    visibleActions.every((action) => action.ok && /queued for approval/i.test(action.result))
  ) {
    reply = "Queued for approval — nothing has been sent.";
  } else {
    // Speak the tool results verbatim. This prevents the model from adding
    // claims like "queued for approval" to actions that actually completed.
    const results = visibleActions
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
