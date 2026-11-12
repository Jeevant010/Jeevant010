// Tool registry + retrieval. The planner sees a relevant subset, not the whole
// catalog. `search_tools` and `describe_tool` let it discover more at runtime.
//
// This is Phase 1 of the capability broker: the long tail is covered by
// retrieval + meta-tools, then by MCP/OpenAPI/code/UI executors in later phases.

export type ToolRisk = "read" | "write" | "external" | "destructive";

export type DynamicToolMeta = {
  connectorId: string;
  connectorName: string;
  kind: "mcp" | "openapi";
  remoteName: string;
  method?: string;
  path?: string;
  queryParams?: string[];
  bodyMode?: "none" | "object" | "value";
  baseUrl?: string;
};

export type ToolEntry = {
  name: string;
  args: string;
  description: string;
  tags: string[];
  risk: ToolRisk;
  core: boolean;
  line: string;
  inputSchema?: Record<string, unknown>;
  dynamic?: DynamicToolMeta;
};

export const TOOL_CATALOG = `
search_tools       args: { query }            // find tools by name/description when the needed one is not listed
describe_tool      args: { name }             // get a tool's args/schema
http_request       args: { method?, url, body?, connector? } // generic HTTP; GET is read, writes queue for approval
run_code           args: { language: "javascript"|"python", code, input? } // queue server-side code; needs approval; persistent host only
read_url           args: { url, summarize? } // read a public page as text, optionally summarize it
ui_action          args: { app, steps: [{action:"tap"|"type"|"scroll"|"back"|"wait", text?, direction?, ms?}], note? } // queue an Android UI sequence; runs only when you tap Run
create_task        args: { title, priority?: "low"|"medium"|"high", dueDate?: ISO }
complete_task      args: { query }           // marks the first matching task done
delete_task        args: { query, confirm }  // confirm must be true; otherwise ask the user
create_note        args: { title, content, tags?: string[] }
delete_note        args: { query, confirm }
search_notes       args: { query }
create_project     args: { title, description, techStack?: string[], status?: "building"|"live"|"planned"|"stopped" }
create_post        args: { title, body, channels?: string[] }
add_achievement    args: { title, description?: string, when?: string }
create_contact     args: { name, phone?, whatsapp?, email? }  // upsert by name; internal, no approval
list_contacts      args: {}
remember           args: { text, tags?: string[] }   // durable memory about the user
recall             args: { query? }                  // search memories
web_search         args: { query }             // free instant-answer search
weather            args: { city }
send_message       args: { channel: "whatsapp"|"sms"|"call", to, body }
send_message_to    args: { name, channel: "whatsapp"|"sms"|"call", body }  // resolves a saved contact
remind             args: { what, when }         // when = ISO datetime
news               args: { count? }             // Hacker News top stories
summarize          args: { text }               // 3-bullet summary of an email/message
suggest_reply      args: { text, tone? }        // reply drafted in your learned style
log_activity       args: { kind, label, minutes, intended? }
start_activity     args: { kind, label }
stop_activity      args: { }
day_summary        args: { }
list_templates     args: { kind? }
list_tasks         args: {}
get_briefing       args: {}                  // live state: tasks, approvals, focus, activity
list_approvals     args: {}                  // pending approvals waiting on the user
start_focus        args: { intent }          // start a focus session
end_focus          args: {}                  // close the active focus session
open_page          args: { page }            // navigate: home, projects, journey, cv, research, library, contact, dashboard, planner, notes, career, learning, approvals, studio, voice, tracker, messages, contacts, integrations, automations, guardrails, arsenal, media, templates, style
gmail_search       args: { query, count? }        // read-only Gmail search
read_email         args: { id }                   // full message body
summarize_email    args: { id }                   // 3 bullets + the action it needs
email_digest       args: { query?, count? }       // one summary of recent mail
draft_email_reply  args: { id, instruction? }     // queues a Gmail draft approval
check_availability args: { start?, end?, minutes?, workStart?, workEnd? }  // real free/busy
upcoming_events    args: { days?, max? }          // next events from Google Calendar
schedule_block     args: { title, start, minutes?, notes? }  // queues a calendar approval
`.trim();

