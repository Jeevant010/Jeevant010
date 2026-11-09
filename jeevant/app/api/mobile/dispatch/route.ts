import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval, ContentPost } from "@/lib/database/models";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNELS = [
  "linkedin",
  "twitter",
  "whatsapp",
  "telegram",
  "discord",
  "slack",
  "mastodon",
  "instagram",
];

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const postId = String(body?.postId || "").trim();
  if (!postId) return mobileJson(request, { error: "A post id is required." }, { status: 400 });

  const channels = (Array.isArray(body?.channels) ? body.channels : [])
    .map(String)
    .filter((channel: string) => CHANNELS.includes(channel));
  if (!channels.length) {
    return mobileJson(request, { error: "Pick at least one valid channel." }, { status: 400 });
  }

  await connectDB();
  const post = await ContentPost.findById(postId);
  if (!post) return mobileJson(request, { error: "Post not found." }, { status: 404 });

  const guard = await evaluateExternalAction({
    kind: "post",
    target: post.title || String(post._id),
    meta: { channels, via: "mobile" },
  });
  if (!guard.allowed) return mobileJson(request, { error: guard.reason }, { status: 403 });

  const approval = await Approval.create({
    kind: "post",
    title: `Publish: ${post.title || "mobile draft"}`,
    detail: `Channels: ${channels.join(", ")}`,
    payload: { postId: String(post._id), channels },
    status: "pending",
  });

  return mobileJson(request, {
    ok: true,
    approvalId: String(approval._id),
    detail: `Queued for approval on ${channels.join(", ")}. Nothing has been posted.`,
  });
}
