"use server";

import connectDB from "@/lib/db";
import { Learning } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

export async function getLearning() {
  await connectDB();
  const items = await Learning.find({}).sort({ status: 1 });
  return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
}

export async function getPublicLearning() {
  await connectDB();
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  const isAdmin = session && session.role === "admin";
  
  const query = isAdmin ? {} : { visibility: "public" };
  const items = await Learning.find(query).sort({ status: 1 });
  return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
}

export async function addLearning(formData: FormData) {
  await connectDB();
  const title = formData.get("title");
  const platform = formData.get("platform");
  const totalModules = Number(formData.get("totalModules"));
  const completedModules = Number(formData.get("completedModules"));
  const visibility = String(formData.get("visibility") || "private");
  
  await Learning.create({ 
    title, 
    platform, 
    totalModules, 
    completedModules, 
    visibility,
    status: completedModules >= totalModules ? "completed" : "in-progress" 
  });
  
  revalidatePath("/learning");
}

export async function deleteLearning(id: string) {
  await connectDB();
  await Learning.findByIdAndDelete(id);
  revalidatePath("/learning");
}

export async function incrementLearning(id: string) {
  await connectDB();
  const learning = await Learning.findById(id);
  if (learning && learning.completedModules < learning.totalModules) {
    const newCompleted = learning.completedModules + 1;
    const newStatus = newCompleted >= learning.totalModules ? "completed" : "in-progress";
    await Learning.findByIdAndUpdate(id, { completedModules: newCompleted, status: newStatus });
    revalidatePath("/learning");
  }
}