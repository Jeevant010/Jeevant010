import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAgent } from "@/lib/agent/run";
import { rateLimitDistributed, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimitDistributed(rateLimitKey("agent", request), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

  const result = await runAgent(prompt);
  return NextResponse.json(result);
}
