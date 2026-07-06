"use server";

import connectDB from "@/lib/db";
import { Snippet } from "@/lib/database/models";
import { revalidatePath } from "next/cache";
import { updateBulkOrder } from "./reorder.actions";
export async function addSnippet(formData: FormData) {
  await connectDB();
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const dependenciesRaw = formData.get("dependencies") as string;
  const dependencies = dependenciesRaw ? dependenciesRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const relatedSnippetsRaw = formData.get("relatedSnippets") as string;
  const relatedSnippets = relatedSnippetsRaw ? relatedSnippetsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  await Snippet.create({
    title: formData.get("title"),
    language: formData.get("language"),
    code: formData.get("code"),
    tags,
    description: formData.get("description"),
    useCase: formData.get("useCase"),
    complexity: formData.get("complexity") || "medium",
    author: formData.get("author"),
    lastTestedVersion: formData.get("lastTestedVersion"),
    performanceNotes: formData.get("performanceNotes"),
    securityNotes: formData.get("securityNotes"),
    isDeprecated: formData.get("isDeprecated") === "on",
    dependencies,
    relatedSnippets
  });
  revalidatePath("/arsenal");
}

export async function getSnippets() {
  await connectDB();
  const items = await Snippet.find({}).sort({ _id: -1 });
  return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
}

export async function deleteSnippet(id: string) {
  await connectDB();
  await Snippet.findByIdAndDelete(id);
  revalidatePath("/arsenal");
}

export async function updateSnippet(formData: FormData) {
  await connectDB();
  const id = formData.get("id") as string;

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const dependenciesRaw = formData.get("dependencies") as string;
  const dependencies = dependenciesRaw ? dependenciesRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const relatedSnippetsRaw = formData.get("relatedSnippets") as string;
  const relatedSnippets = relatedSnippetsRaw ? relatedSnippetsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  await Snippet.findByIdAndUpdate(id, {
    title: formData.get("title"),
    language: formData.get("language"),
    code: formData.get("code"),
    tags,
    description: formData.get("description"),
    useCase: formData.get("useCase"),
    complexity: formData.get("complexity") || "medium",
    author: formData.get("author"),
    lastTestedVersion: formData.get("lastTestedVersion"),
    performanceNotes: formData.get("performanceNotes"),
    securityNotes: formData.get("securityNotes"),
    isDeprecated: formData.get("isDeprecated") === "on",
    dependencies,
    relatedSnippets
  });
  revalidatePath("/arsenal");
}

export async function updateSnippetOrder(ids: string[]) {
  const updates = ids.map((id, index) => ({ id, order: index }));
  await updateBulkOrder("Snippet", updates, ["/arsenal"]);
}