import { NextRequest, NextResponse } from "next/server";
import { runWorkflowByWebhook } from "@/lib/automation/run";

export const runtime = "nodejs";
export const maxDuration = 60;

// Inbound trigger. Point any external service at:
//   POST /api/hooks/<webhookKey>
// The key is the credential; disable or delete the workflow to revoke it.
async function handle(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const result = await runWorkflowByWebhook(key);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}

export async function GET(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  return handle(request, context);
}
