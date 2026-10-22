"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { VoiceCapture, Schedule, Message, Task, ContentPost, Approval } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { evaluateExternalAction } from "@/lib/guardrails/policy";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getVoiceCaptures(limit = 40) {
  try {
    await connectDB();
    const docs = await VoiceCapture.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch (error) {
    console.error("Failed to load voice captures:", error);
    return [];
  }
}

export async function getVoiceCapture(id: string) {
  try {
    await connectDB();
    const doc = await VoiceCapture.findById(id);
    return doc ? plain(doc) : null;
  } catch {
    return null;
  }
}

export async function deleteVoiceCapture(id: string) {
  try {
    await connectDB();
    await VoiceCapture.findByIdAndDelete(id);
    revalidatePath("/voice");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function updateVoiceDraft(captureId: string, draftId: string, body: string, title?: string) {
  try {
    await connectDB();
    const capture = await VoiceCapture.findById(captureId);
    if (!capture) return { success: false };
    const draft = (capture.drafts as any).id(draftId);
    if (!draft) return { success: false };
    draft.body = body;
    if (typeof title === "string") draft.title = title;
    capture.updatedAt = new Date();
    await capture.save();
    revalidatePath("/voice");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteVoiceDraft(captureId: string, draftId: string) {
  try {
    await connectDB();
    const capture = await VoiceCapture.findById(captureId);
    if (!capture) return { success: false };
    (capture.drafts as any).pull({ _id: draftId });
    await capture.save();
    revalidatePath("/voice");
    return { success: true };
  } catch {
    return { success: false };
  }
}

// Send the capture's email draft to Gmail as a real draft (falls back to app-only).
export async function pushEmailDraft(captureId: string, draftId?: string) {
  try {
    await connectDB();
    const capture = await VoiceCapture.findById(captureId);
    if (!capture) return { success: false, detail: "Capture not found." };

    const drafts = capture.drafts as any;
    const draft = draftId ? drafts.id(draftId) : drafts.find((d: any) => d.kind === "email");
    if (!draft) return { success: false, detail: "No email draft on this capture." };

    const guard = await evaluateExternalAction({
      kind: "email",
      target: draft.title || "email draft",
      meta: { capture: String(capture._id) },
    });
    if (!guard.allowed) return { success: false, detail: guard.reason };

    await Approval.create({
      kind: "email",
      title: `Email draft: ${draft.title || "untitled"}`,
      detail: "Creates a Gmail draft. Nothing is sent.",
      payload: { subject: draft.title, body: draft.body },
      status: "pending",
    });
    revalidatePath("/approvals");
    return { success: true, mode: "approval", detail: "Queued for approval — open /approvals." };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

// Push every calendar block into Google Calendar, falling back to the local Schedule.
export async function lockSchedule(captureId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };

    const capture = await VoiceCapture.findById(captureId);
    if (!capture) return { success: false, detail: "Capture not found." };
    if (!capture.calendarBlocks?.length) return { success: false, detail: "No blocks to lock." };

    const guard = await evaluateExternalAction({
      kind: "calendar",
      target: String(capture.transcript || "").slice(0, 80) || "voice schedule",
      meta: { blocks: capture.calendarBlocks.length },
    });
    if (!guard.allowed) return { success: false, detail: guard.reason };

    await Approval.create({
      kind: "calendar",
      title: `Lock ${capture.calendarBlocks.length} time block(s)`,
      detail: (capture.calendarBlocks as any[]).map((block) => block.title).join(" · "),
      payload: {
        blocks: (capture.calendarBlocks as any[]).map((block) => ({
          title: block.title,
          start: block.start,
          end: block.end,
          notes: block.notes,
        })),
      },
      status: "pending",
    });
    revalidatePath("/approvals");
    return { success: true, detail: "Queued for approval — open /approvals." };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function createTasksFromCapture(captureId: string) {
  try {
    await connectDB();
    const capture = await VoiceCapture.findById(captureId);
    if (!capture || !capture.taskSuggestions?.length) return { success: false, detail: "No task suggestions." };

    for (const suggestion of capture.taskSuggestions as any) {
      await Task.create({ title: suggestion.title, scope: "daily", priority: suggestion.priority || "medium" });
    }
    revalidatePath("/planner/daily");
    revalidatePath("/voice");
    return { success: true, detail: `${capture.taskSuggestions.length} task(s) created.` };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

// Turn any AI draft into a Studio post so it can be distributed.
export async function promoteDraftToPost(captureId: string, draftId: string) {
  try {
    await connectDB();
    const capture = await VoiceCapture.findById(captureId);
    if (!capture) return { success: false, detail: "Capture not found." };
    const draft = (capture.drafts as any).id(draftId);
    if (!draft) return { success: false, detail: "Draft not found." };

    const post = await ContentPost.create({
      title: draft.title || "Voice draft",
      body: draft.body,
      source: "voice",
      voiceCaptureId: capture._id,
      tags: [draft.kind],
      status: "draft",
    });

    revalidatePath("/studio");
    return { success: true, postId: String(post._id), detail: "Sent to Studio." };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

// 7:20 AM digest: overnight messages + recent captures + today's blocks.
export async function getMorningDigest() {
  try {
    await connectDB();
    const since = new Date();
    since.setHours(0, 0, 0, 0);

    const [messages, captures, schedules] = await Promise.all([
      Message.find({ isRead: false }).sort({ timestamp: -1 }).limit(25).lean(),
      VoiceCapture.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20).lean(),
      Schedule.find({ start: { $gte: since, $lte: new Date(since.getTime() + 24 * 60 * 60 * 1000) } }).sort({ start: 1 }).lean(),
    ]);

    return {
      unreadMessages: messages.map((m: any) => ({
        name: m.senderName,
        contact: m.senderContact,
        preview: String(m.content || "").slice(0, 140),
        priority: m.priority,
        at: m.timestamp,
      })),
      overnightCaptures: captures.map((c: any) => ({
        id: String(c._id),
        summary: String(c.transcript || "").slice(0, 120),
        intent: c.intent,
        drafts: (c.drafts || []).length,
      })),
      todayBlocks: schedules.map((s: any) => ({ title: s.title, start: s.start, end: s.end })),
    };
  } catch (error) {
    console.error("Digest failed:", error);
    return { unreadMessages: [], overnightCaptures: [], todayBlocks: [] };
  }
}

// Real counters for the operations dashboard.
export async function getOpsCounts() {
  try {
    await connectDB();
    const [voiceCaptures, unreadMessages, posts, publishedPosts] = await Promise.all([
      VoiceCapture.countDocuments({}),
      Message.countDocuments({ isRead: false }),
      ContentPost.countDocuments({}),
      ContentPost.countDocuments({ status: "published" }),
    ]);
    return { voiceCaptures, unreadMessages, posts, publishedPosts };
  } catch {
    return { voiceCaptures: 0, unreadMessages: 0, posts: 0, publishedPosts: 0 };
  }
}
