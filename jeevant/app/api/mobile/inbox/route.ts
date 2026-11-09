import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval } from "@/lib/database/models";
import { draftReply, getMessage, listMessages, summarizeMessage, summarizeMessages } from "@/lib/integrations/gmail-read";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (id) {
    const message = await getMessage(id);
    if (!message.ok || !message.message) {
      return mobileJson(request, { error: message.detail }, { status: 400 });
    }
    const summary = request.nextUrl.searchParams.get("summary") === "1"
      ? await summarizeMessage(message.message)
      : null;
    return mobileJson(request, { message: message.message, summary });
  }

  const query = String(request.nextUrl.searchParams.get("query") || "in:inbox newer_than:14d");
  const count = Math.min(Math.max(Number(request.nextUrl.searchParams.get("count") || 12), 1), 25);
  const found = await listMessages({ query, count });
  if (!found.ok) {
    return mobileJson(request, { error: found.detail, messages: [] }, { status: 503 });
  }

  const digest = request.nextUrl.searchParams.get("digest") === "1"
    ? await summarizeMessages(found.messages)
    : null;

  return mobileJson(request, { messages: found.messages, detail: found.detail, digest });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  const instruction = String(body?.instruction || "").trim();
  if (!id) return mobileJson(request, { error: "A message id is required." }, { status: 400 });

  const message = await getMessage(id);
  if (!message.ok || !message.message) {
    return mobileJson(request, { error: message.detail }, { status: 400 });
  }

  const draft = await draftReply({ message: message.message, instruction });
  if (!draft.ok) return mobileJson(request, { error: draft.detail }, { status: 502 });

  const guard = await evaluateExternalAction({ kind: "email", target: message.message.replyTo });
  if (!guard.allowed) return mobileJson(request, { error: guard.reason }, { status: 403 });

  await connectDB();
  const approval = await Approval.create({
    kind: "email",
    title: `Reply to ${message.message.replyTo}`,
    detail: draft.text,
    payload: {
      to: message.message.replyTo,
      subject: `Re: ${message.message.subject}`,
      body: draft.text,
      threadId: message.message.threadId,
      inReplyTo: message.message.messageIdHeader,
      references: message.message.references,
    },
    status: "pending",
  });

  return mobileJson(request, {
    ok: true,
    approvalId: String(approval._id),
    detail: "Reply queued for approval. Nothing has been sent.",
  });
}
