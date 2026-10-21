import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { VoiceCapture } from "@/lib/database/models";
import { transcribe } from "@/lib/integrations/whisper";
import { draftFromTranscript } from "@/lib/integrations/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const audio = form.get("audio");
  const hint = String(form.get("hint") || "") || undefined;
  const durationSec = Number(form.get("durationSec") || 0) || 0;

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  await connectDB();

  const capture = await VoiceCapture.create({ status: "transcribing", durationSec });

  try {
    const transcript = await transcribe(audio);

    capture.transcript = transcript.text;
    capture.status = "drafting";

    const bundle = await draftFromTranscript(
      transcript.text || "(no speech detected)",
      hint
    );

    capture.intent = bundle.intent;
    capture.drafts = bundle.drafts as any;
    capture.calendarBlocks = bundle.calendarBlocks.map((block) => ({
      title: block.title,
      start: block.start ? new Date(block.start) : undefined,
      end: block.end ? new Date(block.end) : undefined,
      notes: block.notes,
    })) as any;
    capture.taskSuggestions = bundle.taskSuggestions as any;
    capture.provider = { whisper: transcript.provider, llm: bundle.provider };
    capture.simulated = transcript.simulated || bundle.simulated;
    capture.error = transcript.error || bundle.error;
    capture.status = "ready";
    capture.updatedAt = new Date();
    await capture.save();

    return NextResponse.json({ ok: true, capture: plain(capture) });
  } catch (error) {
    capture.status = "failed";
    capture.error = (error as Error).message;
    await capture.save();
    return NextResponse.json({ error: (error as Error).message, capture: plain(capture) }, { status: 500 });
  }
}
