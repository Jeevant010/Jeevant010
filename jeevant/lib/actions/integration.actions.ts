"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Setting } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { getRuntimeConfig } from "@/lib/integrations/config";
import { whisperConfigured } from "@/lib/integrations/whisper";
import { geminiConfigured } from "@/lib/integrations/gemini";
import { gmailConfigured } from "@/lib/integrations/gmail";
import { calendarConfigured } from "@/lib/integrations/calendar";
import { dispatchToChannel } from "@/lib/integrations/channels";
import type { ChannelId } from "@/lib/integrations/types";

const EDITABLE_KEYS = [
  "n8nWebhookUrl",
  "telegramBotToken",
  "telegramChatId",
  "whatsappNumber",
  "gmailSender",
  "googleCalendarId",
  "siteUrl",
  "linkedinProfile",
  "youtubeChannel",
  "twitterHandle",
] as const;

export async function getSettings(): Promise<Record<string, string>> {
  return getRuntimeConfig();
}

export async function saveSettings(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };
    await connectDB();

    for (const key of EDITABLE_KEYS) {
      if (!formData.has(key)) continue;
      const value = String(formData.get(key) || "");
      await Setting.findOneAndUpdate({ key }, { key, value, updatedAt: new Date() }, { upsert: true });
    }
    revalidatePath("/integrations");
    return { success: true, detail: "Configuration saved." };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function getIntegrationStatus() {
  const cfg = await getRuntimeConfig();
  const has = (v?: string) => !!v && v.trim().length > 0;

  return [
    {
      id: "whisper",
      label: "Speech → Text (Groq Whisper)",
      env: "GROQ_API_KEY",
      configured: whisperConfigured(),
      detail: "Free Whisper transcription of your voice notes.",
    },
    {
      id: "gemini",
      label: "AI Drafting (Gemini, rotating keys)",
      env: "GEMINI_API_KEYS",
      configured: geminiConfigured(),
      detail: "Comma-separated key pool; rotates automatically on rate limits.",
    },
    {
      id: "gmail",
      label: "Gmail Drafts",
      env: "GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN",
      configured: gmailConfigured(),
      detail: "Saves formal email drafts straight into Gmail.",
    },
    {
      id: "calendar",
      label: "Google Calendar",
      env: "GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN",
      configured: calendarConfigured(),
      detail: "Locks time blocks. Falls back to the local schedule.",
    },
    {
      id: "n8n",
      label: "n8n Automation Webhook",
      env: "n8nWebhookUrl (or N8N_WEBHOOK_URL)",
      configured: has(cfg.n8nWebhookUrl),
      detail: "One webhook fans every post out to all your platforms.",
    },
    {
      id: "telegram",
      label: "Telegram Direct",
      env: "telegramBotToken + telegramChatId",
      configured: has(cfg.telegramBotToken) && has(cfg.telegramChatId),
      detail: "Posts straight to a channel via the free Bot API.",
    },
  ];
}

export async function testChannel(channel: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };
    const cfg = await getRuntimeConfig();
    const outcome = await dispatchToChannel(
      channel as ChannelId,
      {
        title: "System test",
        body: "This is a connectivity test from Jeevant OS. If you can read this, the channel is wired up.",
        tags: ["test"],
        source: "system",
      },
      cfg,
      { to: cfg.gmailSender }
    );
    return { success: outcome.ok, detail: outcome.detail || outcome.mode, url: outcome.url, mode: outcome.mode };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}
