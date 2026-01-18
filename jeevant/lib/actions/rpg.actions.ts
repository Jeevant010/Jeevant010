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
    startDate: new Date(),
    type: "internship"
  });
  revalidatePath("/about");
}

// 3. ADD LOOT (Achievement)
export async function addAchievement(formData: FormData) {
  await connectDB();
  await Achievement.create({
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description")
  });
  revalidatePath("/about");
}