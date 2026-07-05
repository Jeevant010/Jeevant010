"use server";

import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("ACCESS_DENIED");
  }
}

export async function updateBulkOrder(modelName: string, updates: { id: string; order: number }[], pathsToRevalidate: string[] = []) {
  await requireAuth();
  await connectDB();

  const Model = mongoose.models[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found`);

  const bulkOps = updates.map((u) => ({
    updateOne: {
      filter: { _id: u.id },
      update: { order: u.order },
    },
  }));

  await Model.bulkWrite(bulkOps);

  for (const path of pathsToRevalidate) {
    revalidatePath(path);
  }
  
  return { success: true };
}