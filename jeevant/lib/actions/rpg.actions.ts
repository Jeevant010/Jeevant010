"use server";

import connectDB from "@/lib/db";
import { Experience, Achievement } from "@/lib/database/models";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateBulkOrder } from "./reorder.actions";

async function requireAuth() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("ACCESS_DENIED");
  }
}

// 1. GET DATA (The Character Sheet)
export async function getCharacterSheet() {
  await connectDB();
  const session = await getSession();
  const isAdmin = session && session.role === "admin";
  
  // Fetch Quests (Experience) sorted by order then newest
  const quests = await Experience.find({}).sort({ order: 1, startDate: -1 });
  
  // Fetch Loot (Achievements) - Filter private ones if not admin
  const lootQuery = isAdmin ? {} : { visibility: "public" };
  const loot = await Achievement.find(lootQuery).sort({ order: 1, date: -1 });

  return {
    quests: quests.map((q: any) => ({ ...q.toObject(), _id: q._id.toString() })),
    loot: loot.map((l: any) => ({ ...l.toObject(), _id: l._id.toString() }))
  };
}

// 2. ADD QUEST (Experience)
export async function addExperience(formData: FormData) {
  await requireAuth();
  await connectDB();
  const skillsRaw = formData.get("skillsUsed") as string;
  const skillsUsed = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const achievementsRaw = formData.get("achievements") as string;
  const achievements = achievementsRaw ? achievementsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  await Experience.create({
    role: formData.get("role"),
    company: formData.get("company"),
    description: formData.get("description"),
    startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))) : new Date(),
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
    type: String(formData.get("type") || "internship"),
    skillsUsed,
    location: formData.get("location"),
    website: formData.get("website"),
    isCurrent: formData.get("isCurrent") === "on",
    manager: formData.get("manager"),
    salary: formData.get("salary"),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    reasonForLeaving: formData.get("reasonForLeaving"),
    tags,
    achievements
  });
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

export async function updateExperience(formData: FormData) {
  await requireAuth();
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  
  const skillsRaw = formData.get("skillsUsed") as string;
  const skillsUsed = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const achievementsRaw = formData.get("achievements") as string;
  const achievements = achievementsRaw ? achievementsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  await Experience.findByIdAndUpdate(id, {
    role: formData.get("role"),
    company: formData.get("company"),
    description: formData.get("description"),
    startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))) : undefined,
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
    type: String(formData.get("type") || "internship"),
    skillsUsed,
    location: formData.get("location"),
    website: formData.get("website"),
    isCurrent: formData.get("isCurrent") === "on",
    manager: formData.get("manager"),
    salary: formData.get("salary"),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    reasonForLeaving: formData.get("reasonForLeaving"),
    tags,
    achievements
  });
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

export async function deleteExperience(formData: FormData) {
  await requireAuth();
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  await Experience.findByIdAndDelete(id);
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

export async function updateExperienceOrder(ids: string[]) {
  try {
    await requireAuth();
    const updates = ids.map((id, index) => ({ id, order: index }));
    await updateBulkOrder("Experience", updates, ["/cms/journey", "/cms/rpg", "/about", "/journey"]);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 3. ADD LOOT (Achievement)
export async function addAchievement(formData: FormData) {
  await requireAuth();
  await connectDB();
  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  await Achievement.create({
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description"),
    proofLink: formData.get("proofLink"),
    date: formData.get("date") ? new Date(String(formData.get("date"))) : undefined,
    visibility: formData.get("visibility") || "public",
    category: formData.get("category"),
    score: formData.get("score") ? Number(formData.get("score")) : undefined,
    issuer: formData.get("issuer"),
    credentialId: formData.get("credentialId"),
    importance: formData.get("importance") || "medium",
    expiryDate: formData.get("expiryDate") ? new Date(String(formData.get("expiryDate"))) : undefined,
    isFeatured: formData.get("isFeatured") === "on",
    skills,
    tags
  });
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}

export async function updateAchievement(formData: FormData) {
  await requireAuth();
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  await Achievement.findByIdAndUpdate(id, {
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description"),
    proofLink: formData.get("proofLink"),
    date: formData.get("date") ? new Date(String(formData.get("date"))) : undefined,
    visibility: formData.get("visibility") || "public",
    category: formData.get("category"),
    score: formData.get("score") ? Number(formData.get("score")) : undefined,
    issuer: formData.get("issuer"),
    credentialId: formData.get("credentialId"),
    importance: formData.get("importance") || "medium",
    expiryDate: formData.get("expiryDate") ? new Date(String(formData.get("expiryDate"))) : undefined,
    isFeatured: formData.get("isFeatured") === "on",
    skills,
    tags
  });
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}

export async function deleteAchievement(formData: FormData) {
  await requireAuth();
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  await Achievement.findByIdAndDelete(id);
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}

export async function updateAchievementOrder(ids: string[]) {
  try {
    await requireAuth();
    const updates = ids.map((id, index) => ({ id, order: index }));
    await updateBulkOrder("Achievement", updates, ["/cms/expertise", "/cms/rpg", "/about", "/"]);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}