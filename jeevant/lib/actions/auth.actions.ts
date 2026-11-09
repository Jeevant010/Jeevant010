"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { encrypt } from "@/lib/auth";
import { rateLimitDistributed } from "@/lib/security/rate-limit";

function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  const SECRET = process.env.ADMIN_SECRET;

  if (!SECRET) {
    return { error: "ACCESS_DENIED // SERVER_KEY_NOT_CONFIGURED" };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  const limited = await rateLimitDistributed(`login:${ip}`, 10, 10 * 60_000);
  if (!limited.ok) {
    return { error: "ACCESS_DENIED // TOO_MANY_ATTEMPTS" };
  }

  if (safeEqual(password, SECRET)) {
    // 1. Create the encrypted session
    // We store the 'role' inside the encrypted seal
    let token: string;
    try {
      token = await encrypt({ role: "admin", valid: true });
    } catch {
      return { error: "ACCESS_DENIED // SERVER_KEY_MISCONFIGURED" };
    }
    
    // 2. Save the encrypted token as a cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } else {
    return { error: "ACCESS_DENIED // INVALID_KEY_DETECTED" };
  }
  
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}