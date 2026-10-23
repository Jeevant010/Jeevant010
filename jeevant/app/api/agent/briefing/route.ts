import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBriefing } from "@/lib/agent/briefing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const briefing = await getBriefing();
  return NextResponse.json(briefing);
}
