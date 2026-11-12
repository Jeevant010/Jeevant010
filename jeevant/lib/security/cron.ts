// Cron authentication. Fail closed in production: if CRON_SECRET is missing,
// scheduled endpoints refuse to run instead of being anonymously callable.
// Secrets are compared in constant time and are not accepted in query strings.

import { createHash, timingSafeEqual } from "node:crypto";

export type CronAuth = { ok: true } | { ok: false; status: number; error: string };

export function cronAuth(request: Request): CronAuth {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) {
    const production = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    return production
      ? { ok: false, status: 503, error: "CRON_SECRET is not configured on the server." }
      : { ok: true };
  }

  const header = request.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const provided = bearer || String(request.headers.get("x-cron-secret") || "").trim();
  if (!provided) return { ok: false, status: 401, error: "Unauthorized" };

  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(secret).digest();
  return timingSafeEqual(left, right) ? { ok: true } : { ok: false, status: 401, error: "Unauthorized" };
}
