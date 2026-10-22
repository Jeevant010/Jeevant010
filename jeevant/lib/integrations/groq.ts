// Groq chat completions. Free tier, fast, and used as the LLM provider when
// Gemini keys are absent (and as a fallback when Gemini fails).
// The key stays server-side in .env.local.

export function groqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export function groqModel(): string {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

export async function groqChat(system: string, user: string, json = true): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: groqModel(),
        temperature: 0.2,
        max_tokens: 2048,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}
