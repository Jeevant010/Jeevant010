"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Setting, AuditLog } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { getGuardrailSettings } from "@/lib/guardrails/policy";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getGuardrailOverview() {
  const settings = await getGuardrailSettings();
  let logs: any[] = [];
  try {
    await connectDB();
    const docs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(30);
    logs = docs.map(plain);
  } catch {
    logs = [];
  }
  return { settings, logs };
}

export async function saveGuardrailsAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const mode = String(formData.get("mode") || "approval") === "blocked" ? "blocked" : "approval";
  const httpAllowlist = String(formData.get("httpAllowlist") || "").trim();

  await connectDB();
  await Setting.findOneAndUpdate(
    { key: "guardrailMode" },
    { key: "guardrailMode", value: mode, updatedAt: new Date() },
    { upsert: true }
  );
  await Setting.findOneAndUpdate(
    { key: "httpAllowlist" },
    { key: "httpAllowlist", value: httpAllowlist, updatedAt: new Date() },
    { upsert: true }
  );

  revalidatePath("/guardrails");
}
