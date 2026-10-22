// WhatsApp / SMS / calls.
// Credentials resolve in this order: explicit account (DB) -> environment -> fallback.
// Nothing here is required for the app to work.

import type { ResolvedAccount } from "./accounts";

export interface MessageResult {
  ok: boolean;
  mode: string; // direct | link | manual | failed
  detail: string;
  url?: string;
  provider?: string;
}

function digits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function cfg(account: ResolvedAccount | null | undefined, key: string, envKey: string): string {
  return String(account?.config?.[key] || process.env[envKey] || "");
}

function sec(account: ResolvedAccount | null | undefined, key: string, envKey: string): string {
  return String(account?.secrets?.[key] || process.env[envKey] || "");
}

export function whatsappConfigured(account?: ResolvedAccount | null): boolean {
  return !!(sec(account, "token", "WHATSAPP_TOKEN") && cfg(account, "phoneNumberId", "WHATSAPP_PHONE_NUMBER_ID"));
}

export function twilioConfigured(account?: ResolvedAccount | null): boolean {
  return !!(
    sec(account, "accountSid", "TWILIO_ACCOUNT_SID") &&
    sec(account, "authToken", "TWILIO_AUTH_TOKEN") &&
    cfg(account, "fromNumber", "TWILIO_FROM_NUMBER")
  );
}

export function accountLabel(account?: ResolvedAccount | null): string {
  return account?.label || "env";
}

export async function sendWhatsApp(
  to: string,
  body: string,
  account?: ResolvedAccount | null
): Promise<MessageResult> {
  const target = digits(to);

  if (!whatsappConfigured(account)) {
    return {
      ok: true,
      mode: "link",
      detail: "WhatsApp Cloud API not configured — share link is ready.",
      url: `https://wa.me/${target}?text=${encodeURIComponent(body)}`,
      provider: "wa.me",
    };
  }

  const version = process.env.WHATSAPP_API_VERSION || "v20.0";
  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${cfg(account, "phoneNumberId", "WHATSAPP_PHONE_NUMBER_ID")}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sec(account, "token", "WHATSAPP_TOKEN")}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: target,
          type: "text",
          text: { body },
        }),
      }
    );

    if (!res.ok) {
      return {
        ok: false,
        mode: "failed",
        detail: `WhatsApp API failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 160)}`,
        provider: "meta-cloud",
      };
    }
    return {
      ok: true,
      mode: "direct",
      detail: `Sent via WhatsApp Cloud API (${accountLabel(account)}).`,
      provider: "meta-cloud",
    };
  } catch (error) {
    return { ok: false, mode: "failed", detail: (error as Error).message, provider: "meta-cloud" };
  }
}

function twilioAuth(account?: ResolvedAccount | null): string {
  return Buffer.from(
    `${sec(account, "accountSid", "TWILIO_ACCOUNT_SID")}:${sec(account, "authToken", "TWILIO_AUTH_TOKEN")}`
  ).toString("base64");
}

export async function sendSMS(to: string, body: string, account?: ResolvedAccount | null): Promise<MessageResult> {
  if (!twilioConfigured(account)) {
    return {
      ok: true,
      mode: "manual",
      detail: "Twilio not configured — message copied for manual sending.",
      provider: "manual",
    };
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sec(account, "accountSid", "TWILIO_ACCOUNT_SID")}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth(account)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
        body: new URLSearchParams({
          To: to,
          From: cfg(account, "fromNumber", "TWILIO_FROM_NUMBER"),
          Body: body,
        }),
      }
    );
    if (!res.ok) {
      return {
        ok: false,
        mode: "failed",
        detail: `Twilio SMS failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 160)}`,
        provider: "twilio",
      };
    }
    return { ok: true, mode: "direct", detail: `SMS sent via Twilio (${accountLabel(account)}).`, provider: "twilio" };
  } catch (error) {
    return { ok: false, mode: "failed", detail: (error as Error).message, provider: "twilio" };
  }
}

export async function placeCall(
  to: string,
  message = "This is a call from Jeevant's assistant.",
  account?: ResolvedAccount | null
): Promise<MessageResult> {
  if (!twilioConfigured(account)) {
    return {
      ok: true,
      mode: "link",
      detail: "Twilio not configured — dial link is ready.",
      url: `tel:${to}`,
      provider: "tel",
    };
  }

  try {
    const twiml = `<Response><Say voice="alice">${message.replace(/[<>&]/g, "")}</Say></Response>`;
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sec(account, "accountSid", "TWILIO_ACCOUNT_SID")}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth(account)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
        body: new URLSearchParams({
          To: to,
          From: cfg(account, "fromNumber", "TWILIO_FROM_NUMBER"),
          Twiml: twiml,
        }),
      }
    );
    if (!res.ok) {
      return {
        ok: false,
        mode: "failed",
        detail: `Twilio call failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 160)}`,
        provider: "twilio",
      };
    }
    return { ok: true, mode: "direct", detail: `Call placed via Twilio (${accountLabel(account)}).`, provider: "twilio" };
  } catch (error) {
    return { ok: false, mode: "failed", detail: (error as Error).message, provider: "twilio" };
  }
}

export async function sendByChannel(
  channel: string,
  to: string,
  body: string,
  account?: ResolvedAccount | null
): Promise<MessageResult> {
  if (channel === "whatsapp") return sendWhatsApp(to, body, account);
  if (channel === "sms") return sendSMS(to, body, account);
  if (channel === "call") return placeCall(to, body || undefined, account);
  return { ok: false, mode: "failed", detail: `Unknown channel "${channel}".` };
}
