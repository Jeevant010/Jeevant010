// Deterministic intent router. This runs BEFORE any LLM call.
//
// Fixed commands ("list tasks", "add task: …", "start focus", "open tracker",
// "message Rahul: …") are matched here and executed immediately: no network,
// no tokens, no memory reads. Anything ambiguous returns null and escalates to
// the planner. Keep this list conservative — a false match is worse than a
// slow answer, so only anchor on explicit command shapes.

export type RoutedAction = { tool: string; args: Record<string, unknown> };

export type RoutedIntent = {
  reply: string;
  actions: RoutedAction[];
  confidence: "high" | "medium";
};

export const UNKNOWN_REPLY =
  "I could not reach an LLM, so I only understood basic commands. Add GROQ_API_KEYS (or GROQ_API_KEY) to the server's environment — on Vercel that is the backend project, not the mobile app — then redeploy. Basic commands still work: 'add task: …', 'complete task: …', 'note: title | body', 'list tasks', 'open tracker'.";

// Page aliases the deterministic `open` command will accept. Keeping this list
// here (instead of routing every "open …") prevents "open the pod bay doors"
// from becoming a dead navigation.
const OPEN_PAGES = new Set([
  "home",
  "record",
  "projects",
  "journey",
  "inbox",
  "plan",
  "people",
  "content",
  "about",
  "profile",
  "cv",
  "research",
  "library",
  "contact",
  "assistant",
  "agent",
  "dashboard",
  "overview",
  "planner",
  "agenda",
  "notes",
  "brain",
  "career",
  "learning",
  "approvals",
  "studio",
  "voice",
  "tracker",
  "messages",
  "contacts",
  "integrations",
  "automations",
  "guardrails",
  "arsenal",
  "media",
  "templates",
  "style",
]);

function clean(value: string | undefined): string {
  return String(value || "").trim();
}

