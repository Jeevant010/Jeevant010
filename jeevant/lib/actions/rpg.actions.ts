"use server";

import connectDB from "@/lib/db";
import { Experience, Achievement } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

export async function addExperience(formData: FormData) {
  await connectDB();
  await Experience.create({
    role: formData.get("role"),
    company: formData.get("company"),
    description: formData.get("description"),
    startDate: new Date(), // Simplified for v1
    type: "internship"
  });
  revalidatePath("/about");
}

export async function addAchievement(formData: FormData) {
  await connectDB();
  await Achievement.create({
    title: formData.get("title"),
    platform: formData.get("platform"),
    description: formData.get("description")
  });
  revalidatePath("/about");
}