import { NextRequest, NextResponse } from "next/server";
import { dispatchDuePosts } from "@/lib/actions/content.actions";
import { getMorningDigest } from "@/lib/actions/voice.actions";
import { cronAuth } from "@/lib/security/cron";

export const runtime = "nodejs";
export const maxDuration = 60;

// Hit this from any free scheduler (cron-job.org, GitHub Actions, Vercel Cron,
// a system crontab on your VPS) to publish queued posts and warm the digest.
//   curl https://your-host/api/cron/dispatch -H "Authorization: Bearer $CRON_SECRET"

async function handle(request: NextRequest) {
  const auth = cronAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const dispatched = await dispatchDuePosts();
  const digest = await getMorningDigest();

  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
    dispatched,
    digest,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
