import { NextRequest, NextResponse } from "next/server";
import { pushDueReminders } from "@/lib/push/reminders";
import { cronAuth } from "@/lib/security/cron";

export const runtime = "nodejs";
export const maxDuration = 60;

async function handle(request: NextRequest) {
  const auth = cronAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await pushDueReminders();
  return NextResponse.json({ ok: true, at: new Date().toISOString(), ...result });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
