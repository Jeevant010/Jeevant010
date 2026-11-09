import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { CodingJob } from "@/lib/database/models";
import { runCodingJob } from "@/lib/coding/run";
import { publicCodingRepos, resolveCodingRepo } from "@/lib/coding/config";
import { rateLimitDistributed } from "@/lib/security/rate-limit";
import { clientIp, mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const jobs = await CodingJob.find({}).sort({ createdAt: -1 }).limit(25);
  return mobileJson(request, {
    jobs: jobs.map(plain),
    repos: publicCodingRepos(),
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const limited = await rateLimitDistributed(`mobile-code:${clientIp(request)}`, 10, 10 * 60_000);
  if (!limited.ok) {
    return mobileJson(
      request,
      { error: "Too many coding jobs. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const repoKey = String(body?.repo || "").trim();
  const prompt = String(body?.prompt || "").trim();
  if (!repoKey || !prompt) {
    return mobileJson(request, { error: "repo and prompt are required." }, { status: 400 });
  }
  if (prompt.length > 4000) {
    return mobileJson(request, { error: "Keep the prompt under 4000 characters." }, { status: 400 });
  }

  const repo = resolveCodingRepo(repoKey);
  if (!repo) {
    return mobileJson(
      request,
      { error: `Repository "${repoKey}" is not in CODING_REPOS, or it is not a git repository.` },
      { status: 400 }
    );
  }

  const files = (Array.isArray(body?.files) ? body.files : String(body?.files || "").split(","))
    .map((file: unknown) => String(file).trim())
    .filter(Boolean)
    .slice(0, 4);

  const commitMode = body?.commitMode === "bulk" ? "bulk" : "per-file";

  await connectDB();
  const job = await CodingJob.create({
    repoKey: repo.key,
    repoSlug: repo.slug,
    prompt,
    files,
    commitMode,
    status: "queued",
  });

  // Fire and forget. The app polls /api/mobile/code/<id>. A long-running Node
  // host keeps this alive; a serverless host needs a worker instead.
  void runCodingJob(String(job._id));

  return mobileJson(request, { job: plain(job) }, { status: 202 });
}