const CORE = new Set([
  "get_briefing",
  "list_tasks",
  "create_task",
  "complete_task",
  "create_note",
  "remember",
  "recall",
  "open_page",
  "list_approvals",
  "search_tools",
  "describe_tool",
]);

const EXTERNAL = new Set([
  "send_message",
  "send_message_to",
  "draft_email_reply",
  "schedule_block",
  "request_approval",
  "http_request",
  "run_code",
  "ui_action",
]);

const DESTRUCTIVE = new Set(["delete_task", "delete_note"]);

const SYNONYMS: Record<string, string[]> = {
  mail: ["gmail", "email", "inbox", "reply"],
  email: ["gmail", "mail", "inbox", "reply"],
  inbox: ["gmail", "mail", "email"],
  message: ["whatsapp", "sms", "send", "contact"],
  text: ["sms", "whatsapp", "message"],
  call: ["phone", "dial", "contact", "message"],
  phone: ["call", "contact"],
  contact: ["people", "phone", "send_message_to"],
  calendar: ["schedule", "availability", "events", "meeting"],
  meeting: ["calendar", "schedule", "availability"],
  schedule: ["calendar", "availability", "meeting"],
  task: ["todo", "remind", "complete"],
  todo: ["task", "remind"],
  note: ["notes", "brain", "remember"],
  memory: ["remember", "recall"],
  focus: ["deep", "work", "tracker"],
  activity: ["tracker", "focus", "log"],
  weather: ["forecast", "temperature"],
  news: ["headlines", "hacker"],
  code: ["repo", "coding", "sandbox", "script", "run", "javascript", "python", "program", "calculate"],
  publish: ["post", "channels", "dispatch"],
  content: ["post", "draft", "linkedin", "twitter"],
  chart: ["activity", "tracker", "data", "summary", "visual", "plot", "code", "script"],
  graph: ["activity", "tracker", "data", "summary", "visual", "plot", "code"],
  visualization: ["activity", "tracker", "data", "summary", "chart", "plot", "code"],
  script: ["code", "run", "javascript", "python", "program"],
  python: ["code", "script", "run"],
  javascript: ["code", "script", "run", "node"],
  page: ["url", "read_url", "web", "fetch", "summarize", "scrape"],
  url: ["page", "read_url", "web", "fetch", "link"],
  website: ["page", "url", "read_url", "web", "fetch"],
  scrape: ["page", "url", "read_url", "web", "fetch"],
  summarize: ["read_url", "summary", "email", "page"],
  tap: ["ui_action", "android", "accessibility", "click", "screen"],
  android: ["ui_action", "tap", "app", "accessibility"],
  whatsapp: ["ui_action", "message", "contact", "tap"],
  screen: ["ui_action", "tap", "android", "accessibility"],
  api: ["http", "endpoint", "request", "rest", "connector", "openapi", "mcp"],
  http: ["api", "endpoint", "request", "rest", "connector", "openapi"],
  endpoint: ["api", "http", "request", "rest", "connector"],
  rest: ["api", "http", "endpoint", "request"],
  connector: ["api", "http", "mcp", "openapi"],
  mcp: ["connector", "tool", "server"],
  openapi: ["api", "http", "connector", "schema"],
  github: ["repo", "issue", "pull", "code"],
  notion: ["page", "database", "note"],
  slack: ["message", "channel", "workspace"],
};

