"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Resume } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("ACCESS_DENIED");
  }
}

export async function getResumes() {
  try {
    await connectDB();
    const resumes = await Resume.find({}).sort({ createdAt: -1 });
    return resumes.map((r: any) => ({ ...r.toObject(), _id: r._id.toString() }));
  } catch (error) {
    return [];
  }
}

export async function createResume(formData: FormData) {
  try {
    await requireAuth();
    await connectDB();
    
    const skillsRaw = formData.get("skills") as string;
    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    await Resume.create({
      title: formData.get("title"),
      domain: formData.get("domain"),
      content: formData.get("content"),
      pdfUrl: formData.get("pdfUrl"),
      layoutTheme: formData.get("layoutTheme") || "tactical",
      isPrimary: formData.get("isPrimary") === "on",
      skills
    });
    revalidatePath("/cms/resume");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateResume(formData: FormData) {
  try {
    await requireAuth();
    await connectDB();
    const id = formData.get("id");
    if (!id) return { success: false };
    
    const skillsRaw = formData.get("skills") as string;
    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    await Resume.findByIdAndUpdate(id, {
      title: formData.get("title"),
      domain: formData.get("domain"),
      content: formData.get("content"),
      pdfUrl: formData.get("pdfUrl"),
      layoutTheme: formData.get("layoutTheme") || "tactical",
      isPrimary: formData.get("isPrimary") === "on",
      skills
    });
    revalidatePath("/cms/resume");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteResume(formData: FormData) {
  try {
    await requireAuth();
    await connectDB();
    const id = formData.get("id");
    if (!id) return { success: false };
    
    await Resume.findByIdAndDelete(id);
    revalidatePath("/cms/resume");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
