// Read a public web page as text, optionally summarized. This is read-only and
// deliberately blocks localhost/private/link-local hosts to avoid SSRF.

import { safeFetch } from "@/lib/http/fetch";
import { groqChat, groqConfigured } from "@/lib/integrations/groq";

const MAX_BYTES = 2_000_000;
const MAX_TEXT = 12_000;

const PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|::1$|\[::1\]$)/i;

export function isPrivateHost(hostname: string): boolean {
  const host = String(hostname || "").toLowerCase();
  if (!host) return true;
  if (PRIVATE_HOST.test(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  const match = host.match(/^172\.(\d{1,3})\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function htmlToText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "";

  const text = html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x?[0-9a-f]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

  return { title, text };
}

export async function readUrl(args: { url?: unknown; summarize?: unknown }): Promise<{
  ok: boolean;
  result: string;
  data?: { title: string; url: string; chars: number; summary: boolean };
}> {
  let url: URL;
  try {
    url = new URL(String(args?.url || "").trim());
  } catch {
    return { ok: false, result: "That URL could not be parsed." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, result: "Only http(s) URLs are supported." };
  }
  if (isPrivateHost(url.hostname)) {
    return { ok: false, result: "Private/local hosts are blocked. Use http_request with an approved connector for internal URLs." };
  }

  try {
    const res = await safeFetch(
      url.toString(),
      {
        headers: {
          "User-Agent": "Jeevant/0.9 (+personal assistant; read-only)",
          Accept: "text/html, text/plain, application/json;q=0.9, */*;q=0.5",
        },
        cache: "no-store",
        redirect: "follow",
      },
      { timeoutMs: 20_000 }
    );
    if (!res.ok) return { ok: false, result: `Page returned HTTP ${res.status}.` };

    const finalUrl = new URL(res.url || url.toString());
    if (isPrivateHost(finalUrl.hostname)) {
      return { ok: false, result: "The page redirected to a private/local host, so it was blocked." };
    }

    const length = Number(res.headers.get("content-length") || 0);
    if (length > MAX_BYTES) return { ok: false, result: "That page is too large (2MB limit)." };

    const contentType = String(res.headers.get("content-type") || "").toLowerCase();
    if (contentType && !/text\/|json|xml|html/.test(contentType)) {
      return { ok: false, result: `Unsupported content type: ${contentType.slice(0, 80)}.` };
    }

    const raw = (await res.text()).slice(0, MAX_BYTES);
    const isHtml = /html|xml/.test(contentType) || /<html|<body|<p[\s>]/i.test(raw.slice(0, 2000));
    const parsed = isHtml ? htmlToText(raw) : { title: "", text: raw.replace(/\s+/g, " ").trim() };
    const text = parsed.text.slice(0, MAX_TEXT);
    if (!text) return { ok: false, result: "The page had no readable text." };

    if (args?.summarize === true) {
      if (!groqConfigured()) {
        return {
          ok: true,
          result: `${parsed.title ? `${parsed.title}\n\n` : ""}${text.slice(0, 4000)}`,
          data: { title: parsed.title, url: finalUrl.toString(), chars: text.length, summary: false },
        };
      }
      const summary = await groqChat(
        [
          "You summarize web pages for a personal assistant.",
          "Answer with 5 concise bullets. Keep names, numbers, dates, and any action the user may need.",
          "No preamble, no markdown headings.",
        ].join("\n"),
        `URL: ${finalUrl.toString()}\nTITLE: ${parsed.title || "(none)"}\n\nPAGE TEXT:\n${text}`,
        false,
        { maxTokens: 700 }
      );
      return {
        ok: true,
        result: `${parsed.title ? `${parsed.title}\n\n` : ""}${summary || text.slice(0, 4000)}`,
        data: { title: parsed.title, url: finalUrl.toString(), chars: text.length, summary: !!summary },
      };
    }

    return {
      ok: true,
      result: `${parsed.title ? `${parsed.title}\n\n` : ""}${text}`,
      data: { title: parsed.title, url: finalUrl.toString(), chars: text.length, summary: false },
    };
  } catch (error) {
    return { ok: false, result: (error as Error).message };
  }
}
