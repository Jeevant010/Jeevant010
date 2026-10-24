import { NextRequest, NextResponse } from "next/server";
import { pushDueReminders } from "@/lib/push/reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const key = new URL(request.url).searchParams.get("key");
    if (header !== secret && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