export function routeIntent(prompt: string): RoutedIntent | null {
  const text = prompt.trim();
  if (!text) return null;

  const match = (pattern: RegExp) => clean(text.match(pattern)?.[1]);

  // --- Live state ---------------------------------------------------------
  if (/^(?:brief(?:\s+me)?|catch me up|what(?:'s| is) up|status|what(?:'s| is) going on)[?.!]*$/i.test(text)) {
    return { reply: "Reading the live state.", actions: [{ tool: "get_briefing", args: {} }], confidence: "high" };
  }

  if (/^(?:what(?:'s| is) due(?:\s+today)?|due today|my tasks?|open tasks?|list tasks?|show tasks?)[?.!]*$/i.test(text)) {
    return { reply: "Here are your open tasks.", actions: [{ tool: "list_tasks", args: {} }], confidence: "high" };
  }

  if (/^(?:what did i do(?: today)?|summari[sz]e my day|day summary|how did today go)[?.!]*$/i.test(text)) {
    return { reply: "Reading today's log.", actions: [{ tool: "day_summary", args: {} }], confidence: "high" };
  }

  if (/^(?:list|show|any|pending)?\s*approvals?[?.!]*$/i.test(text)) {
    return { reply: "Checking approvals.", actions: [{ tool: "list_approvals", args: {} }], confidence: "high" };
  }

  // --- Focus / activity ---------------------------------------------------
  const focus = match(/^(?:start|begin)\s+focus(?:\s+on)?[:\s]+(.+)$/i);
  if (focus) return { reply: "Starting focus.", actions: [{ tool: "start_focus", args: { intent: focus } }], confidence: "high" };

  if (/^(?:end|stop|close)\s+focus$/i.test(text)) {
    return { reply: "Closing focus.", actions: [{ tool: "end_focus", args: {} }], confidence: "high" };
  }

  const log = text.match(
    /^log\s+(\d+)\s*(?:m|min|mins|minute|minutes)\s+(?:of\s+)?([a-z][a-z _-]*?)(?:\s*:\s*(.+))?$/i
  );
  if (log) {
    const minutes = Math.max(1, Number(log[1]));
    const kind = clean(log[2]);
    const label = clean(log[3]) || kind;
    return {
      reply: `Logging ${minutes}m of ${kind}.`,
      actions: [{ tool: "log_activity", args: { kind, label, minutes } }],
      confidence: "high",
    };
  }

  const startTracking = text.match(/^(?:start|begin)\s+(?:tracking|activity)\s+([a-z][a-z _-]*?)(?:\s*:\s*(.+))?$/i);
  if (startTracking) {
    const kind = clean(startTracking[1]);
    const label = clean(startTracking[2]) || kind;
    return {
      reply: `Tracking ${label}.`,
      actions: [{ tool: "start_activity", args: { kind, label } }],
      confidence: "high",
    };
  }

  if (/^(?:stop|end)\s+(?:tracking|activity)$/i.test(text)) {
    return { reply: "Stopping the tracker.", actions: [{ tool: "stop_activity", args: {} }], confidence: "high" };
  }

  // --- Navigation ---------------------------------------------------------
  const open = match(/^(?:open|go to|show me|show)\s+(?:the\s+)?([a-z /-]+?)[.!]*$/i);
  if (open && OPEN_PAGES.has(open.toLowerCase())) {
    return { reply: `Opening ${open}.`, actions: [{ tool: "open_page", args: { page: open } }], confidence: "high" };
  }

  // --- Tasks / notes ------------------------------------------------------
  const addTask = match(/^(?:add|create)\s+task[:\s]+(.+)$/i);
  if (addTask) return { reply: "Adding that task.", actions: [{ tool: "create_task", args: { title: addTask } }], confidence: "high" };

  const complete = match(/^(?:complete|finish|done|close)\s+task[:\s]+(.+)$/i);
  if (complete) return { reply: "Marking it complete.", actions: [{ tool: "complete_task", args: { query: complete } }], confidence: "high" };

  const remove = match(/^(?:delete|remove)\s+task[:\s]+(.+)$/i);
  if (remove) {
    return {
      reply: "This is destructive. Say 'confirm delete task: …' to proceed.",
      actions: [{ tool: "delete_task", args: { query: remove, confirm: false } }],
      confidence: "high",
    };
  }

  const confirm = match(/^confirm\s+(?:delete|remove)\s+task[:\s]+(.+)$/i);
  if (confirm) return { reply: "Confirmed.", actions: [{ tool: "delete_task", args: { query: confirm, confirm: true } }], confidence: "high" };

  const removeNote = match(/^(?:delete|remove)\s+note[:\s]+(.+)$/i);
  if (removeNote) {
    return {
      reply: "This is destructive. Say 'confirm delete note: …' to proceed.",
      actions: [{ tool: "delete_note", args: { query: removeNote, confirm: false } }],
      confidence: "high",
    };
  }

  const confirmNote = match(/^confirm\s+(?:delete|remove)\s+note[:\s]+(.+)$/i);
  if (confirmNote) return { reply: "Confirmed.", actions: [{ tool: "delete_note", args: { query: confirmNote, confirm: true } }], confidence: "high" };

  const note = match(/^(?:note|save note)[:\s]+(.+)$/i);
  if (note) {
    const [title, ...rest] = note.split("|").map((part) => part.trim());
    return {
      reply: "Saving that note.",
      actions: [{ tool: "create_note", args: { title: title.slice(0, 80), content: rest.join(" ") || note } }],
      confidence: "high",
    };
  }

  const rememberTo = match(/^remember\s+to\s+(.+)$/i);
  if (rememberTo) {
    return { reply: "Adding that as a task.", actions: [{ tool: "create_task", args: { title: rememberTo } }], confidence: "high" };
  }

  const remember = match(/^(?:remember\s+that|remember)[:\s]+(.+)$/i);
  if (remember) {
    return { reply: "Remembered.", actions: [{ tool: "remember", args: { text: remember } }], confidence: "high" };
  }

  const project = match(/^(?:project|new project)[:\s]+(.+)$/i);
  if (project) {
    return {
      reply: "Creating the project.",
      actions: [{ tool: "create_project", args: { title: project, description: project } }],
      confidence: "high",
    };
  }

  // --- Messaging ----------------------------------------------------------
  const call = text.match(/^(?:call|phone|ring)\s+([a-z0-9][a-z0-9 .'-]*?)(?:\s*[:\-]\s*([\s\S]+))?$/i);
  if (call) {
    const name = clean(call[1]);
    const body = clean(call[2]);
    if (name) {
      return {
        reply: `Queuing a call to ${name}.`,
        actions: [{ tool: "send_message_to", args: { name, channel: "call", body } }],
        confidence: "medium",
      };
    }
  }

  const sms = text.match(/^(?:sms|text|whatsapp)\s+([a-z0-9][a-z0-9 .'-]*?)\s*[:\-]\s*([\s\S]+)$/i);
  if (sms) {
    const channel = /^sms\b/i.test(text) ? "sms" : "whatsapp";
    const name = clean(sms[1]);
    const body = clean(sms[2]);
    if (name && body) {
      return {
        reply: `Queuing a ${channel} message to ${name}.`,
        actions: [{ tool: "send_message_to", args: { name, channel, body } }],
        confidence: "medium",
      };
    }
  }

  const message = text.match(
    /^(?:message|send\s+(?:a\s+)?(?:message|whatsapp)\s+to)\s+([a-z0-9][a-z0-9 .'-]*?)\s*[:\-]\s*([\s\S]+)$/i
  );
  if (message) {
    const name = clean(message[1]);
    const body = clean(message[2]);
    if (name && body) {
      return {
        reply: `Queuing a message to ${name}.`,
        actions: [{ tool: "send_message_to", args: { name, channel: "whatsapp", body } }],
        confidence: "medium",
      };
    }
  }

  // --- Light reads --------------------------------------------------------
  if (/^(?:list|show)\s+templates$/i.test(text)) {
    return { reply: "Reading templates.", actions: [{ tool: "list_templates", args: {} }], confidence: "high" };
  }

  const weather = match(/^(?:weather|forecast)(?:\s+in\s+(.+))?$/i);
  if (weather) {
    return { reply: "Checking the weather.", actions: [{ tool: "weather", args: { city: weather } }], confidence: "high" };
  }

  const news = text.match(/^news(?:\s+(\d+))?$/i);
  if (news) {
    return {
      reply: "Fetching headlines.",
      actions: [{ tool: "news", args: { count: Math.min(Math.max(Number(news[1] || 5), 1), 10) } }],
      confidence: "high",
    };
  }

  const gmail = match(/^(?:gmail\s+search|search\s+(?:my\s+)?(?:inbox|mail|email))\s*[:\s]+(.+)$/i);
  if (gmail) {
    return { reply: "Searching mail.", actions: [{ tool: "gmail_search", args: { query: gmail } }], confidence: "high" };
  }

  if (/^(?:check\s+)?availability$|^(?:find|when\s+is)\s+(?:a\s+)?free\s+(?:slot|time)$/i.test(text)) {
    return { reply: "Checking the calendar.", actions: [{ tool: "check_availability", args: {} }], confidence: "high" };
  }

  if (/^(?:upcoming\s+events|my\s+calendar|what(?:'s| is)\s+on\s+my\s+calendar|next\s+events)$/i.test(text)) {
    return { reply: "Reading the calendar.", actions: [{ tool: "upcoming_events", args: {} }], confidence: "high" };
  }

  return null;
}
