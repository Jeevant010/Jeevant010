"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Memory } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getMemories(limit = 50) {
  try {
    await connectDB();
    const docs = await Memory.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function addMemory(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false, detail: "Unauthorized." };
    await connectDB();
    const text = String(formData.get("text") || "").trim();
    if (!text) return { success: false, detail: "Memory text is required." };
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    await Memory.create({ text, tags, source: "manual" });
    revalidatePath("/assistant");
    return { success: true, detail: "Memory saved." };
  } catch (error) {
    return { success: false, detail: (error as Error).message };
  }
}

export async function addMemoryAction(formData: FormData): Promise<void> {
  await addMemory(formData);
}

export async function deleteMemoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await deleteMemory(id);
}

export async function deleteMemory(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { success: false };
    await connectDB();
    await Memory.findByIdAndDelete(id);
    revalidatePath("/assistant");
    return { success: true };
  } catch {
    return { success: false };
  }
}
