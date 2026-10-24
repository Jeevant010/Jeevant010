import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { countSubscriptions, removeSubscription, saveSubscription } from "@/lib/push/webpush";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session && session.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  return NextResponse.json({ count: await countSubscriptions() }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400, headers: NO_STORE });
  }

  const result = await saveSubscription(
    body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } },
    request.headers.get("user-agent") || ""
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: NO_STORE });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  const endpoint = String(
    (body as { endpoint?: unknown } | null)?.endpoint ||
      new URL(request.url).searchParams.get("endpoint") ||
      ""
  );

  const ok = await removeSubscription(endpoint);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers: NO_STORE });
}
