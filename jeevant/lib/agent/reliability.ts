// Reliability helpers: per-tool metrics, safe retries, and tool disabling.

import connectDB from "@/lib/db";
import { ToolMetric } from "@/lib/database/models";
import { setDisabledTools, isToolDisabled } from "./registry";

const SAFE_RETRY = new Set([
  "get_briefing",
  "list_tasks",
  "search_notes",
  "list_contacts",
  "recall",
  "web_search",
  "weather",
  "news",
  "summarize",
  "suggest_reply",
  "day_summary",
  "list_templates",
  "list_approvals",
  "gmail_search",
  "read_email",
  "summarize_email",
  "email_digest",
  "check_availability",
  "upcoming_events",
  "read_url",
  "search_tools",
  "describe_tool",
]);

const NEVER_RETRY_PREFIX = [
  "create_",
  "add_",
  "delete_",
  "remove_",
  "send_",
  "schedule_",
  "draft_",
  "run_",
  "ui_",
  "http_",
  "request_",
  "start_",
  "stop_",
  "end_",
  "log_",
  "complete_",
  "remember",
  "toggle_",
];

export function isRetryableTool(name: string): boolean {
  if (!SAFE_RETRY.has(name)) return false;
  // Connector tools are namespaced and may write; never retry them blindly.
  if (name.includes("__")) return false;
  if (NEVER_RETRY_PREFIX.some((prefix) => name.startsWith(prefix))) return false;
  return true;
}

export function p95(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index];
}

let healthLoadedAt = 0;
let healthInflight: Promise<void> | null = null;

export async function refreshToolHealth(force = false): Promise<void> {
  if (!force && Date.now() - healthLoadedAt < 30_000) return;
  if (healthInflight) return healthInflight;
  healthInflight = (async () => {
    try {
      await connectDB();
      const docs: any[] = await ToolMetric.find({ disabled: true }).select("name").lean();
      setDisabledTools(docs.map((doc) => String(doc.name)));
      healthLoadedAt = Date.now();
    } catch {
      // Keep the previous disabled set if the database is unavailable.
    } finally {
      healthInflight = null;
    }
  })();
  return healthInflight;
}

export async function recordToolMetric(
  name: string,
  ok: boolean,
  latencyMs: number,
  error?: string
): Promise<void> {
  try {
    await connectDB();
    const latency = Math.max(0, Math.round(latencyMs));
    const set: Record<string, unknown> = { lastAt: new Date(), updatedAt: new Date() };
    if (!ok) set.lastError = String(error || "Unknown error").slice(0, 500);
    await ToolMetric.findOneAndUpdate(
      { name },
      {
        $inc: {
          calls: 1,
          success: ok ? 1 : 0,
          failure: ok ? 0 : 1,
          totalMs: latency,
        },
        $max: { maxMs: latency },
        $push: { latencies: { $each: [latency], $slice: -200 } },
        $set: set,
      },
      { upsert: true }
    );
  } catch {
    // Metrics must never break a tool call.
  }
}

export async function setToolDisabled(name: string, disabled: boolean): Promise<void> {
  await connectDB();
  await ToolMetric.findOneAndUpdate(
    { name },
    {
      $set: { disabled, updatedAt: new Date() },
      $setOnInsert: { calls: 0, success: 0, failure: 0, totalMs: 0, maxMs: 0 },
    },
    { upsert: true }
  );
  await refreshToolHealth(true);
}

export type ToolStat = {
  name: string;
  calls: number;
  success: number;
  failure: number;
  successRate: number;
  avgMs: number;
  p95Ms: number;
  maxMs: number;
  lastError: string;
  lastAt: string | null;
  disabled: boolean;
};

export async function getToolMetrics(): Promise<ToolStat[]> {
  await connectDB();
  const docs: any[] = await ToolMetric.find({}).sort({ failure: -1, calls: -1 }).lean();
  return docs.map((doc) => {
    const calls = Number(doc.calls) || 0;
    const failure = Number(doc.failure) || 0;
    const success = Number(doc.success) || 0;
    const latencies = Array.isArray(doc.latencies) ? doc.latencies.map(Number).filter(Number.isFinite) : [];
    return {
      name: String(doc.name),
      calls,
      success,
      failure,
      successRate: calls ? success / calls : 0,
      avgMs: calls ? Math.round((Number(doc.totalMs) || 0) / calls) : 0,
      p95Ms: p95(latencies),
      maxMs: Number(doc.maxMs) || 0,
      lastError: String(doc.lastError || ""),
      lastAt: doc.lastAt ? new Date(doc.lastAt).toISOString() : null,
      disabled: doc.disabled === true,
    };
  });
}

export { isToolDisabled };
