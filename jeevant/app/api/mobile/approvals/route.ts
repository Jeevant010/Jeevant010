import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval } from "@/lib/database/models";
import { decideApproval, getApprovals } from "@/lib/actions/approval.actions";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const approvals = await getApprovals(50);
  return mobileJson(request, { approvals });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  const decision = String(body?.decision || "");
  if (!id || !["approved", "rejected"].includes(decision)) {
    return mobileJson(request, { error: "id and decision (approved|rejected) are required." }, { status: 400 });
  }

  // The bearer token has already been verified above, so the action-level
  // cookie check is skipped for this authenticated mobile call.
  const result = await decideApproval(id, decision as "approved" | "rejected", { skipAuth: true });
  return mobileJson(request, result, { status: result.success ? 200 : 400 });
}

// Clear decided history. Pending approvals are never deleted by this endpoint.
export async function DELETE(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const result = await Approval.deleteMany({
    status: { $in: ["approved", "rejected", "executed", "needs_action", "failed"] },
  });
  return mobileJson(request, { ok: true, deleted: result.deletedCount });
}
