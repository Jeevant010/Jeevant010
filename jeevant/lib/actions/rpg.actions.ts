"use server";

import connectDB from "@/lib/db";
import { Experience, Achievement } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

// 1. GET DATA (The Character Sheet)
export async function getCharacterSheet() {
  await connectDB();
  
  // Fetch Quests (Experience) sorted by newest
  const quests = await Experience.find({}).sort({ startDate: -1 });
  
  // Fetch Loot (Achievements)
  const loot = await Achievement.find({}).sort({ date: -1 });

  return {
    quests: quests.map((q: any) => ({ ...q.toObject(), _id: q._id.toString() })),
    loot: loot.map((l: any) => ({ ...l.toObject(), _id: l._id.toString() }))
  };
}

// 2. ADD QUEST (Experience)
export async function addExperience(formData: FormData) {
  await connectDB();
  await Experience.create({
    role: formData.get("role"),
    company: formData.get("company"),
    description: formData.get("description"),
    startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))) : new Date(),
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
    type: String(formData.get("type") || "internship")
  });
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

export async function updateExperience(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  
  await Experience.findByIdAndUpdate(id, {
    role: formData.get("role"),
    company: formData.get("company"),
    description: formData.get("description"),
    startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))) : undefined,
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
    type: String(formData.get("type") || "internship")
  });
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

export async function deleteExperience(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  await Experience.findByIdAndDelete(id);
  revalidatePath("/about");
  revalidatePath("/journey");
  revalidatePath("/cms/rpg");
}

// 3. ADD LOOT (Achievement)
export async function addAchievement(formData: FormData) {
  await connectDB();
  await Achievement.create({
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description"),
    proofLink: formData.get("proofLink"),
    date: formData.get("date") ? new Date(String(formData.get("date"))) : undefined,
  });
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}

export async function updateAchievement(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  
  await Achievement.findByIdAndUpdate(id, {
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description"),
    proofLink: formData.get("proofLink"),
    date: formData.get("date") ? new Date(String(formData.get("date"))) : undefined,
  });
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}

export async function deleteAchievement(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  if (!id) return;
  await Achievement.findByIdAndDelete(id);
  revalidatePath("/about");
  revalidatePath("/cms/rpg");
  revalidatePath("/");
}