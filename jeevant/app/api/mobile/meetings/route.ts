import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval, Schedule } from "@/lib/database/models";
import { listUpcoming } from "@/lib/integrations/calendar-read";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  await connectDB();
  const now = new Date();
  const [local, google] = await Promise.all([
    Schedule.find({ start: { $gte: now } }).sort({ start: 1 }).limit(20),
    listUpcoming({ days: 21, max: 20 }),
  ]);

  const meetings = [
    ...local.map((item: any) => ({
      id: String(item._id),
      title: item.title,
      start: item.start,
      end: item.end,
      source: "local",
      notes: item.notes || "",
    })),
    ...(google.ok
      ? google.events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          source: "google",
          notes: event.location || "",
        }))
      : []),
  ].sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());

  return mobileJson(request, {
    meetings,
    google: { ok: google.ok, detail: google.detail },
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const startValue = String(body?.start || "").trim();
  if (!title) return mobileJson(request, { error: "A meeting needs a title." }, { status: 400 });

  const start = startValue ? new Date(startValue) : new Date();
  if (Number.isNaN(start.getTime())) {
    return mobileJson(request, { error: "That start time could not be parsed." }, { status: 400 });
  }

  const minutes = Math.min(Math.max(Number(body?.minutes) || 30, 15), 480);
  const end = new Date(start.getTime() + minutes * 60_000);
  const notes = String(body?.notes || "");

  const guard = await evaluateExternalAction({ kind: "calendar", target: title });
  if (!guard.allowed) return mobileJson(request, { error: guard.reason }, { status: 403 });

  await connectDB();
  const approval = await Approval.create({
    kind: "calendar",
    title,
    detail: notes || `${minutes} minute meeting`,
    payload: { start: start.toISOString(), end: end.toISOString(), notes },
    status: "pending",
  });

  return mobileJson(request, {
    ok: true,
    approvalId: String(approval._id),
    start: start.toISOString(),
    end: end.toISOString(),
    detail: "Meeting queued for approval. Nothing has been written to the calendar.",
  });
}
