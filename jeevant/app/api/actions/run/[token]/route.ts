import { NextRequest, NextResponse } from "next/server";
import { previewActionToken, runActionToken } from "@/lib/bridge/tokens";
import { rateLimitDistributed, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const MAX_BODY = 16_384;

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const limited = await rateLimitDistributed(rateLimitKey("bridge-preview", _request), 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const { token } = await context.params;
  const preview = await previewActionToken(token);
  if (!preview.ok) {
    return NextResponse.json({ error: preview.error }, { status: preview.status, headers: NO_STORE });
  }
  return NextResponse.json(preview, { headers: NO_STORE });
}

export async function POST(request: NextRequest, context: Context) {
  const limited = await rateLimitDistributed(rateLimitKey("bridge-run", request), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const { token } = await context.params;
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "Body too large." }, { status: 413, headers: NO_STORE });
  }

  let body: unknown = {};
  if (raw.trim()) {
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: NO_STORE });
    }
  }

  if (body !== null && (typeof body !== "object" || Array.isArray(body))) {
    return NextResponse.json({ error: "Body must be an object." }, { status: 400, headers: NO_STORE });
  }

  const payload = (body || {}) as Record<string, unknown>;
  const args =
    payload.args && typeof payload.args === "object" && !Array.isArray(payload.args)
      ? (payload.args as Record<string, unknown>)
      : payload;

  const result = await runActionToken(token, args);
  return NextResponse.json(result, { status: result.status, headers: NO_STORE });
}
