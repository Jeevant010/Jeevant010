"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Contact } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

function plain(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify({ ...obj, _id: String(obj._id) }));
}

export async function getContacts() {
  try {
    await connectDB();
    const docs = await Contact.find({}).sort({ name: 1 });
    return docs.map(plain);
  } catch {
    return [];
  }
}

export async function createContactAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await connectDB();
  await Contact.create({
    name,
    phone: String(formData.get("phone") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim(),
    linkedin: String(formData.get("linkedin") || "").trim(),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  revalidatePath("/contacts");
}

export async function deleteContactAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  await connectDB();
  await Contact.findByIdAndDelete(id);
  revalidatePath("/contacts");
}
