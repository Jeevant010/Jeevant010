"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Project } from "@/lib/database/models";

// 1. CREATE
export async function createProject(formData: FormData) {
  try {
    await connectDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    // Auto-generate slug from title (e.g., "EcoSort AI" -> "ecosort-ai")
    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(); 

    await Project.create({
      title,
      slug,
      description,
      repoLink,
      status: "planned",
      visibility: "private",
    });

    // Refresh the CMS page so the new project shows up immediately
    revalidatePath("/cms/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// 2. READ
export async function getProjects() {
  try {
    await connectDB();
    // Sort by newest first
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    
    // Convert _id to string for Next.js serialization
    return projects.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

// 3. UPDATE (Toggle Visibility)
export async function toggleVisibility(id: string, currentStatus: string) {
  try {
    await connectDB();
    const newStatus = currentStatus === "public" ? "private" : "public";
    await Project.findByIdAndUpdate(id, { visibility: newStatus });
    
    revalidatePath("/cms/projects");
    revalidatePath("/projects"); // Also update the public page!
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. DELETE
export async function deleteProject(id: string) {
  try {
    await connectDB();
    await Project.findByIdAndDelete(id);
    revalidatePath("/cms/projects");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}