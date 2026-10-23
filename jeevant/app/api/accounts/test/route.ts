import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { probeAccountById } from "@/lib/integrations/probe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  const id = String((body as { id?: unknown } | null)?.id || "");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400, headers: NO_STORE });
  }

  const result = await probeAccountById(id);
  return NextResponse.json(result, { headers: NO_STORE });
}
