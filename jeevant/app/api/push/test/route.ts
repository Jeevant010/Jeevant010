import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pushConfigured, sendToAll } from "@/lib/push/webpush";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  if (!pushConfigured()) {
    return NextResponse.json(
      { error: "VAPID keys are not configured. Run npx web-push generate-vapid-keys." },
      { status: 503, headers: NO_STORE }
    );
  }

  const result = await sendToAll({
    title: "Jeevant OS",
    body: "Push is wired. This is a test notification.",
    url: "/assistant",
    tag: "test",
  });

  return NextResponse.json(result, { headers: NO_STORE });
}
