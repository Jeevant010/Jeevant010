// Speech-to-text via Groq's free Whisper endpoint.
// Without GROQ_API_KEY the adapter reports `simulated: true` so the rest of the
// pipeline still runs end-to-end.

import type { TranscriptResult } from "./types";

const ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";

export function whisperConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

function model(): string {
  return process.env.GROQ_WHISPER_MODEL || "whisper-large-v3";
}

export async function transcribe(file: File): Promise<TranscriptResult> {
  if (!whisperConfigured()) {
    return {
      text: "",
      simulated: true,
      provider: "stub",
      error: "GROQ_API_KEY not set — transcription is stubbed. Add the key to enable real speech-to-text.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file, file.name || "voice.webm");
    formData.append("model", model());
    formData.append("response_format", "text");
    formData.append("temperature", "0");

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        text: "",
        simulated: false,
        provider: `groq:${model()}`,
        error: `Groq transcription failed (${res.status}). ${detail.slice(0, 200)}`,
      };
    }

    const text = (await res.text()).trim();
    return { text, simulated: false, provider: `groq:${model()}` };
  } catch (error) {
    return {
      text: "",
      simulated: false,
      provider: `groq:${model()}`,
      error: `Groq transcription error: ${(error as Error).message}`,
    };
  }
}
