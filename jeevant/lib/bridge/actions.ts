import connectDB from "@/lib/db";
import { Activity, Approval, FocusSession, Note, Schedule, Task } from "@/lib/database/models";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { ACTIVITY_KINDS, APPROVAL_KINDS, PAGE_PATHS } from "./catalog";

export type BridgeResult = { ok: boolean; summary: string; data?: unknown };

function text(args: Record<string, unknown>, key: string, fallback = ""): string {
  const value = args[key];
  return (typeof value === "string" ? value : value == null ? fallback : String(value)).trim();
}

function num(args: Record<string, unknown>, key: string, fallback = 0): number {
  const value = Number(args[key] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function date(args: Record<string, unknown>, key: string): Date | null {
  const value = args[key];
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function activityKind(value: string): string {
  const aliases: Record<string, string> = {
    work: "deep_work",
    coding: "deep_work",
    code: "deep_work",
    study: "deep_work",
    focus: "deep_work",
    eat: "eating",
    food: "eating",
    meal: "eating",
    nap: "sleep",
    gym: "exercise",
    workout: "exercise",
    distraction: "waste",
    scrolling: "waste",
    rest: "break",
  };
  const normalized = aliases[value] || value;
  return ACTIVITY_KINDS.includes(normalized) ? normalized : "other";
}

export async function runBridgeAction(id: string, args: Record<string, unknown>): Promise<BridgeResult> {
  await connectDB();

  switch (id) {
    case "create_task": {
      const title = text(args, "title");
      if (!title) return { ok: false, summary: "A task needs a title." };
      const priority = ["low", "medium", "high"].includes(text(args, "priority"))
        ? text(args, "priority")
        : "medium";
      const doc = await Task.create({
        title,
        scope: "daily",
        priority,
        dueDate: date(args, "dueDate") || undefined,
      });
      return { ok: true, summary: `Created task "${doc.title}".`, data: { id: String(doc._id) } };
    }

    case "complete_task": {
      const query = text(args, "query");
      if (!query) return { ok: false, summary: "Tell me which task to complete." };
      const doc = await Task.findOneAndUpdate(
        { title: { $regex: escapeRegex(query), $options: "i" }, isCompleted: false },
        { isCompleted: true },
        { new: true }
      );
      return doc
        ? { ok: true, summary: `Marked "${doc.title}" complete.`, data: { id: String(doc._id) } }
        : { ok: false, summary: `No open task matched "${query}".` };
    }

    case "create_note": {
      const title = text(args, "title");
      if (!title) return { ok: false, summary: "A note needs a title." };
      const doc = await Note.create({
        title,
        content: text(args, "content"),
        tags: [],
        visibility: "private",
      });
      return { ok: true, summary: `Saved note "${doc.title}".`, data: { id: String(doc._id) } };
    }

    case "block_time": {
      const title = text(args, "title");
      const start = date(args, "start");
      if (!title || !start) return { ok: false, summary: "A block needs a title and a start time." };
      const minutes = Math.min(Math.max(num(args, "minutes", 60), 5), 720);
      const end = new Date(start.getTime() + minutes * 60_000);

      const overlap = await Schedule.findOne({
        start: { $lt: end },
        end: { $gt: start },
        status: { $ne: "cancelled" },
      }).lean();

      const doc = await Schedule.create({
        title,
        start,
        end,
        notes: text(args, "notes"),
        visibility: "private",
        colorCode: "emerald",
        status: "scheduled",
        priority: "medium",
      });

      const warning = overlap ? ` It overlaps "${String((overlap as { title?: unknown }).title || "another block")}".` : "";
      return {
        ok: true,
        summary: `Blocked ${minutes}m for "${doc.title}".${warning}`,
        data: { id: String(doc._id), start: start.toISOString(), end: end.toISOString(), overlap: !!overlap },
      };
    }

    case "start_focus": {
      const intent = text(args, "intent");
      if (!intent) return { ok: false, summary: "What is the focus for this session?" };
      await FocusSession.updateMany({ status: "active" }, { $set: { status: "done", endedAt: new Date() } });
      const doc = await FocusSession.create({ intent, status: "active", startedAt: new Date() });
      return { ok: true, summary: `Focus started: ${doc.intent}.`, data: { id: String(doc._id) } };
    }

    case "end_focus": {
      const active = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
      if (!active) return { ok: false, summary: "No focus session is active." };
      active.status = "done";
      active.endedAt = new Date();
      await active.save();
      const minutes = Math.max(0, Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60_000));
      return { ok: true, summary: `Focus closed after ${minutes}m: ${active.intent}.` };
    }

    case "log_activity": {
      const label = text(args, "label");
      const minutes = Math.min(Math.max(Math.round(num(args, "minutes")), 1), 1440);
      if (!label) return { ok: false, summary: "An activity needs a label." };
      const kind = activityKind(text(args, "kind"));
      const end = new Date();
      const doc = await Activity.create({
        kind,
        label,
        start: new Date(end.getTime() - minutes * 60_000),
        end,
        intended: true,
      });
      return { ok: true, summary: `Logged ${minutes}m of ${kind}: ${doc.label}.`, data: { id: String(doc._id) } };
    }

    case "start_activity": {
      const label = text(args, "label");
      if (!label) return { ok: false, summary: "What are you starting?" };
      const kind = activityKind(text(args, "kind"));
      await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
      const doc = await Activity.create({ kind, label, start: new Date(), intended: true });
      return { ok: true, summary: `Tracking "${doc.label}" (${kind}).`, data: { id: String(doc._id) } };
    }

    case "stop_activity": {
      const open = await Activity.findOne({ end: null }).sort({ start: -1 });
      if (!open) return { ok: false, summary: "Nothing is being tracked." };
      await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
      return { ok: true, summary: `Stopped "${open.label}".` };
    }

    case "open_page": {
      const page = text(args, "page");
      const path = PAGE_PATHS[page];
      if (!path) return { ok: false, summary: `I do not have a page called "${page}".` };
      return { ok: true, summary: `Deep link ready for ${page}.`, data: { path } };
    }

    case "request_approval": {
      const title = text(args, "title");
      if (!title) return { ok: false, summary: "An approval needs a title." };
      const kind = APPROVAL_KINDS.includes(text(args, "kind")) ? text(args, "kind") : "generic";

      const guard = await evaluateExternalAction({ kind, target: title, meta: { via: "bridge" } });
      if (!guard.allowed) return { ok: false, summary: guard.reason };

      const doc = await Approval.create({
        kind,
        title,
        detail: text(args, "detail"),
        payload: {},
        status: "pending",
      });
      return {
        ok: true,
        summary: `Queued approval "${doc.title}". Nothing has been sent.`,
        data: { id: String(doc._id) },
      };
    }

    default:
      return { ok: false, summary: `Unknown action "${id}".` };
  }
}
