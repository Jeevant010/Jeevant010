import connectDB from "@/lib/db";
import { ChannelAccount } from "@/lib/database/models";
import type { ResolvedAccount } from "./accounts";
import { getGoogleAccessToken } from "./google";

export type ProbeResult = { ok: boolean; mode: string; detail: string; provider?: string };

function pick(account: ResolvedAccount | null, key: string, envKey?: string): string {
  return String(account?.secrets?.[key] || account?.config?.[key] || (envKey ? process.env[envKey] : "") || "");
}

function clip(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function fail(detail: string, mode = "manual"): ProbeResult {
  return { ok: false, mode, detail };
}

async function get(url: string, headers?: Record<string, string>): Promise<Response> {
  return fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

export async function probeAccount(channel: string, account: ResolvedAccount | null): Promise<ProbeResult> {
  try {
    switch (channel) {
      case "telegram": {
        const token = pick(account, "botToken", "TELEGRAM_BOT_TOKEN") || pick(account, "token", "TELEGRAM_BOT_TOKEN");
        if (!token) return fail("No bot token set.");
        const res = await get(`https://api.telegram.org/bot${token}/getMe`);
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: { username?: string }; description?: string };
        if (res.ok && json.ok) {
          return { ok: true, mode: "direct", detail: `Bot @${json.result?.username || "unknown"} is reachable.`, provider: "telegram" };
        }
        return fail(`Telegram rejected the token: ${clip(json.description || `HTTP ${res.status}`)}`, "direct");
      }

      case "whatsapp": {
        const token = pick(account, "token", "WHATSAPP_TOKEN");
        const phoneNumberId = pick(account, "phoneNumberId", "WHATSAPP_PHONE_NUMBER_ID");
        if (!token || !phoneNumberId) return fail("Phone number ID and token are both required.");
        const version = process.env.WHATSAPP_API_VERSION || "v20.0";
        const res = await get(`https://graph.facebook.com/${version}/${phoneNumberId}`, {
          Authorization: `Bearer ${token}`,
        });
        if (res.ok) return { ok: true, mode: "direct", detail: "WhatsApp Cloud API credentials are valid.", provider: "meta-cloud" };
        const body = await res.text().catch(() => "");
        return fail(`Meta rejected the credentials: ${clip(body || `HTTP ${res.status}`)}`, "direct");
      }

      case "sms":
      case "call": {
        const sid = pick(account, "accountSid", "TWILIO_ACCOUNT_SID");
        const auth = pick(account, "authToken", "TWILIO_AUTH_TOKEN");
        if (!sid || !auth) return fail("Twilio account SID and auth token are required.");
        const res = await get(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
          Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString("base64")}`,
        });
        if (res.ok) return { ok: true, mode: "direct", detail: "Twilio credentials are valid.", provider: "twilio" };
        return fail(`Twilio rejected the credentials (HTTP ${res.status}).`, "direct");
      }

      case "discord": {
        const webhook = pick(account, "webhookUrl", "DISCORD_WEBHOOK_URL");
        if (!webhook) return fail("No webhook URL set.");
        const res = await get(webhook);
        if (res.ok) return { ok: true, mode: "webhook", detail: "Discord webhook is reachable.", provider: "discord" };
        return fail(`Discord webhook check failed (HTTP ${res.status}).`, "webhook");
      }

      case "slack": {
        const webhook = pick(account, "webhookUrl", "SLACK_WEBHOOK_URL");
        if (!webhook) return fail("No webhook URL set.");
        try {
          const url = new URL(webhook);
          if (url.hostname !== "hooks.slack.com") return fail("That is not a Slack webhook URL.", "webhook");
          return {
            ok: true,
            mode: "webhook",
            detail: "Webhook format looks valid. Slack only confirms on a real POST.",
            provider: "slack",
          };
        } catch {
          return fail("Webhook URL is malformed.", "webhook");
        }
      }

      case "mastodon": {
        const instance = pick(account, "instance", "MASTODON_INSTANCE").replace(/\/$/, "");
        const token = pick(account, "token", "MASTODON_TOKEN");
        if (!instance || !token) return fail("Instance URL and access token are required.");
        const res = await get(`${instance}/api/v1/accounts/verify_credentials`, {
          Authorization: `Bearer ${token}`,
        });
        if (res.ok) return { ok: true, mode: "direct", detail: "Mastodon token is valid.", provider: "mastodon" };
        return fail(`Mastodon rejected the token (HTTP ${res.status}).`, "direct");
      }

      case "email": {
        const refresh = pick(account, "refreshToken", "GOOGLE_REFRESH_TOKEN");
        const clientId = pick(account, "clientId", "GOOGLE_CLIENT_ID");
        const clientSecret = pick(account, "clientSecret", "GOOGLE_CLIENT_SECRET");

        if (refresh && clientId && clientSecret) {
          const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: refresh,
              grant_type: "refresh_token",
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) return { ok: true, mode: "direct", detail: "Google refresh token is valid.", provider: "google" };
          return fail(`Google rejected the refresh token (HTTP ${res.status}).`, "direct");
        }

        const token = await getGoogleAccessToken();
        return token
          ? { ok: true, mode: "direct", detail: "Google env credentials are valid.", provider: "google" }
          : fail("No refresh token in the account or environment.");
      }

      case "twitter": {
        const bearer = pick(account, "bearerToken", "TWITTER_BEARER_TOKEN");
        if (!bearer) return fail("No bearer token. Share intent still works.", "share");
        const res = await get("https://api.twitter.com/2/users/me", { Authorization: `Bearer ${bearer}` });
        if (res.ok) return { ok: true, mode: "direct", detail: "X API token is valid.", provider: "x" };
        return fail(`X rejected the token (HTTP ${res.status}). Share intent still works.`, "share");
      }

      case "linkedin":
        return fail("LinkedIn posting needs an approved app. Share intent works now.", "share");

      case "reddit":
        return fail("Reddit posting needs an OAuth app. Submit intent works now.", "share");

      default:
        return fail(`No probe for channel "${channel}".`);
    }
  } catch (error) {
    return fail(`Could not reach the provider: ${clip((error as Error).message)}`, "failed");
  }
}

export async function probeAccountById(id: string): Promise<ProbeResult> {
  try {
    await connectDB();
    const doc = await ChannelAccount.findById(id).lean();
    if (!doc) return fail("Account not found.");
    return probeAccount(String(doc.channel), {
      id: String(doc._id),
      label: doc.label,
      config: (doc.config || {}) as Record<string, string>,
      secrets: (doc.secrets || {}) as Record<string, string>,
    });
  } catch (error) {
    return fail(`Could not read the account: ${clip((error as Error).message)}`);
  }
}
