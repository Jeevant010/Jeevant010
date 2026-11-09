import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/run";
import { rateLimitDistributed } from "@/lib/security/rate-limit";
import { clientIp, mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const limited = await rateLimitDistributed(`mobile-agent:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) {
    return mobileJson(
      request,
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) return mobileJson(request, { error: "prompt is required" }, { status: 400 });

  const result = await runAgent(prompt);
  return mobileJson(request, result);
}
