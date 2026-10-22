// In-app workflow engine (a small n8n alternative).
// Steps run in order with bounded retries; external steps queue approvals.

import connectDB from "@/lib/db";
import { Workflow, WorkflowRun, Task, Note, Approval, ContentPost } from "@/lib/database/models";
import { runAgent } from "@/lib/agent/run";
import { evaluateExternalAction } from "@/lib/guardrails/policy";

export type StepResult = { type: string; ok: boolean; result: string; attempts?: number };

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function runStep(step: any): Promise<StepResult> {
  const config = step.config || {};
  const type = String(step.type);

  switch (type) {
    case "agent": {
      const run = await runAgent(str(config.prompt, "Summarise my day."), { persist: false });
      return { type, ok: true, result: run.reply };
    }

    case "task": {
      const doc = await Task.create({
        title: str(config.title, "Untitled task"),
        scope: "daily",
        priority: ["low", "medium", "high"].includes(config.priority) ? config.priority : "medium",
      });
      return { type, ok: true, result: `Created task "${doc.title}".` };
    }

    case "note": {
      const doc = await Note.create({
        title: str(config.title, "Untitled note"),
        content: str(config.content),
        tags: Array.isArray(config.tags) ? config.tags.map(String) : [],
        visibility: "private",
      });
      return { type, ok: true, result: `Saved note "${doc.title}".` };
    }

    case "post": {
      const post = await ContentPost.create({
        title: str(config.title, "Workflow post"),
        body: str(config.body, str(config.content, "")),
        channels: Array.isArray(config.channels) ? config.channels.map(String) : [],
        source: "ai",
        status: "queued",
      });
      await Approval.create({
        kind: "post",
        title: `Publish workflow post: ${post.title}`,
        detail: "Created by an automation workflow.",
        payload: { postId: String(post._id), channels: post.channels },
        status: "pending",
      });
      return { type, ok: true, result: "Post draft queued for approval." };
    }

    case "email": {
      await Approval.create({
        kind: "email",
        title: `Email: ${str(config.subject, "Untitled")}`,
        detail: "Created by an automation workflow.",
        payload: { to: str(config.to), subject: str(config.subject), body: str(config.body) },
        status: "pending",
      });
      return { type, ok: true, result: "Email queued for approval." };
    }

    case "calendar": {
      await Approval.create({
        kind: "calendar",
        title: `Calendar: ${str(config.title, "Block")}`,
        detail: "Created by an automation workflow.",
        payload: {
          blocks: [
            {
              title: str(config.title, "Block"),
              start: config.start,
              end: config.end,
              notes: str(config.notes),
            },
          ],
        },
        status: "pending",
      });
      return { type, ok: true, result: "Calendar block queued for approval." };
    }

    case "http": {
      const url = str(config.url);
      if (!url) return { type, ok: false, result: "HTTP step needs a url." };

      const guard = await evaluateExternalAction({
        kind: "http",
        target: url,
        meta: { method: str(config.method, "POST") },
      });
      if (!guard.allowed) return { type, ok: false, result: guard.reason };

      await Approval.create({
        kind: "http",
        title: `HTTP ${str(config.method, "POST")} ${url}`,
        detail: "Outbound webhook queued for approval.",
        payload: { url, method: str(config.method, "POST"), body: config.body || {} },
        status: "pending",
      });
      return { type, ok: true, result: "HTTP request queued for approval." };
    }

    default:
      return { type, ok: false, result: `Unknown step type "${type}".` };
  }
}

async function runWithRetry(step: any, maxAttempts: number): Promise<StepResult> {
  let last: StepResult = { type: String(step.type), ok: false, result: "not run" };
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    last = await runStep(step);
    if (last.ok) return { ...last, attempts: attempt };
    if (attempt < maxAttempts) await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
  }
  return { ...last, attempts: maxAttempts };
}

export async function runWorkflow(id: string) {
  await connectDB();
  const workflow = await Workflow.findById(id);
  if (!workflow) return { ok: false, detail: "Workflow not found.", steps: [] as StepResult[] };

  const run = await WorkflowRun.create({
    workflowId: workflow._id,
    workflowName: workflow.name,
    status: "success",
    steps: [],
  });

  const steps: StepResult[] = [];
  for (const step of workflow.steps as any[]) {
    // Retry only steps that are safe to repeat.
    const maxAttempts = step.type === "http" || step.type === "agent" ? 2 : 1;
    const result = await runWithRetry(step, maxAttempts);
    steps.push(result);
    if (!result.ok) break;
  }

  const ok = steps.length > 0 && steps.every((step) => step.ok);

  // Use an update rather than doc.save() so a stale cached schema (e.g. a dev
  // server started before a new enum value existed) cannot reject the write.
  await Workflow.updateOne(
    { _id: workflow._id },
    { $set: { lastRunAt: new Date(), lastResult: steps, updatedAt: new Date() } }
  );

  run.steps = steps as any;
  run.status = ok ? "success" : "failed";
  run.finishedAt = new Date();
  await run.save();

  return { ok, detail: `${steps.length} step(s) ran.`, steps };
}

export async function processDueWorkflows() {
  await connectDB();
  const workflows = await Workflow.find({
    enabled: true,
    trigger: { $in: ["schedule"] },
    intervalMinutes: { $gt: 0 },
  });
  const now = Date.now();

  const due = workflows.filter((workflow: any) => {
    if (!workflow.lastRunAt) return true;
    return now - new Date(workflow.lastRunAt).getTime() >= workflow.intervalMinutes * 60_000;
  });

  const results: { id: string; name: string; ok: boolean; steps: number }[] = [];
  for (const workflow of due) {
    const run = await runWorkflow(String(workflow._id));
    results.push({ id: String(workflow._id), name: workflow.name, ok: run.ok, steps: run.steps.length });
  }

  return { ran: results.length, results };
}

export async function runWorkflowByWebhook(key: string) {
  await connectDB();
  const workflow = await Workflow.findOne({ webhookKey: key, enabled: true });
  if (!workflow) return { ok: false, detail: "No enabled workflow for that key.", steps: [] as StepResult[] };
  return runWorkflow(String(workflow._id));
}
