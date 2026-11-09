// Groq chat completions. Free tier, fast, and used as the LLM provider when
// Gemini keys are absent (and as a fallback when Gemini fails).
// Keys stay server-side in .env.local.
//
// Free-tier quota is per key, so GROQ_API_KEYS accepts a comma-separated pool.
// On 429/401/403/5xx (or a network error) the next key is tried. A single
// GROQ_API_KEY still works and is appended to the pool for backwards compat.

import { safeFetch } from "@/lib/http/fetch";

function splitKeys(value: string | undefined): string[] {
  return String(value || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export function groqKeys(): string[] {
  const pool = splitKeys(process.env.GROQ_API_KEYS);
  const single = String(process.env.GROQ_API_KEY || "").trim();
  if (single && !pool.includes(single)) pool.push(single);
  return pool;
}

export function groqKeyCount(): number {
  return groqKeys().length;
}

export function groqConfigured(): boolean {
  return groqKeys().length > 0;
}

export function groqModel(): string {
  // Qwen on Groq, verified with JSON mode. Override with GROQ_MODEL if needed.
  return process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
}

// Retry across keys only when the failure is about this key or the provider's
// transient state. A malformed request (400) would fail identically everywhere.
function shouldRotate(status: number): boolean {
  return status === 401 || status === 403 || status === 408 || status === 429 || status >= 500;
}

export async function groqChat(
  system: string,
  user: string,
  json = true,
  options: { maxTokens?: number } = {}
): Promise<string | null> {
  const keys = groqKeys();
  if (!keys.length) return null;

  for (const key of keys) {
    try {
      const res = await safeFetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          model: groqModel(),
          temperature: 0.2,
          max_tokens: options.maxTokens ?? 2048,
          ...(json ? { response_format: { type: "json_object" } } : {}),
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        if (shouldRotate(res.status)) continue;
        return null;
      }
      const data: any = await res.json();
      return data?.choices?.[0]?.message?.content || null;
    } catch {
      // Network/timeout: try the next key.
      continue;
    }
  }
  return null;
}
