// Runtime configuration: environment defaults, overridable from the Integrations page
// (stored as non-secret Setting documents). Only non-secret values live here.

import connectDB from "@/lib/db";
import { ChannelAccount, Setting } from "@/lib/database/models";
import { openSecrets } from "@/lib/crypto/secrets";

export type RuntimeConfig = Record<string, string>;

const DEFAULTS: RuntimeConfig = {
  n8nWebhookUrl: "",
  telegramBotToken: "",
  telegramChatId: "",
  whatsappNumber: "",
  gmailSender: "",
  googleCalendarId: "primary",
  siteUrl: "https://jeevant.is-a.dev",
  linkedinProfile: "",
  youtubeChannel: "",
  twitterHandle: "",
  discordWebhookUrl: "",
  slackWebhookUrl: "",
  mastodonInstance: "",
  mastodonToken: "",
};

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const seeded: RuntimeConfig = {
    ...DEFAULTS,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || DEFAULTS.n8nWebhookUrl,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || DEFAULTS.telegramBotToken,
    telegramChatId: process.env.TELEGRAM_CHAT_ID || DEFAULTS.telegramChatId,
    whatsappNumber: process.env.WHATSAPP_DEFAULT_NUMBER || DEFAULTS.whatsappNumber,
    gmailSender: process.env.GMAIL_SENDER || DEFAULTS.gmailSender,
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID || DEFAULTS.googleCalendarId,
    siteUrl: process.env.PUBLIC_SITE_URL || DEFAULTS.siteUrl,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || DEFAULTS.discordWebhookUrl,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || DEFAULTS.slackWebhookUrl,
    mastodonInstance: process.env.MASTODON_INSTANCE || DEFAULTS.mastodonInstance,
    mastodonToken: process.env.MASTODON_TOKEN || DEFAULTS.mastodonToken,
  };

  const stored: RuntimeConfig = {};
  try {
    await connectDB();
    const docs = await Setting.find({});
    for (const doc of docs) {
      if (typeof doc.value === "string") stored[doc.key] = doc.value;
    }

    const merged: RuntimeConfig = { ...seeded, ...stored };
    const accounts = await ChannelAccount.find({ isDefault: true }).lean();

    for (const account of accounts as any[]) {
      const config = (account.config || {}) as Record<string, string>;
      const secrets = openSecrets(account.secrets);

      switch (account.channel) {
        case "telegram":
          merged.telegramBotToken ||= secrets.botToken || secrets.token || "";
          merged.telegramChatId ||= config.chatId || "";
          break;
        case "discord":
          merged.discordWebhookUrl ||= secrets.webhookUrl || config.webhookUrl || "";
          break;
        case "slack":
          merged.slackWebhookUrl ||= secrets.webhookUrl || config.webhookUrl || "";
          break;
        case "mastodon":
          merged.mastodonInstance ||= config.instance || "";
          merged.mastodonToken ||= secrets.token || "";
          break;
        case "whatsapp":
          merged.whatsappNumber ||= config.fromNumber || "";
          break;
        default:
          break;
      }
    }

    return merged;
  } catch {
    // Database not reachable — fall back to env defaults only.
  }

  return { ...seeded, ...stored };
}

export function isTruthy(value?: string | null): boolean {
  return !!value && value.trim().length > 0;
}
