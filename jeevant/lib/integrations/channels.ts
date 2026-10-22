// Distribution layer: fan a finished post out to every channel.
//
// Priority per channel:
//   1. n8n webhook (if configured)  -> mode "webhook"  (fully automated, free/self-hosted)
//   2. native direct API            -> mode "direct"   (Telegram Bot API, Gmail drafts)
//   3. share-intent link            -> mode "link"     (opens the platform's composer)
//   4. manual copy                  -> mode "manual"
//
// Nothing here costs money and nothing requires a paid API tier.

import { isTruthy, type RuntimeConfig } from "./config";
import type { ChannelId, DispatchOutcome } from "./types";
import { CHANNELS } from "@/lib/catalog/channels";
import { saveDraft } from "./gmail";

export { CHANNELS };

export interface PostPayload {
  title?: string;
  body: string;
  tags?: string[];
  source?: string;
  url?: string;
}

function composeText(post: PostPayload): string {
  const parts = [post.title, post.body].filter((p) => p && p.trim().length > 0);
  const tags = (post.tags || []).filter(Boolean).map((t) => `#${t.replace(/\s+/g, "")}`);
  if (tags.length) parts.push(tags.join(" "));
  return parts.join("\n\n");
}

export function buildShareUrl(channel: ChannelId, post: PostPayload, cfg: RuntimeConfig): string | undefined {
  const text = composeText(post);
  const url = post.url || cfg.siteUrl || "";
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/${(cfg.whatsappNumber || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ""}`;
    case "linkedin":
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    case "reddit":
      return `https://www.reddit.com/submit?selftext=true&title=${encodeURIComponent(post.title || text.slice(0, 120))}&text=${encodeURIComponent(text)}`;
    default:
      return undefined;
  }
}

async function postToWebhook(cfg: RuntimeConfig, payload: Record<string, unknown>): Promise<DispatchOutcome | null> {
  if (!isTruthy(cfg.n8nWebhookUrl)) return null;
  try {
    const res = await fetch(cfg.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    return {
      channel: String(payload.channel || ""),
      ok: res.ok,
      mode: "webhook",
      detail: res.ok ? "Sent to n8n workflow." : `n8n responded ${res.status}.`,
    };
  } catch (error) {
    return { channel: String(payload.channel || ""), ok: false, mode: "webhook", detail: `n8n error: ${(error as Error).message}` };
  }
}

async function sendTelegram(cfg: RuntimeConfig, text: string): Promise<DispatchOutcome | null> {
  if (!isTruthy(cfg.telegramBotToken) || !isTruthy(cfg.telegramChatId)) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ chat_id: cfg.telegramChatId, text, disable_web_page_preview: true }),
    });
    return {
      channel: "telegram",
      ok: res.ok,
      mode: "direct",
      detail: res.ok ? "Delivered via Telegram Bot API." : `Telegram responded ${res.status}.`,
    };
  } catch (error) {
    return { channel: "telegram", ok: false, mode: "direct", detail: `Telegram error: ${(error as Error).message}` };
  }
}

export async function dispatchToChannel(
  channel: ChannelId,
  post: PostPayload,
  cfg: RuntimeConfig,
  extra?: { to?: string }
): Promise<DispatchOutcome> {
  const text = composeText(post);

  if (channel === "email") {
    const draft = await saveDraft({
      to: extra?.to || cfg.gmailSender,
      subject: post.title || "Update",
      body: post.body,
    });
    return {
      channel,
      ok: draft.ok,
      mode: draft.mode,
      detail: draft.detail,
    };
  }

  if (channel === "telegram") {
    const direct = await sendTelegram(cfg, text);
    if (direct && direct.ok) return direct;
    const webhook = await postToWebhook(cfg, { channel, title: post.title, body: post.body, tags: post.tags, source: post.source });
    if (webhook) return webhook;
    return {
      channel,
      ok: true,
      mode: "link",
      url: buildShareUrl(channel, post, cfg),
      detail: direct?.detail ? `${direct.detail} Falling back to share link.` : "Share link ready.",
    };
  }

  if (channel === "discord" || channel === "slack") {
    const webhookUrl = channel === "discord" ? cfg.discordWebhookUrl : cfg.slackWebhookUrl;
    if (!isTruthy(webhookUrl)) {
      return {
        channel,
        ok: true,
        mode: "manual",
        detail: `${channel === "discord" ? "Discord" : "Slack"} webhook not configured — copy the post.`,
      };
    }
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(
          channel === "discord" ? { content: text } : { text }
        ),
      });
      return {
        channel,
        ok: res.ok,
        mode: "direct",
        detail: res.ok ? `Posted to ${channel}.` : `${channel} responded ${res.status}.`,
      };
    } catch (error) {
      return { channel, ok: false, mode: "direct", detail: (error as Error).message };
    }
  }

  if (channel === "mastodon") {
    const instance = cfg.mastodonInstance.replace(/\/$/, "");
    const token = process.env.MASTODON_TOKEN;
    if (!instance || !token) {
      return {
        channel,
        ok: true,
        mode: "manual",
        detail: "Mastodon instance/token not configured — copy the post.",
      };
    }
    try {
      const res = await fetch(`${instance}/api/v1/statuses`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status: text }),
      });
      return {
        channel,
        ok: res.ok,
        mode: "direct",
        detail: res.ok ? "Posted to Mastodon." : `Mastodon responded ${res.status}.`,
      };
    } catch (error) {
      return { channel, ok: false, mode: "direct", detail: (error as Error).message };
    }
  }

  // Channels without a free direct API: prefer n8n, else a share link.
  const webhook = await postToWebhook(cfg, { channel, title: post.title, body: post.body, tags: post.tags, source: post.source });
  if (webhook) return webhook;

  const url = buildShareUrl(channel, post, cfg);
  if (channel === "youtube") {
    return {
      channel,
      ok: true,
      mode: "manual",
      detail: "YouTube has no text-post API — outline ready to copy into Studio / community post.",
    };
  }
  if (url) {
    return { channel, ok: true, mode: "link", url, detail: "Share intent ready — click to open the composer." };
  }
  return { channel, ok: false, mode: "manual", detail: "No transport configured for this channel." };
}
