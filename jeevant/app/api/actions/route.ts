import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createActionToken, listActionTokens, revokeActionToken } from "@/lib/bridge/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session && session.role === "admin";
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ tokens: await listActionTokens() }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: NO_STORE });
  }

  const payload = body as Record<string, unknown>;
  const result = await createActionToken({
    action: String(payload.action || ""),
    args: payload.args && typeof payload.args === "object" ? (payload.args as Record<string, unknown>) : {},
    label: typeof payload.label === "string" ? payload.label : "",
    ttlMinutes: Number(payload.ttlMinutes) || undefined,
    maxUses: payload.maxUses === 0 ? 0 : Number(payload.maxUses) || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400, headers: NO_STORE });
  }

  return NextResponse.json(result, { headers: NO_STORE });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400, headers: NO_STORE });

  const revoked = await revokeActionToken(id);
  return NextResponse.json({ ok: revoked }, { status: revoked ? 200 : 404, headers: NO_STORE });
}
