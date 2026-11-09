import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job, Approval, PushSubscription } from "@/lib/database/models";
import { groqConfigured, groqKeyCount, groqModel } from "@/lib/integrations/groq";

export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  let db = false;
  let queue = { queued: 0, running: 0, failed: 0, done: 0, stuck: 0 };
  let pendingApprovals = 0;
  let pushSubscriptions = 0;

  try {
    await connectDB();
    db = true;
    const stale = new Date(Date.now() - 10 * 60_000);
    const [queued, running, failed, done, pending, stuck, subscribers] = await Promise.all([
      Job.countDocuments({ status: "queued" }),
      Job.countDocuments({ status: "running" }),
      Job.countDocuments({ status: "failed" }),
      Job.countDocuments({ status: "done" }),
      Approval.countDocuments({ status: "pending" }),
      Job.countDocuments({ status: "running", updatedAt: { $lt: stale } }),
      PushSubscription.countDocuments({}),
    ]);
    queue = { queued, running, failed, done, stuck };
    pendingApprovals = pending;
    pushSubscriptions = subscribers;
  } catch {
    // reported as db: false
  }

  const degraded = !db || queue.failed >= 5 || queue.stuck > 0 || pendingApprovals >= 50;

  return NextResponse.json({
    ok: db,
    status: !db ? "down" : degraded ? "degraded" : "ok",
    db,
    latencyMs: Date.now() - started,
    providers: {
      groq: groqConfigured(),
      groqKeys: groqKeyCount(),
      groqModel: groqModel(),
      gemini: !!process.env.GEMINI_API_KEYS,
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
      n8n: !!process.env.N8N_WEBHOOK_URL,
      telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      push: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    },
    queue,
    approvals: { pending: pendingApprovals },
    push: { subscriptions: pushSubscriptions },
    at: new Date().toISOString(),
  });
}
