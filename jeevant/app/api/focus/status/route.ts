import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { FocusSession } from "@/lib/database/models";

export const runtime = "nodejs";

const DUE_MINUTES = 20;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const focus: any = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 }).lean();
    if (!focus) return NextResponse.json({ active: false });

    const last = focus.checkIns?.length
      ? focus.checkIns[focus.checkIns.length - 1].at
      : focus.startedAt;
    const minutesSince = Math.max(0, Math.round((Date.now() - new Date(last).getTime()) / 60_000));

    return NextResponse.json({
      active: true,
      intent: focus.intent,
      startedAt: focus.startedAt,
      minutesSince,
      due: minutesSince >= DUE_MINUTES,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
