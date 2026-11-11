import { NextRequest } from "next/server";
import { getPersona, savePersona } from "@/lib/agent/persona";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  return mobileJson(request, { persona: await getPersona() });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const body = await request.json().catch(() => null);
  const persona = await savePersona(body);
  return mobileJson(request, { ok: true, persona });
}
