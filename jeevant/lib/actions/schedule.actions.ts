"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Schedule } from "@/lib/database/models";

// Get all schedules, sorted by start
export async function getSchedules() {
  try {
    await connectDB();
    const items = await Schedule.find({}).sort({ start: 1 });
    return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
}

// Get schedules for a specific ISO date (YYYY-MM-DD)
export async function getDaySchedules(dateISO: string) {
  try {
    await connectDB();
    const dayStart = new Date(dateISO + "T00:00:00Z");
    const dayEnd = new Date(dateISO + "T23:59:59Z");

    const items = await Schedule.find({ start: { $gte: dayStart, $lte: dayEnd } }).sort({ start: 1 });
    return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
  } catch (error) {
    console.error("Failed to fetch day schedules:", error);
    return [];
  }
}

export async function getPublicDaySchedules(dateISO: string) {
  try {
    await connectDB();
    const dayStart = new Date(dateISO + "T00:00:00Z");
    const dayEnd = new Date(dateISO + "T23:59:59Z");

    const items = await Schedule.find({
      visibility: "public",
      start: { $gte: dayStart, $lte: dayEnd },
    }).sort({ start: 1 });

    return items.map((i: any) => ({ ...i.toObject(), _id: i._id.toString() }));
  } catch (error) {
    console.error("Failed to fetch public day schedules:", error);
    return [];
  }
}

// Create schedule entry from FormData
export async function createSchedule(formData: FormData) {
  try {
    await connectDB();
    const title = String(formData.get("title") || "Untitled");
    const date = String(formData.get("date") || ""); // YYYY-MM-DD
    const startTime = String(formData.get("startTime") || "00:00"); // HH:MM
    const endTime = String(formData.get("endTime") || "");
    const notes = String(formData.get("notes") || "");
    const projectId = String(formData.get("projectId") || "");
    const visibility = String(formData.get("visibility") || "private");
    const recurrence = String(formData.get("recurrence") || "none");
    const isRecurring = formData.get("isRecurring") === "on";
    const colorCode = String(formData.get("colorCode") || "sky");

    const start = new Date(date + "T" + startTime + ":00Z");
    const end = endTime ? new Date(date + "T" + endTime + ":00Z") : undefined;

    await Schedule.create({
      title,
      start,
      end,
      notes,
      projectId: projectId || undefined,
      visibility,
      recurrence,
      isRecurring,
      colorCode,
    });

    revalidatePath("/planner/daily");
    revalidatePath("/dashboard");
    revalidatePath("/cms/schedule");
  } catch (error) {
    console.error("Failed to create schedule:", error);
  }
}

export async function deleteSchedule(id: string) {
  try {
    await connectDB();
    await Schedule.findByIdAndDelete(id);
    revalidatePath("/planner/daily");
    revalidatePath("/dashboard");
    revalidatePath("/cms/schedule");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false };
  }
}

export async function updateSchedule(id: string, formData: FormData) {
  try {
    await connectDB();
    const title = String(formData.get("title") || "Untitled");
    const date = String(formData.get("date") || "");
    const startTime = String(formData.get("startTime") || "00:00");
    const endTime = String(formData.get("endTime") || "");
    const notes = String(formData.get("notes") || "");
    const visibility = String(formData.get("visibility") || "private");
    const recurrence = String(formData.get("recurrence") || "none");
    const isRecurring = formData.get("isRecurring") === "on";
    const colorCode = String(formData.get("colorCode") || "sky");

    const start = new Date(date + "T" + startTime + ":00Z");
    const end = endTime ? new Date(date + "T" + endTime + ":00Z") : undefined;

    await Schedule.findByIdAndUpdate(id, { title, start, end, notes, visibility, recurrence, isRecurring, colorCode });

    revalidatePath("/planner/daily");
    revalidatePath("/dashboard");
    revalidatePath("/cms/schedule");
    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false };
  }
}

// Form-friendly wrapper: delete by FormData { id }
export async function deleteScheduleAction(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) return { success: false };
  return await deleteSchedule(id);
}

// Form-friendly wrapper: update by FormData (id + fields)
export async function updateScheduleAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { success: false };
  return await updateSchedule(id, formData);
}

export async function updateScheduleTime(id: string, start: Date, end?: Date) {
  try {
    await connectDB();
    await Schedule.findByIdAndUpdate(id, { start, end });
    revalidatePath("/planner/daily");
    revalidatePath("/dashboard");
    revalidatePath("/cms/schedule");
    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule time:", error);
    return { success: false };
  }
}

export async function clearPastScheduleEntries(): Promise<void> {
  try {
    await connectDB();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    const result = await Schedule.deleteMany({ end: { $lt: threshold } });
    revalidatePath("/planner/daily");
    revalidatePath("/dashboard");
    revalidatePath("/cms/schedule");
  } catch (error) {
    console.error("Failed to clear past schedule entries:", error);
  }
}
