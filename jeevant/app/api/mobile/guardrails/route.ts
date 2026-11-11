import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval, AuditLog, Setting } from "@/lib/database/models";
import { getGuardrailSettings } from "@/lib/guardrails/policy";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();

  const [settings, logs, pending] = await Promise.all([
    getGuardrailSettings(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(20),
    Approval.countDocuments({ status: "pending" }),
  ]);

  return mobileJson(request, {
    settings,
    pendingApprovals: pending,
    logs: logs.map(plain),
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const mode = String(body?.mode || "") === "blocked" ? "blocked" : "approval";

  await connectDB();
  await Setting.findOneAndUpdate(
    { key: "guardrailMode" },
    { key: "guardrailMode", value: mode, updatedAt: new Date() },
    { upsert: true }
  );

  const settings = await getGuardrailSettings();
  return mobileJson(request, { ok: true, settings });
}
