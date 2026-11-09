import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Activity, Approval, FocusSession, Schedule, Task } from "@/lib/database/models";
import { getBriefing } from "@/lib/agent/briefing";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINUTE = 60_000;

function resolveRange(request: NextRequest): { start: Date; end: Date } {
  const now = new Date();
  const fallbackStart = new Date(now);
  fallbackStart.setHours(0, 0, 0, 0);
  const fallbackEnd = new Date(fallbackStart);
  fallbackEnd.setDate(fallbackEnd.getDate() + 1);

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const start = from ? new Date(from) : fallbackStart;
  const end = to ? new Date(to) : fallbackEnd;

  return {
    start: Number.isNaN(start.getTime()) ? fallbackStart : start,
    end: Number.isNaN(end.getTime()) ? fallbackEnd : end,
  };
}

function minutesBetween(start: Date | string, end: Date | string | null | undefined, now: Date): number {
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : now.getTime();
  return Math.max(0, Math.round((to - from) / MINUTE));
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const { start, end } = resolveRange(request);
  const now = new Date();
  const weekAhead = new Date(end.getTime() + 7 * 24 * 60 * MINUTE);

  await connectDB();

  const [overdue, dueToday, upcoming, schedule, activities, activeFocus, focusSessions, approvals, briefing] =
    await Promise.all([
      Task.find({ isCompleted: false, dueDate: { $ne: null, $lt: now } }).sort({ dueDate: 1 }).limit(50),
      Task.find({ isCompleted: false, dueDate: { $gte: now, $lt: end } }).sort({ dueDate: 1 }).limit(50),
      Task.find({ isCompleted: false, dueDate: { $gte: end, $lt: weekAhead } }).sort({ dueDate: 1 }).limit(50),
      Schedule.find({ start: { $lt: end }, end: { $gt: start } }).sort({ start: 1 }).limit(100),
      Activity.find({
        $or: [
          { start: { $gte: start, $lt: end } },
          { end: null, start: { $lt: end } },
        ],
      }).sort({ start: 1 }).limit(100),
      FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 }),
      FocusSession.find({
        $or: [
          { startedAt: { $gte: start, $lt: end } },
          { endedAt: null, startedAt: { $lt: end } },
        ],
      }).sort({ startedAt: -1 }).limit(50),
      Approval.countDocuments({ status: "pending" }),
      getBriefing(),
    ]);

  const totals: Record<string, number> = {
    deep_work: 0,
    meeting: 0,
    eating: 0,
    sleep: 0,
    exercise: 0,
    waste: 0,
    break: 0,
    other: 0,
  };
  let focusMinutes = 0;

  for (const activity of activities as any[]) {
    const kind = String(activity.kind || "other");
    totals[kind] = (totals[kind] || 0) + minutesBetween(activity.start, activity.end, now);
  }
  for (const session of focusSessions as any[]) {
    focusMinutes += minutesBetween(session.startedAt, session.endedAt, now);
  }

  const logged = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return mobileJson(request, {
    range: { from: start.toISOString(), to: end.toISOString() },
    briefing,
    overdue: overdue.map(plain),
    dueToday: dueToday.map(plain),
    upcoming: upcoming.map(plain),
    schedule: schedule.map(plain),
    activities: activities.map(plain),
    focus: {
      active: activeFocus ? plain(activeFocus) : null,
      sessions: focusSessions.map(plain),
      minutes: focusMinutes,
    },
    totals: { ...totals, focus: focusMinutes, logged },
    counts: {
      overdue: overdue.length,
      dueToday: dueToday.length,
      upcoming: upcoming.length,
      schedule: schedule.length,
      approvals,
    },
    generatedAt: now.toISOString(),
  });
}
