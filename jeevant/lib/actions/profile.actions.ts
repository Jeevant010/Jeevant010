"use server";

import connectDB from "@/lib/db";
import { Profile } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

// GET (Ensures one profile always exists)
export async function getProfile() {
  await connectDB();
  let profile = await Profile.findOne({});
  
  if (!profile) {
    profile = await Profile.create({});
  }
  
  return { ...profile.toObject(), _id: profile._id.toString() };
}

// UPDATE
export async function updateProfile(formData: FormData) {
  await connectDB();
  
  const data = {
    name: formData.get("name"),
    title: formData.get("title"),
    level: Number(formData.get("level")),
    leetcodeRating: Number(formData.get("leetcodeRating")),
    githubUsername: formData.get("githubUsername"),
    resumeLink: formData.get("resumeLink"),
    avatarUrl: formData.get("avatarUrl"),
    status: formData.get("status"),
    updatedAt: new Date()
  };

  // Update the first/only document
  await Profile.findOneAndUpdate({}, data, { upsert: true });

  // Refresh ALL pages that use this data
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/dashboard");
}