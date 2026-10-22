import { NextRequest, NextResponse } from "next/server";
import { processJobs } from "@/lib/worker/queue";
import { processDueWorkflows } from "@/lib/automation/run";

export const runtime = "nodejs";
export const maxDuration = 60;

// Drain the durable job queue. Protect with CRON_SECRET.
//   curl "https://host/api/cron/worker?limit=10" -H "Authorization: Bearer $CRON_SECRET"
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const key = new URL(request.url).searchParams.get("key");
    if (header !== secret && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit") || 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

  const [jobs, workflows] = await Promise.all([processJobs(limit), processDueWorkflows()]);
  return NextResponse.json({ ok: true, at: new Date().toISOString(), ...jobs, workflows });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
