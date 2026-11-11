import { NextRequest } from "next/server";
import { transcribe } from "@/lib/integrations/whisper";
import { runAgent } from "@/lib/agent/run";
import { rateLimitDistributed } from "@/lib/security/rate-limit";
import { clientIp, mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

// One round trip for a voice turn: audio -> transcript -> agent plan/actions.
// Keeps the hands-free loop from paying two network waits.
export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const limited = await rateLimitDistributed(`mobile-voice-turn:${clientIp(request)}`, 20, 60_000);
  if (!limited.ok) {
    return mobileJson(
      request,
      { error: "Too many voice turns. Pause for a minute." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!audio || typeof audio === "string") {
    return mobileJson(request, { error: "An audio file is required." }, { status: 400 });
  }

  const transcription = await transcribe(audio as File);
  if (!transcription.text) {
    return mobileJson(
      request,
      {
        error: transcription.error || "No speech detected. Try again.",
        transcription,
      },
      { status: 422 }
    );
  }

  try {
    const result = await runAgent(transcription.text);
    return mobileJson(request, { text: transcription.text, transcription, ...result });
  } catch (error) {
    return mobileJson(
      request,
      { error: (error as Error).message, text: transcription.text, transcription },
      { status: 500 }
    );
  }
}
