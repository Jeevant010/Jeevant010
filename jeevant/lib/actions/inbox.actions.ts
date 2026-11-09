"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { Approval } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { draftReply, getMessage } from "@/lib/integrations/gmail-read";
import { evaluateExternalAction } from "@/lib/guardrails/policy";

export async function queueReplyAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const id = String(formData.get("id") || "");
  const instruction = String(formData.get("instruction") || "").trim();
  if (!id) return;

  const message = await getMessage(id);
  if (!message.ok || !message.message) return;

  const draft = await draftReply({ message: message.message, instruction });
  if (!draft.ok) return;

  const guard = await evaluateExternalAction({ kind: "email", target: message.message.replyTo });
  if (!guard.allowed) return;

  await connectDB();
  await Approval.create({
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

  revalidatePath("/inbox");
  revalidatePath("/approvals");
  redirect("/approvals");
}
