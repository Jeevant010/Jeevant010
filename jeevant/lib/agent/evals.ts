// Golden command/retrieval evals. These are deterministic: no LLM calls and no
// database writes beyond storing the latest result. A miss means the expected
// tool did not enter the planner prompt (or the router did not catch it).

import connectDB from "@/lib/db";
import { Setting } from "@/lib/database/models";
import { routeIntent } from "./router";
import { retrieveTools } from "./registry";

export type EvalCase = {
  prompt: string;
  expected: string[];
  router?: boolean;
};

export type EvalMiss = {
  prompt: string;
  expected: string[];
  got: string[];
  mode: "router" | "retrieval";
};

export type EvalResult = {
  total: number;
  passed: number;
  hitRate: number;
  misses: EvalMiss[];
  ranAt: string;
};

export const GOLDEN_CASES: EvalCase[] = [
  // Deterministic router commands.
  { prompt: "list tasks", expected: ["list_tasks"], router: true },
  { prompt: "brief me", expected: ["get_briefing"], router: true },
  { prompt: "catch me up", expected: ["get_briefing"], router: true },
  { prompt: "what did i do today", expected: ["day_summary"], router: true },
  { prompt: "day summary", expected: ["day_summary"], router: true },
  { prompt: "list approvals", expected: ["list_approvals"], router: true },
  { prompt: "pending approvals", expected: ["list_approvals"], router: true },
  { prompt: "start focus on phase 6", expected: ["start_focus"], router: true },
  { prompt: "end focus", expected: ["end_focus"], router: true },
  { prompt: "open tracker", expected: ["open_page"], router: true },
  { prompt: "open inbox", expected: ["open_page"], router: true },
  { prompt: "add task: ship phase 6", expected: ["create_task"], router: true },
  { prompt: "complete task: ship phase 6", expected: ["complete_task"], router: true },
  { prompt: "delete task: old thing", expected: ["delete_task"], router: true },
  { prompt: "note: Phase 6 | reliability", expected: ["create_note"], router: true },
  { prompt: "remember to call the bank", expected: ["create_task"], router: true },
  { prompt: "remember that I prefer morning work", expected: ["remember"], router: true },
  { prompt: "project: reliability dashboard", expected: ["create_project"], router: true },
  { prompt: "add contact: Rahul, 9876543210", expected: ["create_contact"], router: true },
  { prompt: "list contacts", expected: ["list_contacts"], router: true },
  { prompt: "call Rahul", expected: ["send_message_to"], router: true },
  { prompt: "whatsapp Rahul: hello", expected: ["send_message_to"], router: true },
  { prompt: "weather in Surat", expected: ["weather"], router: true },
  { prompt: "news", expected: ["news"], router: true },
  { prompt: "gmail search: invoice", expected: ["gmail_search"], router: true },
  { prompt: "log 30 minutes of deep work: phase 6", expected: ["log_activity"], router: true },
  { prompt: "start tracking coding", expected: ["start_activity"], router: true },
  { prompt: "stop tracking", expected: ["stop_activity"], router: true },

  // Retrieval cases: the tool must enter the 16-tool planner prompt.
  { prompt: "read my email inbox", expected: ["gmail_search", "email_digest"] },
  { prompt: "summarize my latest email", expected: ["email_digest", "gmail_search"] },
  { prompt: "draft a reply to that email", expected: ["draft_email_reply", "gmail_search"] },
  { prompt: "when am I free tomorrow afternoon", expected: ["check_availability"] },
  { prompt: "what's on my calendar this week", expected: ["upcoming_events"] },
  { prompt: "schedule a block for deep work tomorrow", expected: ["schedule_block"] },
  { prompt: "search the web for MCP servers", expected: ["web_search"] },
  { prompt: "summarize this: the launch moved to Friday", expected: ["summarize"] },
  { prompt: "suggest a reply to: hey are we meeting tomorrow", expected: ["suggest_reply"] },
  { prompt: "recall what I told you about coffee", expected: ["recall"] },
  { prompt: "search my notes for phase 6", expected: ["search_notes"] },
  { prompt: "create a linkedin post about phase 6", expected: ["create_post"] },
  { prompt: "add an achievement for shipping phase 6", expected: ["add_achievement"] },
  { prompt: "list templates", expected: ["list_templates"] },
  { prompt: "find a tool for charts", expected: ["search_tools"] },
  { prompt: "describe create_task", expected: ["describe_tool"] },
  { prompt: "make a chart from my activities", expected: ["run_code", "day_summary"] },
  { prompt: "read this page https://example.com and summarize it", expected: ["read_url"] },
  { prompt: "use http request to call the API", expected: ["http_request"] },
  { prompt: "open whatsapp and tap Rahul", expected: ["ui_action", "send_message_to"] },
  { prompt: "run javascript to calculate 2+2", expected: ["run_code"] },
  { prompt: "what's my learning progress", expected: ["search_tools"] },
  { prompt: "send a message to Rahul on WhatsApp", expected: ["send_message_to"] },
  { prompt: "check my focus sessions", expected: ["day_summary", "start_focus"] },
  { prompt: "read email id abc123", expected: ["read_email"] },
  { prompt: "email digest", expected: ["email_digest"] },
  { prompt: "upcoming events next week", expected: ["upcoming_events"] },
  { prompt: "check availability tomorrow", expected: ["check_availability"] },
  { prompt: "draft an email reply to the last message", expected: ["draft_email_reply"] },
  { prompt: "top hacker news stories", expected: ["news"] },
  { prompt: "show me the weather forecast for Mumbai", expected: ["weather"] },
  { prompt: "log 45 minutes of meeting", expected: ["log_activity"] },
  { prompt: "open the approvals page", expected: ["open_page", "list_approvals"] },
  { prompt: "open the code page", expected: ["open_page"] },
  { prompt: "list all tasks", expected: ["list_tasks"] },
];

export function runGoldenEvals(): EvalResult {
  const misses: EvalMiss[] = [];
  let passed = 0;

  for (const item of GOLDEN_CASES) {
    const routed = routeIntent(item.prompt);
    if (item.router) {
      const got = routed ? routed.actions.map((action) => action.tool) : [];
      if (got.some((tool) => item.expected.includes(tool))) {
        passed += 1;
      } else {
        misses.push({ prompt: item.prompt, expected: item.expected, got, mode: "router" });
      }
      continue;
    }

    const got = retrieveTools(item.prompt, 16).map((entry) => entry.name);
    if (got.some((tool) => item.expected.includes(tool))) {
      passed += 1;
    } else {
      misses.push({ prompt: item.prompt, expected: item.expected, got: got.slice(0, 8), mode: "retrieval" });
    }
  }

  return {
    total: GOLDEN_CASES.length,
    passed,
    hitRate: GOLDEN_CASES.length ? passed / GOLDEN_CASES.length : 0,
    misses,
    ranAt: new Date().toISOString(),
  };
}

export async function runAndStoreEvals(): Promise<EvalResult> {
  const result = runGoldenEvals();
  try {
    await connectDB();
    await Setting.findOneAndUpdate(
      { key: "evalResults" },
      { key: "evalResults", value: result, updatedAt: new Date() },
      { upsert: true }
    );
  } catch {
    // The result is still returned if storage fails.
  }
  return result;
}

export async function getLastEval(): Promise<EvalResult | null> {
  try {
    await connectDB();
    const doc: any = await Setting.findOne({ key: "evalResults" });
    const value = doc?.value;
    if (!value || typeof value !== "object") return null;
    return value as EvalResult;
  } catch {
    return null;
  }
}
