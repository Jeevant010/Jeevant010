import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getActionMeta, validateActionArgs } from "@/lib/bridge/catalog";
import { runBridgeAction } from "@/lib/bridge/actions";
import { audit } from "@/lib/guardrails/policy";
import { rateLimitDistributed, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const limited = await rateLimitDistributed(rateLimitKey("quick-actions", request), 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400, headers: NO_STORE });
  }

  const payload = body as { action?: unknown; args?: unknown };
  const action = String(payload.action || "");
  const meta = getActionMeta(action);
  if (!meta) {
    return NextResponse.json({ error: `Unknown action "${action}".` }, { status: 400, headers: NO_STORE });
  }

  const validation = validateActionArgs(meta, payload.args || {});
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400, headers: NO_STORE });
  }

  const result = await runBridgeAction(action, validation.args);
  await audit(
    { kind: `quick:${action}`, target: action, meta: { via: "dashboard" } },
    result.ok ? "executed" : "failed",
    result.summary
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: NO_STORE });
}
