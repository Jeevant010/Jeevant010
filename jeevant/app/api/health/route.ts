import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job, Approval } from "@/lib/database/models";

export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  let db = false;
  let queue = { queued: 0, running: 0, failed: 0, done: 0 };
  let pendingApprovals = 0;

  try {
    await connectDB();
    db = true;
    const [queued, running, failed, done, pending] = await Promise.all([
      Job.countDocuments({ status: "queued" }),
      Job.countDocuments({ status: "running" }),
      Job.countDocuments({ status: "failed" }),
      Job.countDocuments({ status: "done" }),
      Approval.countDocuments({ status: "pending" }),
    ]);
    queue = { queued, running, failed, done };
    pendingApprovals = pending;
  } catch {
    // reported as db: false
  }

  return NextResponse.json({
    ok: db,
    db,
    latencyMs: Date.now() - started,
    providers: {
      groq: !!process.env.GROQ_API_KEY,
      groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      gemini: !!process.env.GEMINI_API_KEYS,
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
      n8n: !!process.env.N8N_WEBHOOK_URL,
      telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    },
    queue,
    approvals: { pending: pendingApprovals },
    at: new Date().toISOString(),
  });
}
