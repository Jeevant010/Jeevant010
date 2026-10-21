import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { transcribe } from "@/lib/integrations/whisper";
import { runAgent } from "@/lib/agent/run";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const transcript = await transcribe(audio);
  if (!transcript.text) {
    return NextResponse.json(
      { error: transcript.error || "No speech detected.", simulated: transcript.simulated },
      { status: 422 }
    );
  }

  const result = await runAgent(transcript.text);
  return NextResponse.json({ transcript: transcript.text, ...result });
}
