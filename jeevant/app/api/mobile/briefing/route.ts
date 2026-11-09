import { NextRequest } from "next/server";
import { getBriefing } from "@/lib/agent/briefing";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const briefing = await getBriefing();
  return mobileJson(request, briefing);
}
