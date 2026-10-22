"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import connectDB from "@/lib/db";
import { Workflow, WorkflowRun } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { TEMPLATES } from "@/lib/automation/templates";
import { runWorkflow } from "@/lib/automation/run";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getWorkflows() {
  try {
    await connectDB();
    const docs = await Workflow.find({}).sort({ updatedAt: -1 });
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function getRecentRuns(limit = 20) {
  try {
    await connectDB();
    const docs = await WorkflowRun.find({}).sort({ startedAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function createWorkflowAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const templateKey = String(formData.get("template") || "");
  const template = TEMPLATES.find((item) => item.key === templateKey);
  if (!template) return;

  const rawTrigger = String(formData.get("trigger") || "manual");
  const trigger = rawTrigger === "schedule" || rawTrigger === "webhook" ? rawTrigger : "manual";
  const intervalMinutes = Math.max(0, Number(formData.get("intervalMinutes") || 0) || 0);

  await connectDB();
  await Workflow.create({
    name: String(formData.get("name") || template.name),
    description: template.description,
    enabled: true,
    trigger,
    intervalMinutes: trigger === "schedule" ? intervalMinutes || 60 : 0,
    webhookKey: randomBytes(12).toString("hex"),
    steps: template.steps,
  });

  revalidatePath("/automations");
}

export async function runWorkflowAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (id) await runWorkflow(id);
  revalidatePath("/automations");
}

export async function toggleWorkflowAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await connectDB();
  const workflow = await Workflow.findById(id);
  if (!workflow) return;
  await Workflow.updateOne(
    { _id: workflow._id },
    { $set: { enabled: !workflow.enabled, updatedAt: new Date() } }
  );
  revalidatePath("/automations");
}

export async function deleteWorkflowAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await connectDB();
  await Workflow.findByIdAndDelete(id);
  revalidatePath("/automations");
}
