"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { ContentPost } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { getRuntimeConfig } from "@/lib/integrations/config";
import { dispatchToChannel, buildShareUrl } from "@/lib/integrations/channels";
import type { ChannelId } from "@/lib/integrations/types";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  return String(raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function getPosts(limit = 60) {
  try {
    await connectDB();
    const docs = await ContentPost.find({}).sort({ updatedAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch (error) {
    console.error("Failed to load posts:", error);
    return [];
  }
}

export async function createPost(formData: FormData) {
  try {
    await connectDB();
    const body = String(formData.get("body") || "").trim();
    if (!body) return { success: false, detail: "Post body is required." };

    const scheduledRaw = formData.get("scheduledAt");
    const scheduledAt = scheduledRaw ? new Date(String(scheduledRaw)) : undefined;
    const isFuture = scheduledAt && scheduledAt.getTime() > Date.now();

    const doc = await ContentPost.create({
      title: String(formData.get("title") || ""),
      body,
      summary: String(formData.get("summary") || ""),
      tags: parseTags(formData.get("tags")),
      channels: formData.getAll("channels").map(String),
      source: "manual",
      status: isFuture ? "queued" : "draft",
      scheduledAt: isFuture ? scheduledAt : undefined,
    });
    revalidatePath("/studio");
    return { success: true, postId: String(doc._id) };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function updatePost(id: string, formData: FormData) {
  try {
    await connectDB();
    await ContentPost.findByIdAndUpdate(id, {
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || ""),
      summary: String(formData.get("summary") || ""),
      tags: parseTags(formData.get("tags")),
      channels: formData.getAll("channels").map(String),
      scheduledAt: formData.get("scheduledAt") ? new Date(String(formData.get("scheduledAt"))) : undefined,
      updatedAt: new Date(),
    });
    revalidatePath("/studio");
    return { success: true };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function deletePost(id: string) {
  try {
    await connectDB();
    await ContentPost.findByIdAndDelete(id);
    revalidatePath("/studio");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function duplicatePost(id: string) {
  try {
    await connectDB();
    const original = await ContentPost.findById(id).lean();
    if (!original) return { success: false };
    const { _id, createdAt, updatedAt, ...rest } = original as any;
    await ContentPost.create({ ...rest, status: "draft", dispatch: [], publishedAt: undefined });
    revalidatePath("/studio");
    return { success: true };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function setPostStatus(id: string, status: string) {
  try {
    await connectDB();
    await ContentPost.findByIdAndUpdate(id, { status, updatedAt: new Date() });
    revalidatePath("/studio");
    return { success: true };
  } catch {
    return { success: false };
  }
}

// Core dispatcher (no auth check) — used by both the UI action and the cron job.
async function runDispatch(post: any, channels?: string[]) {
  const targets = (channels?.length ? channels : (post.channels as string[])) as ChannelId[];
  if (!targets.length) return { success: false, detail: "No channels selected." };

  const cfg = await getRuntimeConfig();
  const payload = { title: post.title, body: post.body, tags: post.tags as string[], source: post.source };
  const outcomes = [];

  for (const channel of targets) {
    const outcome = await dispatchToChannel(channel, payload, cfg, { to: cfg.gmailSender });
    (post.dispatch as any).push({
      channel: outcome.channel,
      ok: outcome.ok,
      mode: outcome.mode,
      url: outcome.url || "",
      detail: outcome.detail || "",
      at: new Date(),
    });
    outcomes.push(outcome);
  }

  const anyOk = outcomes.some((o) => o.ok);
  post.status = anyOk ? "published" : "failed";
  post.publishedAt = anyOk ? new Date() : undefined;
  post.channels = targets;
  post.updatedAt = new Date();
  await post.save();

  return { success: anyOk, outcomes: JSON.parse(JSON.stringify(outcomes)) };
}

// Fan a post out to the selected channels and record what happened.
export async function dispatchPost(id: string, channels?: string[]) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };

    await connectDB();
    const post = await ContentPost.findById(id);
    if (!post) return { success: false, detail: "Post not found." };

    const result = await runDispatch(post, channels);
    revalidatePath("/studio");
    return result;
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

// Called by the cron endpoint: publish every queued post whose time has come.
export async function dispatchDuePosts() {
  try {
    await connectDB();
    const due = await ContentPost.find({ status: "queued", scheduledAt: { $lte: new Date() } });
    const results: any[] = [];
    for (const post of due) {
      results.push({ id: String(post._id), ...(await runDispatch(post)) });
    }
    if (results.length) revalidatePath("/studio");
    return { count: results.length, results };
  } catch (error) {
    return { count: 0, results: [], detail: (error as Error).message };
  }
}

// Preview share links without dispatching.
export async function getShareLinks(id: string) {
  try {
    await connectDB();
    const post = await ContentPost.findById(id);
    if (!post) return [];
    const cfg = await getRuntimeConfig();
    const payload = { title: post.title, body: post.body, tags: post.tags as string[], source: post.source };
    return (post.channels as ChannelId[]).map((channel) => ({
      channel,
      url: buildShareUrl(channel, payload, cfg) || "",
    }));
  } catch {
    return [];
  }
}
