import { NextRequest } from "next/server";
import { groqChat, groqConfigured, groqModel } from "@/lib/integrations/groq";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  if (!groqConfigured()) {
    return mobileJson(
      request,
      { error: "No Groq key is configured on the server. Add GROQ_API_KEYS to the backend project." },
      { status: 503 }
    );
  }

  const model = process.env.AGENT_MODEL || "openai/gpt-oss-120b";
  const reply = await groqChat("You are a health check.", "Reply with exactly: AI OK", false, {
    maxTokens: 12,
    model,
  });

  if (!reply) {
    return mobileJson(
      request,
      {
        error: `Groq did not answer with ${model}. Check the key, the model name, and the free-tier quota in the backend logs.`,
      },
      { status: 502 }
    );
  }

  return mobileJson(request, {
    ok: true,
    model,
    reply: reply.trim().slice(0, 60),
  });
}