export const TOOL_REGISTRY: ToolEntry[] = TOOL_CATALOG.split("\n")
  .map((rawLine) => rawLine.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line): ToolEntry | null => {
    const [head, ...comment] = line.split("//");
    const match = head.trim().match(/^([a-z0-9_]+)\s*(.*)$/i);
    if (!match) return null;

    const name = match[1].toLowerCase();
    const args = match[2].replace(/^args:\s*/i, "").trim() || "{}";
    const description = comment.join("//").trim() || head.trim();
    const tags = Array.from(new Set([...name.split("_"), ...description.toLowerCase().match(/[a-z0-9_]+/g) || []]));
    const risk: ToolRisk = DESTRUCTIVE.has(name)
      ? "destructive"
      : EXTERNAL.has(name)
      ? "external"
      : /^(create|add|log|start|stop|schedule|draft|remember)/.test(name)
      ? "write"
      : "read";

    return {
      name,
      args,
      description,
      tags,
      risk,
      core: CORE.has(name),
      line,
    };
  })
  .filter((entry): entry is ToolEntry => !!entry);

// Dynamic entries come from connectors. They are replaced on every registry
// refresh, so a deleted connector disappears immediately.
let DYNAMIC_TOOLS: ToolEntry[] = [];
let DISABLED_TOOLS = new Set<string>();

export function setDisabledTools(names: string[]): void {
  DISABLED_TOOLS = new Set(names.filter(Boolean));
}

export function isToolDisabled(name: string): boolean {
  return DISABLED_TOOLS.has(name);
}

export function registerDynamicTools(entries: ToolEntry[]): void {
  const staticNames = new Set(TOOL_REGISTRY.map((entry) => entry.name));
  const seen = new Set<string>();
  DYNAMIC_TOOLS = entries.filter((entry) => {
    if (!entry?.name || staticNames.has(entry.name) || seen.has(entry.name)) return false;
    seen.add(entry.name);
    return true;
  });
}

export function clearDynamicTools(): void {
  DYNAMIC_TOOLS = [];
}

export function allTools(): ToolEntry[] {
  return [...TOOL_REGISTRY, ...DYNAMIC_TOOLS].filter((entry) => !DISABLED_TOOLS.has(entry.name));
}

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
}

function score(entry: ToolEntry, queryTokens: string[]): number {
  let total = 0;
  const description = entry.description.toLowerCase();
  for (const token of queryTokens) {
    if (entry.name === token) total += 20;
    else if (entry.name.includes(token)) total += 5;
    if (description.includes(token)) total += 1;
    if (entry.tags.includes(token)) total += 1;
    for (const synonym of SYNONYMS[token] || []) {
      if (entry.name.includes(synonym) || description.includes(synonym)) total += 1;
    }
  }
  return total;
}

export function retrieveTools(query: string, limit = 16): ToolEntry[] {
  const queryTokens = tokens(query);
  const pool = allTools();
  const core = pool.filter((entry) => entry.core);
  const ranked = pool
    .filter((entry) => !entry.core)
    .map((entry) => ({ entry, score: score(entry, queryTokens) }))
    .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name));

  const selected = [...core];
  const seen = new Set(selected.map((entry) => entry.name));

  for (const item of ranked) {
    if (selected.length >= limit) break;
    if (item.score > 0 || queryTokens.length === 0) {
      if (!seen.has(item.entry.name)) {
        selected.push(item.entry);
        seen.add(item.entry.name);
      }
    }
  }

  // Fill to the limit with the next best tools so the model always has options.
  for (const item of ranked) {
    if (selected.length >= limit) break;
    if (!seen.has(item.entry.name)) {
      selected.push(item.entry);
      seen.add(item.entry.name);
    }
  }

  return selected;
}

export function searchTools(query: string, limit = 12): ToolEntry[] {
  const queryTokens = tokens(query);
  return allTools()
    .map((entry) => ({ entry, score: score(entry, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name))
    .slice(0, limit)
    .map((item) => item.entry);
}

export function describeTool(name: string): ToolEntry | null {
  const target = String(name || "").trim().toLowerCase();
  return (
    TOOL_REGISTRY.find((entry) => entry.name === target) ||
    DYNAMIC_TOOLS.find((entry) => entry.name === target) ||
    null
  );
}

export function catalogForTools(entries: ToolEntry[]): string {
  return entries.map((entry) => entry.line).join("\n");
}
