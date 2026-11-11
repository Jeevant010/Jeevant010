// Small HTTP helpers for connectors. Credentials are resolved server-side and
// attached here; they never enter the model prompt or an approval payload.

import { safeFetch } from "@/lib/http/fetch";
import type { ConnectorAuth } from "./types";

export function authHeaders(auth?: ConnectorAuth): Record<string, string> {
  if (!auth || auth.type === "none" || !auth.token) return {};
  if (auth.type === "bearer") return { Authorization: `Bearer ${auth.token}` };
  const header = String(auth.header || "X-API-Key").trim();
  if (!/^[A-Za-z0-9-]+$/.test(header)) throw new Error("Invalid auth header name.");
  return { [header]: auth.token };
}

export function assertHttpUrl(value: string): URL {
  const url = new URL(String(value || "").trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http(s) URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error("Do not put credentials in the URL. Use the auth fields.");
  }
  return url;
}

export async function connectorFetch(
  url: string,
  init: RequestInit,
  auth?: ConnectorAuth,
  timeoutMs = 20_000
): Promise<Response> {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(authHeaders(auth))) headers.set(key, value);
  return safeFetch(url, { ...init, headers, cache: "no-store" }, { timeoutMs });
}

export function safeHeaderEntries(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const blocked = new Set(["authorization", "cookie", "host", "content-length", "connection"]);
  const headers: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const name = String(key).trim();
    if (!name || blocked.has(name.toLowerCase())) continue;
    if (typeof entry !== "string" && typeof entry !== "number") continue;
    headers[name] = String(entry).slice(0, 2000);
  }
  return headers;
}
