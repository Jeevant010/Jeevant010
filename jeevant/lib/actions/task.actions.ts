"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Task } from "@/lib/database/models";

// 1. GET TASKS (For a specific date range - defaulting to "today" for now)
export async function getDailyTasks() {
  try {
    await connectDB();
    // Fetch tasks created today or pending tasks
    // For simplicity in this v1, we fetch all non-completed tasks + completed ones from last 24h
    const tasks = await Task.find({ scope: "daily" }).sort({ createdAt: -1 });
    
    return tasks.map((t: any) => ({
      ...t.toObject(),
      _id: t._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

// 2. CREATE TASK
export async function createTask(formData: FormData) {
  try {
    await connectDB();
    const title = formData.get("title");
    
    await Task.create({
      title,
      scope: "daily",
      isCompleted: false
    });

    revalidatePath("/planner/daily");
    revalidatePath("/dashboard"); // Update the dashboard stats too
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 3. TOGGLE COMPLETE
export async function toggleTask(id: string, currentState: boolean) {
  try {
    await connectDB();
    await Task.findByIdAndUpdate(id, { isCompleted: !currentState });
    revalidatePath("/planner/daily");
    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. DELETE TASK
export async function deleteTask(id: string) {
  try {
    await connectDB();
    await Task.findByIdAndDelete(id);
    revalidatePath("/planner/daily");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}