"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Note } from "@/lib/database/models";

// 1. FETCH THE EVIDENCE (Notes)
export async function getNotes(searchQuery: string = "") {
  try {
    await connectDB();
    const query = searchQuery 
      ? { $or: [{ title: { $regex: searchQuery, $options: 'i' } }, { content: { $regex: searchQuery, $options: 'i' } }] }
      : {};

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    
    return notes.map((n: any) => ({
      ...n.toObject(),
      _id: n._id.toString(),
    }));
  } catch (error) {
    return [];
  }
}

// 2. LOG NEW CLUE (Create Note)
export async function createNote(formData: FormData) {
  try {
    await connectDB();
    const title = formData.get("title");
    const content = formData.get("content");
    const tags = (formData.get("tags") as string).split(",").map(t => t.trim());

    await Note.create({ title, content, tags, isPinned: false });
    
    revalidatePath("/brain");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 3. ARCHIVE EVIDENCE (Delete)
export async function deleteNote(id: string) {
  try {
    await connectDB();
    await Note.findByIdAndDelete(id);
    revalidatePath("/brain");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}