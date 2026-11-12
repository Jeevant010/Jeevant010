import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Approval } from "@/lib/database/models";
import { getLastEval } from "@/lib/agent/evals";
import { describeTool } from "@/lib/agent/registry";
import { getToolMetrics, setToolDisabled } from "@/lib/agent/reliability";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const [tools, evalResult, pendingApprovals] = await Promise.all([
    getToolMetrics(),
    getLastEval(),
    connectDB().then(() => Approval.countDocuments({ status: "pending" })),
  ]);

  const calls = tools.reduce((sum, tool) => sum + tool.calls, 0);
  const failures = tools.reduce((sum, tool) => sum + tool.failure, 0);
  const worstP95 = tools.reduce((max, tool) => Math.max(max, tool.p95Ms), 0);
  const slowest = [...tools].sort((left, right) => right.p95Ms - left.p95Ms).slice(0, 5);
  const failing = tools
    .filter((tool) => tool.failure > 0)
    .sort((left, right) => right.failure / Math.max(right.calls, 1) - left.failure / Math.max(left.calls, 1))
    .slice(0, 8);

  return mobileJson(request, {
    tools,
    summary: {
      calls,
      failures,
      successRate: calls ? (calls - failures) / calls : 0,
      worstP95,
      disabled: tools.filter((tool) => tool.disabled).map((tool) => tool.name),
    },
    slowest,
    failing,
    eval: evalResult,
    pendingApprovals,
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const tool = String(body?.tool || "").trim();
  const disabled = body?.disabled === true;
  if (!tool || tool.length > 96) {
    return mobileJson(request, { error: "A tool name is required." }, { status: 400 });
  }
  if (!describeTool(tool)) {
    return mobileJson(request, { error: `Unknown tool "${tool}".` }, { status: 404 });
  }

  await setToolDisabled(tool, disabled);
  return mobileJson(request, { ok: true, tool, disabled });
}
