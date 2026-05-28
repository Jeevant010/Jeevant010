"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Note } from "@/lib/database/models";

// 1. FETCH THE EVIDENCE (Notes)
export async function getNotes(searchQuery: string = "") {
  try {
    await connectDB();
    const query = searchQuery
      ? {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { content: { $regex: searchQuery, $options: "i" } },
            { tags: { $regex: searchQuery, $options: "i" } }
          ],
        }
      : {};

    const notes = await Note.find(query).sort({ updatedAt: -1 });

    return notes.map((n: any) => ({
      ...n.toObject(),
      _id: n._id.toString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function getPublicNotes() {
  try {
    await connectDB();
    const notes = await Note.find({ visibility: "public" }).sort({ updatedAt: -1 });
    return notes.map((n: any) => ({
      ...n.toObject(),
      _id: n._id.toString(),
    }));
  } catch (error) {
    return [];
  }
}

// 2. LOG NEW CLUE (Create Note)
export async function createNote(formData: FormData): Promise<void> {
  try {
    await connectDB();
    const title = formData.get("title");
    const content = formData.get("content");
    const visibility = String(formData.get("visibility") || "private");
    const rawTags = formData.get("tags");
    const tags =
      typeof rawTags === "string" && rawTags.trim().length > 0
        ? rawTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    await Note.create({ title, content, tags, visibility, isPinned: false });

    revalidatePath("/brain");
    revalidatePath("/research");
    revalidatePath("/library");
  } catch (error) {
    console.error("Failed to create note:", error);
  }
}

// 3. ARCHIVE EVIDENCE (Delete)
export async function deleteNote(id: string) {
  try {
    await connectDB();
    await Note.findByIdAndDelete(id);
    revalidatePath("/brain");
    revalidatePath("/research");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. UPDATE NOTE
export async function updateNote(id: string, formData: FormData) {
  try {
    await connectDB();
    const title = formData.get("title");
    const content = formData.get("content");
    const visibility = String(formData.get("visibility") || "private");
    const rawTags = formData.get("tags");
    const tags =
      typeof rawTags === "string" && rawTags.trim().length > 0
        ? rawTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    await Note.findByIdAndUpdate(id, { 
      title, 
      content, 
      tags, 
      visibility, 
      updatedAt: Date.now() 
    });
    
    revalidatePath("/brain");
    revalidatePath("/research");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleNoteVisibility(id: string, currentVisibility: string) {
  try {
    await connectDB();
    const newVisibility = currentVisibility === "public" ? "private" : "public";
    await Note.findByIdAndUpdate(id, { visibility: newVisibility, updatedAt: Date.now() });
    revalidatePath("/brain");
    revalidatePath("/research");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
