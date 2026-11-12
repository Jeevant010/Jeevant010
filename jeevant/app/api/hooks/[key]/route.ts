import { NextRequest, NextResponse } from "next/server";
import { runWorkflowByWebhook } from "@/lib/automation/run";
import { rateLimitDistributed, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// Inbound trigger. Point any external service at:
//   POST /api/hooks/<webhookKey>
// The key is the credential; disable or delete the workflow to revoke it.
async function handle(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const limited = await rateLimitDistributed(rateLimitKey("workflow-hook", request), 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const { key } = await context.params;
  if (!/^[a-f0-9]{24,64}$/i.test(key)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const result = await runWorkflowByWebhook(key);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}

export async function GET(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  return handle(request, context);
}
