export type ActionFieldType = "text" | "number" | "datetime" | "select";

export type ActionField = {
  name: string;
  label: string;
  type: ActionFieldType;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  default?: string | number;
  placeholder?: string;
};

export type BridgeActionMeta = {
  id: string;
  label: string;
  description: string;
  external: boolean;
  fields: ActionField[];
};

export const PAGE_PATHS: Record<string, string> = {
  home: "/",
  projects: "/projects",
  journey: "/journey",
  about: "/about",
  cv: "/cv",
  research: "/research",
  library: "/library",
  contact: "/contact",
  assistant: "/assistant",
  agent: "/agent",
  dashboard: "/dashboard",
  planner: "/planner/daily",
  notes: "/brain",
  career: "/career",
  learning: "/learning",
  approvals: "/approvals",
  studio: "/studio",
  voice: "/voice",
  tracker: "/tracker",
  messages: "/messages",
  contacts: "/contacts",
  integrations: "/integrations",
  automations: "/automations",
  guardrails: "/guardrails",
  arsenal: "/arsenal",
  media: "/media",
  templates: "/templates",
  style: "/style",
};

export const ACTIVITY_KINDS = ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"];
export const APPROVAL_KINDS = ["email", "post", "calendar", "whatsapp", "sms", "call", "delete", "generic"];

export const BRIDGE_ACTIONS: BridgeActionMeta[] = [
  {
    id: "create_task",
    label: "Create task",
    description: "Adds a task to the daily board.",
    external: false,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high"], default: "medium" },
      { name: "dueDate", label: "Due", type: "datetime" },
    ],
  },
  {
    id: "complete_task",
    label: "Complete task",
    description: "Marks the first matching task complete.",
    external: false,
    fields: [{ name: "query", label: "Match title", type: "text", required: true, maxLength: 200 }],
  },
  {
    id: "create_note",
    label: "Create note",
    description: "Saves a note to the brain.",
    external: false,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "content", label: "Content", type: "text", maxLength: 10000 },
    ],
  },
  {
    id: "block_time",
    label: "Block time",
    description: "Creates a private schedule block. Google Calendar sync is Phase 4.",
    external: false,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "start", label: "Start", type: "datetime", required: true },
      { name: "minutes", label: "Minutes", type: "number", min: 5, max: 720, default: 60 },
      { name: "notes", label: "Notes", type: "text", maxLength: 2000 },
    ],
  },
  {
    id: "start_focus",
    label: "Start focus",
    description: "Starts a focus session and closes any active one.",
    external: false,
    fields: [{ name: "intent", label: "Intent", type: "text", required: true, maxLength: 200 }],
  },
  {
    id: "end_focus",
    label: "End focus",
    description: "Closes the active focus session.",
    external: false,
    fields: [],
  },
  {
    id: "log_activity",
    label: "Log activity",
    description: "Records a finished time block.",
    external: false,
    fields: [
      { name: "kind", label: "Kind", type: "select", options: ACTIVITY_KINDS, default: "deep_work" },
      { name: "label", label: "Label", type: "text", required: true, maxLength: 200 },
      { name: "minutes", label: "Minutes", type: "number", required: true, min: 1, max: 1440 },
    ],
  },
  {
    id: "start_activity",
    label: "Start activity",
    description: "Starts tracking an activity and stops the open one.",
    external: false,
    fields: [
      { name: "kind", label: "Kind", type: "select", options: ACTIVITY_KINDS, default: "deep_work" },
      { name: "label", label: "Label", type: "text", required: true, maxLength: 200 },
    ],
  },
  {
    id: "stop_activity",
    label: "Stop activity",
    description: "Stops whatever is currently tracked.",
    external: false,
    fields: [],
  },
  {
    id: "open_page",
    label: "Open page",
    description: "Returns a deep link to a page on this site.",
    external: false,
    fields: [
      { name: "page", label: "Page", type: "select", required: true, options: Object.keys(PAGE_PATHS) },
    ],
  },
  {
    id: "request_approval",
    label: "Queue approval",
    description: "Queues an external action for approval. Nothing is sent from a bridge link.",
    external: true,
    fields: [
      { name: "kind", label: "Kind", type: "select", options: APPROVAL_KINDS, default: "generic" },
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "detail", label: "Detail", type: "text", maxLength: 2000 },
    ],
  },
];

export function getActionMeta(id: string): BridgeActionMeta | undefined {
  return BRIDGE_ACTIONS.find((action) => action.id === id);
}

export type ValidatedArgs =
  | { ok: true; args: Record<string, unknown> }
  | { ok: false; error: string };

export function validateActionArgs(meta: BridgeActionMeta, input: unknown): ValidatedArgs {
  if (input !== undefined && (input === null || typeof input !== "object" || Array.isArray(input))) {
    return { ok: false, error: "args must be an object" };
  }

  const raw = (input || {}) as Record<string, unknown>;
  const args: Record<string, unknown> = {};

  for (const field of meta.fields) {
    const value = raw[field.name];
    const empty = value === undefined || value === null || value === "";

    if (empty) {
      if (field.required) return { ok: false, error: `${field.label} is required` };
      if (field.default !== undefined) args[field.name] = field.default;
      continue;
    }

    if (field.type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number)) return { ok: false, error: `${field.label} must be a number` };
      if (field.min !== undefined && number < field.min) {
        return { ok: false, error: `${field.label} must be at least ${field.min}` };
      }
      if (field.max !== undefined && number > field.max) {
        return { ok: false, error: `${field.label} must be at most ${field.max}` };
      }
      args[field.name] = number;
      continue;
    }

    if (field.type === "datetime") {
      const date = new Date(String(value));
      if (Number.isNaN(date.getTime())) return { ok: false, error: `${field.label} must be a valid date` };
      args[field.name] = date.toISOString();
      continue;
    }

    if (field.type === "select") {
      const option = String(value);
      if (!field.options?.includes(option)) return { ok: false, error: `${field.label} is not a valid option` };
      args[field.name] = option;
      continue;
    }

    const text = String(value).trim().slice(0, field.maxLength ?? 2000);
    if (!text && field.required) return { ok: false, error: `${field.label} is required` };
    args[field.name] = text;
  }

  return { ok: true, args };
}
