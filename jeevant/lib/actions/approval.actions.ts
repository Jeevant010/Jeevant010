"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Approval, Schedule, OutboundMessage } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { saveDraft } from "@/lib/integrations/gmail";
import { createEvent } from "@/lib/integrations/calendar";
import { executePostDispatch } from "@/lib/actions/content.actions";
import { sendByChannel } from "@/lib/integrations/messaging";
import { resolveAccount } from "@/lib/integrations/accounts";
import { audit, evaluateExternalAction } from "@/lib/guardrails/policy";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getApprovals(limit = 50) {
  try {
    await connectDB();
    const docs = await Approval.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function createApproval(kind: string, title: string, detail?: string, payload?: unknown) {
  await connectDB();
  const doc = await Approval.create({
    kind,
    title,
    detail: detail || "",
    payload: payload || {},
    status: "pending",
  });
  return String(doc._id);
}

export async function approveApprovalAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await decideApproval(id, "approved");
}

export async function rejectApprovalAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await decideApproval(id, "rejected");
}

export async function decideApproval(id: string, decision: "approved" | "rejected") {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };

    await connectDB();
    const approval = await Approval.findById(id);
    if (!approval || approval.status !== "pending") return { success: false, detail: "Already decided." };

    if (decision === "rejected") {
      approval.status = "rejected";
      approval.decidedAt = new Date();
      approval.result = "Rejected by operator.";
      await approval.save();
      revalidatePath("/approvals");
      return { success: true, detail: "Rejected." };
    }

    approval.status = "approved";
    const payload: any = approval.payload || {};

    // Defense in depth: the emergency stop must also block execution of an
    // approval that was queued before the policy changed.
    const gate = await evaluateExternalAction({
      kind: approval.kind,
      target: String(payload.to || payload.url || payload.postId || approval.title),
    });
    if (!gate.allowed) {
      approval.status = "failed";
      approval.result = gate.reason;
      approval.decidedAt = new Date();
      await approval.save();
      revalidatePath("/approvals");
      return { success: false, detail: gate.reason };
    }

    let result = "Approved.";

    try {
      if (approval.kind === "post" && payload.postId) {
        const outcome: any = await executePostDispatch(String(payload.postId), payload.channels);
        result = outcome?.detail || (outcome?.success ? "Post dispatched." : "Post dispatch failed.");
        if (!outcome?.success) approval.status = "failed";
      } else if (approval.kind === "email") {
        const draft = await saveDraft({
          to: payload.to,
          subject: payload.subject,
          body: payload.body || "",
        });
        result = draft.detail;
        if (!draft.ok && draft.mode === "failed") approval.status = "failed";
      } else if (approval.kind === "calendar") {
        const blocks: any[] = Array.isArray(payload.blocks)
          ? payload.blocks
          : [{ title: approval.title, start: payload.start, end: payload.end, notes: payload.notes }];

        const notes: string[] = [];
        for (const block of blocks) {
          const start = block.start ? new Date(block.start) : new Date();
          const end = block.end ? new Date(block.end) : new Date(start.getTime() + 60 * 60 * 1000);
          const event = await createEvent({
            title: block.title || approval.title,
            start: start.toISOString(),
            end: end.toISOString(),
            notes: block.notes,
          });
          if (!event.ok) {
            await Schedule.create({
              title: block.title || approval.title,
              start,
              end,
              notes: block.notes,
              visibility: "private",
              status: "scheduled",
            });
          }
          notes.push(`${block.title || approval.title}: ${event.ok ? "Google Calendar" : "local schedule"}`);
        }
        result = notes.join(" · ");
      } else if (["whatsapp", "sms", "call"].includes(approval.kind)) {
        const channel = approval.kind;
        const to = String(payload.to || "");
        const body = String(payload.body || "");
        const account = await resolveAccount(channel, payload.accountId);
        const outcome = await sendByChannel(channel, to, body, account);
        await OutboundMessage.create({
          channel,
          to,
          body,
          status: outcome.ok ? "sent" : "failed",
          mode: outcome.mode,
          provider: outcome.provider || "",
          detail: outcome.detail,
        });
        result = outcome.url ? `${outcome.detail} ${outcome.url}` : outcome.detail;
        if (!outcome.ok) approval.status = "failed";
      } else if (approval.kind === "http") {
        const url = String(payload.url || "");
        const guard = await evaluateExternalAction({ kind: "http", target: url });
        if (!guard.allowed) {
          approval.status = "failed";
          result = guard.reason;
        } else {
          try {
            const res = await fetch(url, {
              method: String(payload.method || "POST"),
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify(payload.body || {}),
            });
            result = `HTTP ${res.status} ${url}`;
            if (!res.ok) approval.status = "failed";
            await audit({ kind: "http", target: url }, res.ok ? "executed" : "failed", result);
          } catch (error) {
            approval.status = "failed";
            result = (error as Error).message;
            await audit({ kind: "http", target: url }, "failed", result);
          }
        }
      }

      if (approval.status !== "failed") approval.status = "executed";
    } catch (error) {
      approval.status = "failed";
      result = (error as Error).message;
    }

    approval.result = result;
    approval.decidedAt = new Date();
    await approval.save();
    await audit(
      { kind: approval.kind, target: approval.title },
      approval.status === "failed" ? "failed" : "executed",
      result
    );
    revalidatePath("/approvals");
    revalidatePath("/studio");
    return { success: approval.status !== "failed", detail: result };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}
