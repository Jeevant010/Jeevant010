"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Approval, OutboundMessage } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { sendByChannel } from "@/lib/integrations/messaging";
import { resolveAccount } from "@/lib/integrations/accounts";
import { evaluateExternalAction } from "@/lib/guardrails/policy";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getOutboundMessages(limit = 30) {
  try {
    await connectDB();
    const docs = await OutboundMessage.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function sendMessage(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };

    const channel = String(formData.get("channel") || "whatsapp");
    const to = String(formData.get("to") || "").trim();
    const body = String(formData.get("body") || "").trim();

    if (!["whatsapp", "sms", "call"].includes(channel)) {
      return { success: false, detail: "Unknown channel." };
    }
    if (!to) return { success: false, detail: "A recipient is required." };
    if (channel !== "call" && !body) return { success: false, detail: "A message is required." };

    await connectDB();

    const guard = await evaluateExternalAction({
      kind: channel,
      target: to,
      meta: { body: body.slice(0, 200) },
    });
    if (!guard.allowed) return { success: false, detail: guard.reason };

    await Approval.create({
      kind: channel,
      title: `${channel === "call" ? "Call" : channel === "sms" ? "SMS" : "WhatsApp"}: ${to}`,
      detail: body || "Outbound call",
      payload: { to, body },
      status: "pending",
    });
    revalidatePath("/approvals");
    revalidatePath("/messages");
    return { success: true, detail: "Queued for approval — open /approvals.", mode: "approval" };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}
