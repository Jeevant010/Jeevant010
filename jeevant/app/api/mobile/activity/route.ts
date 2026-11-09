import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Activity } from "@/lib/database/models";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"];

function normalizeKind(value: unknown): string {
  const text = String(value || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    work: "deep_work",
    coding: "deep_work",
    code: "deep_work",
    study: "deep_work",
    studying: "deep_work",
    focus: "deep_work",
    eat: "eating",
    food: "eating",
    meal: "eating",
    nap: "sleep",
    sleeping: "sleep",
    gym: "exercise",
    workout: "exercise",
    distraction: "waste",
    distracted: "waste",
    scrolling: "waste",
    rest: "break",
  };
  const normalized = aliases[text] || text;
  return KINDS.includes(normalized) ? normalized : "other";
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const kind = normalizeKind(body?.kind);
  const label = String(body?.label || kind).trim() || kind;
  const minutes = Math.min(Math.max(Number(body?.minutes) || 0, 1), 720);

  await connectDB();

  if (action === "start") {
    await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
    const activity = await Activity.create({ kind, label, start: new Date(), intended: true });
    return mobileJson(request, { ok: true, activity: plain(activity) });
  }

  if (action === "stop") {
    const open = await Activity.findOne({ end: null }).sort({ start: -1 });
    if (!open) return mobileJson(request, { error: "Nothing is being tracked." }, { status: 404 });
    open.end = new Date();
    await open.save();
    return mobileJson(request, { ok: true, activity: plain(open) });
  }

  if (action === "log") {
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60_000);
    const activity = await Activity.create({
      kind,
      label,
      start,
      end,
      intended: kind !== "waste",
      notes: String(body?.notes || ""),
    });
    return mobileJson(request, { ok: true, activity: plain(activity) });
  }

  return mobileJson(request, { error: "action must be start, stop, or log." }, { status: 400 });
}
