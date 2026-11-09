// Speech-to-text via Groq's free Whisper endpoint.
// Without a Groq key the adapter reports `simulated: true` so the rest of the
// pipeline still runs end-to-end.
//
// Transcription shares the same comma-separated key pool as chat, so a 429 on
// one free key rotates to the next instead of failing the capture.

import type { TranscriptResult } from "./types";
import { safeFetch } from "@/lib/http/fetch";
import { groqKeys } from "./groq";

const ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";

export function whisperConfigured(): boolean {
  return groqKeys().length > 0;
}

function model(): string {
  return process.env.GROQ_WHISPER_MODEL || "whisper-large-v3";
}

function shouldRotate(status: number): boolean {
  return status === 401 || status === 403 || status === 408 || status === 429 || status >= 500;
}

export async function transcribe(file: File): Promise<TranscriptResult> {
  const keys = groqKeys();
  if (!keys.length) {
    return {
      text: "",
      simulated: true,
      provider: "stub",
      error: "GROQ_API_KEYS / GROQ_API_KEY not set — transcription is stubbed. Add a key to enable real speech-to-text.",
    };
  }

  let lastError = "";
  for (const key of keys) {
    try {
      const formData = new FormData();
      formData.append("file", file, file.name || "voice.webm");
      formData.append("model", model());
      formData.append("response_format", "text");
      formData.append("temperature", "0");

      const res = await safeFetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: formData,
        cache: "no-store",
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        lastError = `Groq transcription failed (${res.status}). ${detail.slice(0, 200)}`;
        if (shouldRotate(res.status)) continue;
        break;
      }

      const text = (await res.text()).trim();
      return { text, simulated: false, provider: `groq:${model()}` };
    } catch (error) {
      lastError = `Groq transcription error: ${(error as Error).message}`;
      continue;
    }
  }

  return {
    text: "",
    simulated: false,
    provider: `groq:${model()}`,
    error: lastError || "Groq transcription failed on every configured key.",
  };
}
