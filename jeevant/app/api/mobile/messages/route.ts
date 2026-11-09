import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval, OutboundMessage } from "@/lib/database/models";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNELS = ["whatsapp", "sms", "call"];

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const messages = await OutboundMessage.find({}).sort({ createdAt: -1 }).limit(50);
  return mobileJson(request, { messages: messages.map(plain) });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const channel = String(body?.channel || "whatsapp");
  const to = String(body?.to || "").trim();
  const text = String(body?.body || "").trim();

  if (!CHANNELS.includes(channel)) {
    return mobileJson(request, { error: "Channel must be whatsapp, sms, or call." }, { status: 400 });
  }
  if (!to) return mobileJson(request, { error: "A recipient is required." }, { status: 400 });
  if (channel !== "call" && !text) {
    return mobileJson(request, { error: "A message body is required." }, { status: 400 });
  }

  const guard = await evaluateExternalAction({ kind: channel, target: to, meta: { via: "mobile" } });
  if (!guard.allowed) return mobileJson(request, { error: guard.reason }, { status: 403 });

  await connectDB();
  const approval = await Approval.create({
    kind: channel,
    title: `${channel === "call" ? "Call" : channel === "sms" ? "SMS" : "WhatsApp"}: ${to}`,
    detail: text || "Outbound call",
    payload: { to, body: text },
    status: "pending",
  });

  return mobileJson(request, {
    ok: true,
    approvalId: String(approval._id),
    detail: "Queued for approval — nothing has been sent.",
  });
}
