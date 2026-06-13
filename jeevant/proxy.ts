import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // 1. List of protected zones
  const protectedPaths = [
    "/dashboard",
    "/cms",
    "/planner",
    "/brain",
    "/career",
    "/learning",
    "/arsenal",
  ];
  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

  if (isProtected) {
    // 2. Get the cookie
    const cookie = request.cookies.get("session")?.value;

    // 3. CRITICAL: Verify the encryption
    if (!cookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await decrypt(cookie);

    if (!session || session.role !== "admin") {
      // Cookie existed but was fake/tampered/expired — clear it
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cms/:path*",
    "/planner/:path*",
    "/brain/:path*",
    "/career/:path*",
    "/learning/:path*",
    "/arsenal/:path*",
  ],
};
