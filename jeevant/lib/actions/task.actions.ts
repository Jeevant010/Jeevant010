"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Task } from "@/lib/database/models";
import { updateBulkOrder } from "./reorder.actions";

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
export async function createTask(formData: FormData): Promise<void> {
  try {
    await connectDB();
    const title = formData.get("title");
    
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const dependenciesRaw = formData.get("dependencies") as string;
    const dependencies = dependenciesRaw ? dependenciesRaw.split(",").map(d => d.trim()).filter(Boolean) : [];

    await Task.create({
      title,
      scope: "daily",
      isCompleted: false,
      estimatedTime: formData.get("estimatedTime") ? Number(formData.get("estimatedTime")) : undefined,
      actualTime: formData.get("actualTime") ? Number(formData.get("actualTime")) : undefined,
      energyLevel: formData.get("energyLevel") || "medium",
      statusUpdate: formData.get("statusUpdate"),
      blockers: formData.get("blockers"),
      reviewNotes: formData.get("reviewNotes"),
      assignedTo: formData.get("assignedTo"),
      cost: formData.get("cost"),
      tags,
      dependencies
    });

    revalidatePath("/planner/daily");
    revalidatePath("/dashboard"); // Update the dashboard stats too
  } catch (error) {
    console.error("Failed to create task:", error);
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

export async function updateTaskOrder(ids: string[]) {
  const updates = ids.map((id, index) => ({ id, order: index }));
  await updateBulkOrder("Task", updates, ["/planner/daily"]);
}

export async function updateTask(formData: FormData) {
  try {
    await connectDB();
    const id = formData.get("id") as string;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const dependenciesRaw = formData.get("dependencies") as string;
    const dependencies = dependenciesRaw ? dependenciesRaw.split(",").map(d => d.trim()).filter(Boolean) : [];

    await Task.findByIdAndUpdate(id, {
      title: formData.get("title"),
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : undefined,
      reminderDate: formData.get("reminderDate") ? new Date(String(formData.get("reminderDate"))) : undefined,
      category: formData.get("category"),
      sourceUrl: formData.get("sourceUrl"),
      estimatedTime: formData.get("estimatedTime") ? Number(formData.get("estimatedTime")) : undefined,
      actualTime: formData.get("actualTime") ? Number(formData.get("actualTime")) : undefined,
      energyLevel: formData.get("energyLevel") || "medium",
      statusUpdate: formData.get("statusUpdate"),
      blockers: formData.get("blockers"),
      reviewNotes: formData.get("reviewNotes"),
      assignedTo: formData.get("assignedTo"),
      cost: formData.get("cost"),
      tags,
      dependencies
    });
    revalidatePath("/planner/daily");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}