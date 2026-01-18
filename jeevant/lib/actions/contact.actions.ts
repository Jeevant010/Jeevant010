"use server";

import connectDB from "@/lib/db";
import { Message } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  await connectDB();
  
  await Message.create({
    senderName: formData.get("senderName"),
    senderContact: formData.get("senderContact"),
    content: formData.get("content"),
    priority: formData.get("priority") || "low",
  });
  
  return { success: true };
}

export async function getMessages() {
  await connectDB();
  const msgs = await Message.find({}).sort({ timestamp: -1 });
  return msgs.map((m: any) => ({ ...m.toObject(), _id: m._id.toString() }));
}