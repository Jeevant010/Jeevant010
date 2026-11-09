import connectDB from "@/lib/db";
import { Activity, Approval, ChatMessage, FocusSession, Memory, Project, Task } from "@/lib/database/models";
import { groqConfigured, groqModel } from "@/lib/integrations/groq";

export type Briefing = {
  greeting: string;
  line: string;
  stats: { label: string; value: string; detail: string }[];
  tasks: { title: string; priority: string; due: string | null }[];
  approvals: number;
  focus: string | null;
  activity: string | null;
  provider: string;
  live: boolean;
  generatedAt: string;
};

export type HistoryEntry = {
  role: "user" | "assistant";
  content: string;
  provider: string;
  at: string;
};

type ActivityRow = { start: string | Date; end?: string | Date | null; kind?: string };
type TaskRow = { title?: unknown; priority?: unknown; dueDate?: string | Date | null };
type FocusRow = { intent?: string };
type ChatRow = {
  role?: string;
  content?: unknown;
  provider?: unknown;
  createdAt?: string | Date;
};

function istHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());
  return Number(parts) || new Date().getHours();
}

function greetingFor(hour: number): string {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Late session";
}

function emptyBriefing(message: string): Briefing {
  return {
    greeting: greetingFor(istHour()),
    line: message,
    stats: [],
    tasks: [],
    approvals: 0,
    focus: null,
    activity: null,
    provider: groqConfigured() ? `groq:${groqModel()}` : "fallback-parser",
    live: false,
    generatedAt: new Date().toISOString(),
  };
}

export async function getBriefing(): Promise<Briefing> {
  try {
    await connectDB();
  } catch {
    return emptyBriefing("The database is offline, so I cannot read the live state. Basic commands still work.");
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [openTasks, dueToday, approvals, focus, activities, projects, memories] = await Promise.all([
    Task.find({ isCompleted: false }).sort({ dueDate: 1, priority: -1 }).limit(8).lean(),
    Task.find({ isCompleted: false, dueDate: { $gte: start, $lt: end } }).lean(),
    Approval.countDocuments({ status: "pending" }),
    FocusSession.findOne({ status: "active" }).lean(),
    Activity.find({ start: { $gte: start } }).lean(),
    Project.find({ status: { $in: ["live", "building"] } }).lean(),
    Memory.countDocuments({}),
  ]);

  const totals: Record<string, number> = {};
  for (const activity of activities as unknown as ActivityRow[]) {
    const finish = activity.end ? new Date(activity.end).getTime() : Date.now();
    const minutes = Math.max(0, Math.round((finish - new Date(activity.start).getTime()) / 60_000));
    const kind = activity.kind || "other";
    totals[kind] = (totals[kind] || 0) + minutes;
  }

  const focusIntent = focus ? String((focus as unknown as FocusRow).intent || "") || null : null;
  const activityLine = Object.entries(totals)
    .map(([kind, minutes]) => `${kind.replace("_", " ")} ${minutes}m`)
    .join(", ");

  const taskLines = (openTasks as unknown as TaskRow[]).map((task) => ({
    title: String(task.title),
    priority: String(task.priority || "medium"),
    due: task.dueDate ? new Date(task.dueDate).toISOString() : null,
  }));

  const parts: string[] = [];
  parts.push(`${openTasks.length} open task${openTasks.length === 1 ? "" : "s"}`);
  if (dueToday.length) parts.push(`${dueToday.length} due today`);
  if (approvals) parts.push(`${approvals} approval${approvals === 1 ? "" : "s"} waiting`);
  if (focusIntent) parts.push(`focus is "${focusIntent}"`);
  if (activityLine) parts.push(activityLine);
  if (!openTasks.length && !approvals && !focusIntent) parts.push("nothing is on fire");

  const line = `${parts.join(", ")}. ${projects.length} projects are live or building. ${memories} memories on file.`;

  return {
    greeting: greetingFor(istHour()),
    line,
    stats: [
      { label: "open tasks", value: String(openTasks.length), detail: `${dueToday.length} due today` },
      { label: "approvals", value: String(approvals), detail: "waiting on you" },
      { label: "focus", value: focusIntent ? "on" : "idle", detail: focusIntent || "nothing active" },
      { label: "logged", value: activityLine ? `${Math.round(Object.values(totals).reduce((a, b) => a + b, 0) / 60)}h` : "0h", detail: "today" },
    ],
    tasks: taskLines,
    approvals,
    focus: focusIntent,
    activity: activityLine || null,
    provider: groqConfigured() ? `groq:${groqModel()}` : "fallback-parser",
    live: true,
    generatedAt: new Date().toISOString(),
  };
}

export async function getRecentHistory(limit = 16): Promise<HistoryEntry[]> {
  try {
    await connectDB();
    const docs = await ChatMessage.find({ thread: "main" }).sort({ createdAt: -1 }).limit(limit).lean();
    return (docs as unknown as ChatRow[])
      .reverse()
      .map((doc): HistoryEntry => ({
        role: doc.role === "user" ? "user" : "assistant",
        content: String(doc.content || ""),
        provider: String(doc.provider || ""),
        at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }))
      .filter((entry) => entry.content.trim().length > 0);
  } catch {
    return [];
  }
}

export function providerLabel(): string {
  return groqConfigured() ? `groq:${groqModel()}` : "fallback-parser";
}
