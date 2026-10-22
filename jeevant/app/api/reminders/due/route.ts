import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Task } from "@/lib/database/models";

export const runtime = "nodejs";

// Due or soon-due reminders for the in-app watcher.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tasks = await Task.find({ isCompleted: false, dueDate: { $lte: soon } })
      .sort({ dueDate: 1 })
      .limit(20);

    return NextResponse.json({
      tasks: tasks.map((task: any) => ({
        id: String(task._id),
        title: task.title,
        dueDate: task.dueDate,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
