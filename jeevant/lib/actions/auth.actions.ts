"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encrypt } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  const SECRET = process.env.ADMIN_SECRET;

  if (password === SECRET) {
    // 1. Create the encrypted session
    // We store the 'role' inside the encrypted seal
    const token = await encrypt({ role: "admin", valid: true });
    
    // 2. Save the encrypted token as a cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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