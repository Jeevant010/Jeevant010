"use server";

import connectDB from "@/lib/db";
import { Snippet } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

export async function addSnippet(formData: FormData) {
  await connectDB();
  await Snippet.create({
    title: formData.get("title"),
    language: formData.get("language"),
    code: formData.get("code"),
    tags: (formData.get("tags") as string).split(","),
  });
  revalidatePath("/arsenal");
}

export async function getSnippets() {
  await connectDB();
  const items = await Snippet.find({}).sort({ _id: -1 });
  return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
}