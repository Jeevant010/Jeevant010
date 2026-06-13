"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Project } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("ACCESS_DENIED");
  }
}

// 1. CREATE
export async function createProject(formData: FormData): Promise<void> {
  try {
    await requireAuth();
    await connectDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const content = formData.get("content") as string;
    const techStackRaw = formData.get("techStack") as string;
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;
    const isOngoing = formData.get("isOngoing") === "on";
    const status = (formData.get("status") as string) || "planned";
    const visibility = (formData.get("visibility") as string) || "private";
    const techStack = techStackRaw ? techStackRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

    await Project.create({
      title,
      slug,
      description,
      content,
      techStack,
      repoLink,
      liveLink,
      startDate: startDateRaw ? new Date(startDateRaw) : undefined,
      endDate: isOngoing ? undefined : endDateRaw ? new Date(endDateRaw) : undefined,
      isOngoing,
      status,
      visibility,
    });

    revalidatePath("/cms/projects");
    revalidatePath("/projects");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to create project:", error);
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

export async function getPublicProjects() {
  try {
    await connectDB();
    const session = await getSession();
    const isAdmin = session && session.role === "admin";
    
    // If admin, show all projects. Otherwise, only public ones.
    const query = isAdmin ? {} : { visibility: "public" };
    
    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();
    return projects.map((p: any) => ({ ...p, _id: p._id.toString() }));
  } catch (error) {
    console.error("Failed to fetch public projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    await connectDB();
    
    // Fallback: If it's a valid ObjectId (because it's an old project without a slug), search by _id as well.
    const isValidId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    const query = isValidId 
       ? { $or: [{ slug }, { _id: slug }] } 
       : { slug };
       
    const project = await Project.findOne(query).lean();
    
    if (!project) return null;
    
    // Auth Check
    const session = await getSession();
    const isAdmin = session && session.role === "admin";
    
    if (project.visibility !== "public" && !isAdmin) {
      return null; // Deny access to private projects if not admin
    }
    
    return { ...project, _id: project._id.toString() };
  } catch (error) {
    console.error("Failed to fetch project by slug:", error);
    return null;
  }
}

// 3. UPDATE (Toggle Visibility)
export async function toggleVisibility(id: string, currentStatus: string) {
  try {
    await requireAuth();
    await connectDB();
    const newStatus = currentStatus === "public" ? "private" : "public";
    await Project.findByIdAndUpdate(id, { visibility: newStatus });

    revalidatePath("/cms/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateProject(formData: FormData) {
  try {
    await requireAuth();
    await connectDB();
    const id = formData.get("id");
    if(!id) return;
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const content = formData.get("content") as string;
    const techStackRaw = formData.get("techStack") as string;
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;
    const isOngoing = formData.get("isOngoing") === "on";
    const status = (formData.get("status") as string) || "planned";
    const visibility = (formData.get("visibility") as string) || "private";
    const techStack = techStackRaw ? techStackRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    await Project.findByIdAndUpdate(id, {
      title,
      description,
      content,
      techStack,
      repoLink,
      liveLink,
      startDate: startDateRaw ? new Date(startDateRaw) : undefined,
      endDate: isOngoing ? undefined : endDateRaw ? new Date(endDateRaw) : undefined,
      isOngoing,
      status,
      visibility,
    });

    revalidatePath("/cms/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/journey");
  } catch (error) {
    console.error("Failed to update project:", error);
  }
}

// 4. DELETE
export async function deleteProject(id: string) {
  try {
    await requireAuth();
    await connectDB();
    await Project.findByIdAndDelete(id);
    revalidatePath("/cms/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
