// Durable job queue with retries and exponential backoff.
// Jobs are stored in MongoDB so they survive restarts. A cron hit drains them.

import connectDB from "@/lib/db";
import { Job } from "@/lib/database/models";
import { dispatchDuePosts } from "@/lib/actions/content.actions";
import { getMorningDigest } from "@/lib/actions/voice.actions";

export async function enqueue(type: string, payload: unknown = {}, runAt?: Date) {
  await connectDB();
  const doc = await Job.create({ type, payload, runAt: runAt || new Date() });
  return String(doc._id);
}

async function runJob(job: any): Promise<unknown> {
  switch (job.type) {
    case "dispatch_due":
      return dispatchDuePosts();
    case "digest":
      return getMorningDigest();
    case "noop":
      return { ok: true };
    default:
      throw new Error(`Unknown job type "${job.type}"`);
  }
}

export async function processJobs(limit = 10) {
  await connectDB();
  const results: { id: string; type: string; ok: boolean; error?: string }[] = [];

  for (let index = 0; index < limit; index += 1) {
    const job = await Job.findOneAndUpdate(
      { status: "queued", runAt: { $lte: new Date() } },
      { $set: { status: "running", updatedAt: new Date() }, $inc: { attempts: 1 } },
      { sort: { runAt: 1 }, new: true }
    );
    if (!job) break;

    try {
      const result = await runJob(job);
      job.status = "done";
      job.result = result as any;
      job.lastError = undefined;
      job.updatedAt = new Date();
      await job.save();
      results.push({ id: String(job._id), type: job.type, ok: true });
    } catch (error) {
      const message = (error as Error).message;
      job.lastError = message;
      job.updatedAt = new Date();
      if (job.attempts >= job.maxAttempts) {
        job.status = "failed";
      } else {
        job.status = "queued";
        const backoffMs = Math.min(60_000 * 2 ** job.attempts, 60 * 60 * 1000);
        job.runAt = new Date(Date.now() + backoffMs);
      }
      await job.save();
      results.push({ id: String(job._id), type: job.type, ok: false, error: message });
    }
  }

  return { processed: results.length, results };
}

export async function getQueueStats() {
  try {
    await connectDB();
    const [queued, running, failed, done] = await Promise.all([
      Job.countDocuments({ status: "queued" }),
      Job.countDocuments({ status: "running" }),
      Job.countDocuments({ status: "failed" }),
      Job.countDocuments({ status: "done" }),
    ]);
    return { queued, running, failed, done };
  } catch {
    return { queued: 0, running: 0, failed: 0, done: 0 };
  }
}
