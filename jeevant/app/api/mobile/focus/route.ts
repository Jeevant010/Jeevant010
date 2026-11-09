import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Activity, FocusSession } from "@/lib/database/models";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const [active, recent] = await Promise.all([
    FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 }),
    FocusSession.find({}).sort({ startedAt: -1 }).limit(20),
  ]);
  return mobileJson(request, {
    active: active ? plain(active) : null,
    sessions: recent.map(plain),
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  await connectDB();

  if (action === "start") {
    const intent = String(body?.intent || "").trim();
    if (!intent) return mobileJson(request, { error: "Name the focus first." }, { status: 400 });
    await FocusSession.updateMany(
      { status: "active" },
      { $set: { status: "done", endedAt: new Date() } }
    );
    const session = await FocusSession.create({ intent, status: "active", startedAt: new Date() });
    return mobileJson(request, { ok: true, session: plain(session) });
  }

  if (action === "stop") {
    const active = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
    if (!active) return mobileJson(request, { error: "No focus session is active." }, { status: 404 });
    active.status = "done";
    active.endedAt = new Date();
    await active.save();
    const minutes = Math.max(1, Math.round((active.endedAt.getTime() - active.startedAt.getTime()) / 60_000));
    return mobileJson(request, { ok: true, session: plain(active), minutes });
  }

  if (action === "checkin") {
    const active = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
    if (!active) return mobileJson(request, { error: "No focus session is active." }, { status: 404 });

    const wasted = body?.wasted === true;
    const answer = String(body?.answer || (wasted ? "distracted" : "on track"));
    active.checkIns.push({ at: new Date(), answer, wasted });
    if (wasted) {
      active.distractions.push({ label: answer, at: new Date() });
      await Activity.create({
        kind: "waste",
        label: `Focus check-in: ${answer}`,
        start: new Date(Date.now() - 15 * 60_000),
        end: new Date(),
        intended: false,
      });
    }
    await active.save();
    return mobileJson(request, { ok: true, session: plain(active), wasted });
  }

  return mobileJson(request, { error: "action must be start, stop, or checkin." }, { status: 400 });
}
