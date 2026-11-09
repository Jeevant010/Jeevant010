import { NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { encrypt } from "@/lib/auth";
import { rateLimitDistributed } from "@/lib/security/rate-limit";
import { clientIp, mobileJson, mobileOptions } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return mobileJson(request, { error: "Server key is not configured." }, { status: 500 });
  }

  const limited = await rateLimitDistributed(`mobile-login:${clientIp(request)}`, 10, 10 * 60_000);
  if (!limited.ok) {
    return mobileJson(
      request,
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const password = String(body?.secret || "");
  if (!safeEqual(password, secret)) {
    return mobileJson(request, { error: "Invalid secret." }, { status: 401 });
  }

  const token = await encrypt({ role: "admin", valid: true, device: "mobile" });
  return mobileJson(request, { token });
}
