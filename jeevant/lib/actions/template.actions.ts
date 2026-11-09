"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Template } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getTemplates() {
  try {
    await connectDB();
    const docs = await Template.find({}).sort({ usageCount: -1, createdAt: -1 });
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function createTemplateAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const name = String(formData.get("name") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!name || !body) return;

  const kind = String(formData.get("kind") || "other");

  await connectDB();
  await Template.create({
    name,
    kind: ["email", "linkedin", "whatsapp", "post", "reply", "meeting", "other"].includes(kind) ? kind : "other",
    body,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  revalidatePath("/templates");
}

export async function deleteTemplateAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  await connectDB();
  await Template.findByIdAndDelete(id);
  revalidatePath("/templates");
}

export async function logTemplateUseAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await connectDB();
  await Template.updateOne({ _id: id }, { $inc: { usageCount: 1 } });
  revalidatePath("/templates");
}
