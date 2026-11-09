import { getGoogleAccessToken } from "./google";
import { groqChat, groqConfigured } from "./groq";
import { getStyleGuide } from "@/lib/style";
import { safeFetch } from "@/lib/http/fetch";

export type MailSummary = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  unread: boolean;
};

export type MailAttachment = { filename: string; mimeType: string; size: number };

export type MailFull = MailSummary & {
  body: string;
  messageIdHeader: string;
  references: string;
  replyTo: string;
  attachments: MailAttachment[];
};

export type MailListResult = { ok: boolean; mode: string; detail: string; messages: MailSummary[] };
export type MailResult = { ok: boolean; mode: string; detail: string; message?: MailFull };
export type SummaryResult = { ok: boolean; detail: string };

function decodeBase64Url(value: string): string {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function header(payload: any, name: string): string {
  const headers = Array.isArray(payload?.headers) ? payload.headers : [];
  const found = headers.find((item: any) => String(item?.name || "").toLowerCase() === name.toLowerCase());
  return String(found?.value || "");
}

function walkBody(part: any): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data) return decodeBase64Url(part.body.data);
  if (Array.isArray(part.parts)) {
    for (const child of part.parts) {
      const text = walkBody(child);
      if (text) return text;
    }
  }
  if (part.body?.data) return decodeBase64Url(part.body.data);
  return "";
}

function collectAttachments(part: any, output: MailAttachment[] = []): MailAttachment[] {
  if (!part) return output;
  if (part.filename && part.body?.attachmentId) {
    output.push({
      filename: String(part.filename),
      mimeType: String(part.mimeType || "application/octet-stream"),
      size: Number(part.body?.size || 0),
    });
  }
  if (Array.isArray(part.parts)) {
    for (const child of part.parts) collectAttachments(child, output);
  }
  return output;
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scopeHint(status: number, body: string): string | null {
  if (status === 401) return "Google rejected the access token. Re-authorize the refresh token.";
  if (status === 403 && /insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient permission/i.test(body)) {
    return "This token has no Gmail read scope. Re-authorize with https://www.googleapis.com/auth/gmail.readonly (or gmail.modify).";
  }
  return null;
}

async function authorized(): Promise<{ token?: string; error?: string }> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return { error: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN." };
  }
  return { token };
}

function toSummary(data: any): MailSummary {
  const payload = data?.payload || {};
  return {
    id: String(data?.id || ""),
    threadId: String(data?.threadId || ""),
    subject: header(payload, "Subject") || "(no subject)",
    from: header(payload, "From"),
    to: header(payload, "To"),
    date: header(payload, "Date"),
    snippet: String(data?.snippet || ""),
    unread: Array.isArray(data?.labelIds) && data.labelIds.includes("UNREAD"),
  };
}

function toFull(data: any): MailFull {
  const summary = toSummary(data);
  const payload = data?.payload || {};
  const raw = walkBody(payload);
  const body = /<\/?[a-z][\s\S]*>/i.test(raw) ? stripHtml(raw) : raw;
  return {
    ...summary,
    body: body.trim(),
    messageIdHeader: header(payload, "Message-ID"),
    references: header(payload, "References"),
    replyTo: replyAddress(summary.from),
    attachments: collectAttachments(payload),
  };
}

export function replyAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim();
}

export async function listMessages({
  query,
  count = 10,
}: {
  query?: string;
  count?: number;
}): Promise<MailListResult> {
  const { token, error } = await authorized();
  if (!token) return { ok: false, mode: "manual", detail: error || "Not configured.", messages: [] };

  const max = Math.min(Math.max(Math.round(count), 1), 20);
  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("maxResults", String(max));
  if (query && query.trim()) url.searchParams.set("q", query.trim());

  try {
    const res = await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, mode: "failed", detail: scopeHint(res.status, text) || `Gmail search failed (${res.status}).`, messages: [] };
    }

    const json: any = await res.json();
    const ids: string[] = Array.isArray(json?.messages) ? json.messages.map((item: any) => String(item.id)) : [];
    if (!ids.length) return { ok: true, mode: "direct", detail: "No messages matched.", messages: [] };

    const messages = await Promise.all(
      ids.map(async (id) => {
        const detail = await safeFetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (!detail.ok) return null;
        return toSummary(await detail.json());
      })
    );

    const clean = messages.filter((item): item is MailSummary => !!item);
    return { ok: true, mode: "direct", detail: `${clean.length} message(s).`, messages: clean };
  } catch (cause) {
    return { ok: false, mode: "failed", detail: `Gmail error: ${(cause as Error).message}`, messages: [] };
  }
}

export async function getMessage(id: string): Promise<MailResult> {
  const { token, error } = await authorized();
  if (!token) return { ok: false, mode: "manual", detail: error || "Not configured." };

  try {
    const res = await safeFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, mode: "failed", detail: scopeHint(res.status, text) || `Gmail read failed (${res.status}).` };
    }
    return { ok: true, mode: "direct", detail: "Message loaded.", message: toFull(await res.json()) };
  } catch (cause) {
    return { ok: false, mode: "failed", detail: `Gmail error: ${(cause as Error).message}` };
  }
}

export async function summarizeMessages(messages: MailSummary[]): Promise<SummaryResult> {
  if (!messages.length) return { ok: false, detail: "No messages to summarize." };

  const compact = messages
    .map((message) => `- ${message.from || "unknown"} | ${message.subject} | ${message.snippet}`)
    .join("\n");

  if (!groqConfigured()) {
    return { ok: true, detail: compact };
  }

  const text = await groqChat(
    "Summarize these emails in at most five bullets. Then list only the messages that need a reply. Be concrete.",
    compact,
    false
  );

  return text ? { ok: true, detail: text } : { ok: false, detail: "The summarizer returned nothing." };
}

export async function summarizeMessage(message: MailFull): Promise<SummaryResult> {
  if (!groqConfigured()) {
    return { ok: true, detail: `${message.subject} — ${message.snippet}` };
  }

  const text = await groqChat(
    "Summarize this email in at most three bullets, then state the one action it needs, if any. Do not invent facts.",
    [`FROM: ${message.from}`, `SUBJECT: ${message.subject}`, "", message.body.slice(0, 6000)].join("\n"),
    false
  );

  return text ? { ok: true, detail: text } : { ok: false, detail: "The summarizer returned nothing." };
}

export async function draftReply({
  message,
  instruction,
}: {
  message: MailFull;
  instruction?: string;
}): Promise<{ ok: boolean; detail: string; text: string }> {
  if (!groqConfigured()) {
    return { ok: false, detail: "Set GROQ_API_KEYS / GROQ_API_KEY to draft replies.", text: "" };
  }

  const style = await getStyleGuide();
  const prompt = [
    `FROM: ${message.from}`,
    `SUBJECT: ${message.subject}`,
    instruction ? `INSTRUCTION: ${instruction}` : "",
    "",
    "EMAIL:",
    message.body.slice(0, 6000),
  ]
    .filter(Boolean)
    .join("\n");

  const text = await groqChat(
    [
      "Write a reply to this email. Output only the reply body, with no subject line and no preamble.",
      "Keep it concise and concrete.",
      style ? `Match this writing style:\n${style}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    prompt,
    false
  );

  return text
    ? { ok: true, detail: "Reply drafted.", text }
    : { ok: false, detail: "The drafter returned nothing.", text: "" };
}
