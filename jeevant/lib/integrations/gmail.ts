// Gmail draft creation via the Gmail API (OAuth refresh token).
// Without credentials the draft is kept inside the app ("manual" mode).

import { getGoogleAccessToken, googleConfigured } from "./google";

export function gmailConfigured(): boolean {
  return googleConfigured();
}

export interface DraftResult {
  ok: boolean;
  mode: string;
  detail: string;
  id?: string;
}

function buildRawMessage({ to, subject, body }: { to?: string; subject?: string; body: string }): string {
  const from = process.env.GMAIL_SENDER || "me";
  const headers = [
    `From: ${from}`,
    to ? `To: ${to}` : "",
    `Subject: ${subject || "(no subject)"}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
  ].filter(Boolean);

  const message = `${headers.join("\r\n")}\r\n\r\n${body}`;
  return Buffer.from(message, "utf-8").toString("base64url");
}

export async function saveDraft({ to, subject, body }: { to?: string; subject?: string; body: string }): Promise<DraftResult> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return {
      ok: false,
      mode: "manual",
      detail: "Google OAuth not configured — draft saved in the app only.",
    };
  }

  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ message: { raw: buildRawMessage({ to, subject, body }) } }),
    });

    if (!res.ok) {
      return {
        ok: false,
        mode: "failed",
        detail: `Gmail draft failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 160)}`,
      };
    }
    const json: any = await res.json();
    return { ok: true, mode: "direct", detail: "Draft created in Gmail.", id: json?.id };
  } catch (error) {
    return { ok: false, mode: "failed", detail: `Gmail error: ${(error as Error).message}` };
  }
}
