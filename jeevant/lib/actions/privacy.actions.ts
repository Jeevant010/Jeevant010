"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  Achievement,
  ActionToken,
  Activity,
  Application,
  Approval,
  AuditLog,
  Certificate,
  ChannelAccount,
  ChatMessage,
  Contact,
  ContentPost,
  Experience,
  FocusSession,
  Job,
  Learning,
  Memory,
  Message,
  Note,
  OutboundMessage,
  Profile,
  Project,
  Resume,
  Schedule,
  Snippet,
  StyleProfile,
  Task,
  Template,
  VoiceCapture,
  Workflow,
  WorkflowRun,
} from "@/lib/database/models";

const ACTIVITY_MODELS: any[] = [
  ChatMessage,
  AuditLog,
  Activity,
  FocusSession,
  Job,
  ActionToken,
  Approval,
  OutboundMessage,
  Memory,
];

const CONTENT_MODELS: any[] = [
  Task,
  Note,
  Project,
  Learning,
  Experience,
  Achievement,
  Certificate,
  Schedule,
  Application,
  Message,
  Snippet,
  Profile,
  Resume,
  VoiceCapture,
  ContentPost,
  Workflow,
  WorkflowRun,
  Contact,
  StyleProfile,
  Template,
  ChannelAccount,
];

async function wipe(models: any[]): Promise<void> {
  await Promise.all(models.map((model) => model.deleteMany({})));
}

export async function deleteActivityDataAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const confirm = String(formData.get("confirm") || "").trim();
  if (confirm !== "DELETE ACTIVITY") redirect("/privacy?error=activity");

  await connectDB();
  await wipe(ACTIVITY_MODELS);

  revalidatePath("/privacy");
  revalidatePath("/approvals");
  revalidatePath("/guardrails");
  revalidatePath("/tracker");
  redirect("/privacy?deleted=activity");
}

export async function deleteEverythingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const confirm = String(formData.get("confirm") || "").trim();
  if (confirm !== "DELETE ALL") redirect("/privacy?error=all");

  await connectDB();
  await wipe([...ACTIVITY_MODELS, ...CONTENT_MODELS]);

  revalidatePath("/");
  revalidatePath("/privacy");
  revalidatePath("/dashboard");
  revalidatePath("/approvals");
  revalidatePath("/guardrails");
  redirect("/privacy?deleted=all");
}
