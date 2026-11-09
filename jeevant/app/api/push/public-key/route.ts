import { NextResponse } from "next/server";
import { publicKey, pushConfigured } from "@/lib/push/webpush";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { key: publicKey(), configured: pushConfigured() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
