import connectDB from "@/lib/db";
import { Task } from "@/lib/database/models";
import { pushConfigured, sendToAll } from "./webpush";

export type ReminderPushResult = {
  configured: boolean;
  candidates: number;
  pushed: number;
  sent: number;
  failed: number;
};

export async function pushDueReminders(): Promise<ReminderPushResult> {
  if (!pushConfigured()) {
    return { configured: false, candidates: 0, pushed: 0, sent: 0, failed: 0 };
  }

  await connectDB();
  const now = new Date();
  const from = new Date(now.getTime() - 10 * 60_000);
  const to = new Date(now.getTime() + 5 * 60_000);

  const tasks = await Task.find({
    isCompleted: false,
    dueDate: { $gte: from, $lte: to },
    $or: [{ reminderPushedAt: { $exists: false } }, { reminderPushedAt: null }],
  })
    .sort({ dueDate: 1 })
    .limit(20);

  let pushed = 0;
  let sent = 0;
  let failed = 0;

  for (const task of tasks) {
    const result = await sendToAll({
      title: "Reminder",
      body: String(task.title),
      url: "/planner/daily",
      tag: `task-${String(task._id)}`,
    });

    sent += result.sent;
    failed += result.failed;

    if (result.sent > 0) {
      task.reminderPushedAt = new Date();
      await task.save();
      pushed += 1;
    }
  }

  return { configured: true, candidates: tasks.length, pushed, sent, failed };
}
