import { NextRequest } from "next/server";
import { transcribe } from "@/lib/integrations/whisper";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!audio || typeof audio === "string") {
    return mobileJson(request, { error: "An audio file is required." }, { status: 400 });
  }

  const result = await transcribe(audio as File);
  return mobileJson(request, result, { status: result.error && !result.text ? 502 : 200 });
}
