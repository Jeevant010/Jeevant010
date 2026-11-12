import { NextRequest } from "next/server";
import { runAndStoreEvals } from "@/lib/agent/evals";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const result = await runAndStoreEvals();
  return mobileJson(request, result);
}
