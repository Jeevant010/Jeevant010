import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/lib/database/models";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES = ["low", "medium", "high"];

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();

  const tasks = await Task.find({ scope: "daily" })
    .sort({ isCompleted: 1, dueDate: 1, createdAt: -1 })
    .limit(200);

  return mobileJson(request, { tasks: tasks.map(plain) });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  if (!title) return mobileJson(request, { error: "A task needs a title." }, { status: 400 });

  await connectDB();
  const task = await Task.create({
    title,
    scope: "daily",
    isCompleted: false,
    priority: PRIORITIES.includes(String(body?.priority)) ? String(body.priority) : "medium",
    dueDate: parseDate(body?.dueDate),
    category: body?.category ? String(body.category) : undefined,
  });

  return mobileJson(request, { task: plain(task) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!id) return mobileJson(request, { error: "A task id is required." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body?.done === "boolean") update.isCompleted = body.done;
  if (typeof body?.title === "string" && body.title.trim()) update.title = body.title.trim();
  if (body?.priority && PRIORITIES.includes(String(body.priority))) update.priority = String(body.priority);
  if (body?.dueDate !== undefined) update.dueDate = parseDate(body.dueDate);

  await connectDB();
  const task = await Task.findByIdAndUpdate(id, update, { new: true });
  if (!task) return mobileJson(request, { error: "Task not found." }, { status: 404 });
  return mobileJson(request, { task: plain(task) });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (!id) return mobileJson(request, { error: "A task id is required." }, { status: 400 });

  await connectDB();
  const task = await Task.findByIdAndDelete(id);
  if (!task) return mobileJson(request, { error: "Task not found." }, { status: 404 });
  return mobileJson(request, { ok: true });
}
