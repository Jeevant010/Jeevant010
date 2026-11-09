"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Activity, FocusSession } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

const KINDS = ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"];

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getTodayActivities() {
  try {
    await connectDB();
    const docs = await Activity.find({ start: { $gte: startOfToday() } }).sort({ start: -1 });
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function getOpenActivity() {
  try {
    await connectDB();
    const doc: any = await Activity.findOne({ end: null }).sort({ start: -1 });
    return doc ? plain(doc) : null;
  } catch {
    return null;
  }
}

export async function getActiveFocus() {
  try {
    await connectDB();
    const doc: any = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
    return doc ? plain(doc) : null;
  } catch {
    return null;
  }
}

export async function startActivityAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const label = String(formData.get("label") || "").trim();
  if (!label) return;

  const kind = String(formData.get("kind") || "other");
  const intended = String(formData.get("intended") || "true") === "true";

  await connectDB();
  await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
  await Activity.create({
    kind: KINDS.includes(kind) ? kind : "other",
    label,
    start: new Date(),
    intended,
  });

  revalidatePath("/tracker");
}

export async function stopActivityAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");

  await connectDB();
  if (id) {
    await Activity.updateOne({ _id: id, end: null }, { $set: { end: new Date() } });
  } else {
    await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
  }
  revalidatePath("/tracker");
}

export async function logActivityAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const label = String(formData.get("label") || "").trim();
  const minutes = Math.max(1, Number(formData.get("minutes") || 0));
  if (!label || !minutes) return;

  const kind = String(formData.get("kind") || "other");
  const end = new Date();
  const start = new Date(end.getTime() - minutes * 60_000);

  await connectDB();
  await Activity.create({
    kind: KINDS.includes(kind) ? kind : "other",
    label,
    start,
    end,
    intended: String(formData.get("intended") || "true") === "true",
  });

  revalidatePath("/tracker");
}

export async function startFocusAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const intent = String(formData.get("intent") || "").trim();
  if (!intent) return;

  await connectDB();
  await FocusSession.updateMany({ status: "active" }, { $set: { status: "abandoned", endedAt: new Date() } });
  await FocusSession.create({ intent });
  revalidatePath("/tracker");
}

export async function endFocusAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const status = String(formData.get("status") || "done") === "abandoned" ? "abandoned" : "done";

  await connectDB();
  await FocusSession.updateMany({ status: "active" }, { $set: { status, endedAt: new Date() } });
  revalidatePath("/tracker");
}

export async function checkInAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const answer = String(formData.get("answer") || "").trim();
  const wasted = String(formData.get("wasted") || "false") === "true";

  await connectDB();
  const focus: any = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
  if (!focus) return;

  focus.checkIns.push({ at: new Date(), answer, wasted });
  if (wasted) {
    focus.distractions.push({ label: answer || "distraction", at: new Date() });
    await Activity.create({
      kind: "waste",
      label: answer || "Distraction",
      start: new Date(Date.now() - 10 * 60_000),
      end: new Date(),
      intended: false,
    });
  }
  await focus.save();
  revalidatePath("/tracker");
}

export async function getTrackerOverview() {
  const [activities, open, focus] = await Promise.all([
    getTodayActivities(),
    getOpenActivity(),
    getActiveFocus(),
  ]);

  const totals: Record<string, number> = {};
  for (const activity of activities as any[]) {
    const end = activity.end ? new Date(activity.end).getTime() : Date.now();
    const minutes = Math.max(0, Math.round((end - new Date(activity.start).getTime()) / 60_000));
    totals[activity.kind] = (totals[activity.kind] || 0) + minutes;
  }

  return { activities, open, focus, totals };
}
