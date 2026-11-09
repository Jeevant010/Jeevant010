// Helpers for the mobile client API. The mobile app is not same-origin with the
// Next.js app, so it authenticates with a short bearer token instead of the
// httpOnly session cookie. CORS is restricted to known app origins.

import { NextRequest, NextResponse } from "next/server";
import { decrypt, getSession } from "@/lib/auth";

const DEFAULT_ORIGINS = [
  "https://jeevant.is-a.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "capacitor://localhost",
  "ionic://localhost",
  "https://localhost",
  "http://localhost",
];

function allowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const extra = String(process.env.MOBILE_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra].includes(origin) ? origin : null;
}

export function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = allowedOrigin(request);
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
  };
}

export function mobileJson(request: NextRequest, data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(data, { ...init, headers });
}

export function mobileOptions(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function requireMobileAuth(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";

  if (token) {
    const session = await decrypt(token);
    return session && session.role === "admin" ? session : null;
  }

  try {
    const session = await getSession();
    return session && session.role === "admin" ? session : null;
  } catch {
    return null;
  }
}

export function unauthorized(request: NextRequest) {
  return mobileJson(request, { error: "Unauthorized" }, { status: 401 });
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj?._id) }));
}
