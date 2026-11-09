import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { CodingJob } from "@/lib/database/models";
import { decideCodingJob } from "@/lib/coding/run";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const { id } = await context.params;
  await connectDB();
  const job = await CodingJob.findById(id);
  if (!job) return mobileJson(request, { error: "Coding job not found." }, { status: 404 });
  return mobileJson(request, { job: plain(job) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const { id } = await context.params;

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  if (action !== "approve" && action !== "reject") {
    return mobileJson(request, { error: "action must be approve or reject." }, { status: 400 });
  }

  const result = await decideCodingJob(id, action);
  return mobileJson(request, result, { status: result.ok ? 200 : 400 });
}
