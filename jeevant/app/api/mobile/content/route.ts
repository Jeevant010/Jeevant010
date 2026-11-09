import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ContentPost } from "@/lib/database/models";
import { getStyleGuide } from "@/lib/style";
import { groqChat, groqConfigured, groqModel } from "@/lib/integrations/groq";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHANNELS = ["linkedin", "twitter", "whatsapp", "telegram", "discord", "instagram", "general"];

function parseJson(text: string): any | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const topic = String(body?.topic || "").trim();
  if (!topic) return mobileJson(request, { error: "A topic is required." }, { status: 400 });

  if (!groqConfigured()) {
    return mobileJson(
      request,
      { error: "No AI key configured. Add GROQ_API_KEYS on the server to generate content." },
      { status: 503 }
    );
  }

  const channels = (Array.isArray(body?.channels) ? body.channels : ["linkedin", "twitter", "whatsapp"])
    .map(String)
    .filter((channel: string) => CHANNELS.includes(channel));
  const tone = String(body?.tone || "direct, first-person, no fluff").trim();
  const style = await getStyleGuide();

  const system = [
    "You write social content for one person. Output ONLY JSON.",
    'Shape: { "linkedin": string, "twitter": string, "whatsapp": string, "telegram": string, "discord": string, "instagram": string, "general": string }',
    "Write for the requested channels only; omit the others or leave them empty.",
    "Keep LinkedIn under 180 words, X/Twitter under 280 characters, WhatsApp/Telegram short and conversational, Discord short and casual.",
    "No emoji unless asked. No hashtags unless asked. No invented facts or metrics.",
    style ? `Match this writing style:\n${style}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `Topic: ${topic}\nChannels: ${channels.join(", ")}\nTone: ${tone}`;
  const text = await groqChat(system, user, true);
  if (!text) {
    return mobileJson(request, { error: "The model returned nothing. Check the Groq key and quota." }, { status: 502 });
  }

  const parsed = parseJson(text) || { general: text };
  const drafts: Record<string, string> = {};
  for (const channel of channels) {
    const value = String(parsed?.[channel] || "").trim();
    if (value) drafts[channel] = value;
  }
  if (!Object.keys(drafts).length) {
    const fallback = String(parsed?.general || text).trim();
    if (fallback) drafts.general = fallback;
  }
  if (!Object.keys(drafts).length) {
    return mobileJson(request, { error: "The model returned no usable drafts." }, { status: 502 });
  }

  await connectDB();
  const posts: Record<string, string> = {};
  for (const [channel, body] of Object.entries(drafts)) {
    const post = await ContentPost.create({
      title: `${topic.slice(0, 100)} (${channel})`,
      body,
      channels: [channel],
      source: "ai",
      status: "draft",
      tags: ["mobile", channel],
    });
    posts[channel] = String(post._id);
  }

  return mobileJson(request, {
    ok: true,
    drafts,
    posts,
    postId: posts[channels[0]] || Object.values(posts)[0],
    provider: `groq:${groqModel()}`,
  });
}
