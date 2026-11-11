import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval } from "@/lib/database/models";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

// The phone reports the outcome of a UI sequence after the user taps Run.
export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return mobileJson(request, { error: "A valid approval id is required." }, { status: 400 });
  }

  await connectDB();
  const approval = await Approval.findById(id);
  if (!approval) return mobileJson(request, { error: "Approval not found." }, { status: 404 });
  if (approval.kind !== "ui") {
    return mobileJson(request, { error: "That approval is not a UI action." }, { status: 400 });
  }
  if (approval.status !== "needs_action" && approval.status !== "approved") {
    return mobileJson(request, { error: `Approval is already ${approval.status}.` }, { status: 400 });
  }

  const ok = body?.ok === true;
  approval.status = ok ? "executed" : "failed";
  approval.result = String(body?.detail || (ok ? "UI sequence completed." : "UI sequence failed.")).slice(0, 2000);
  approval.decidedAt = new Date();
  await approval.save();

  return mobileJson(request, { ok: true, status: approval.status });
}
