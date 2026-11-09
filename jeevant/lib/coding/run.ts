// Phone coding sandbox: clone an allowlisted repo into a temp directory, ask
// Groq for full-file edits, apply them, produce a diff, run the configured test
// command, and stop. Nothing is pushed until the user approves.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import connectDB from "@/lib/db";
import { CodingJob } from "@/lib/database/models";
import { groqChat, groqConfigured } from "@/lib/integrations/groq";
import { safeFetch } from "@/lib/http/fetch";
import { redact } from "@/lib/logging/redact";
import {
  codingBaseBranch,
  codingTestCommand,
  codingTmpRoot,
  githubToken,
  resolveCodingRepo,
  type CodingRepo,
} from "./config";

const exec = promisify(execFile);

const MAX_FILES = 4;
const MAX_FILE_BYTES = 120_000;
const MAX_EDIT_BYTES = 200_000;
const MAX_DIFF_BYTES = 400_000;
const TEST_TIMEOUT_MS = 180_000;
const ALLOWED_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".md",
  ".json",
  ".py",
  ".rs",
  ".toml",
  ".yml",
  ".yaml",
  ".sh",
]);

type FileContent = { path: string; content: string };
type EditBundle = { summary: string; edits: { path: string; content: string }[] };

async function run(cmd: string, args: string[], cwd: string, timeout = 120_000) {
  try {
    const { stdout, stderr } = await exec(cmd, args, { cwd, timeout, maxBuffer: 10 * 1024 * 1024 });
    return { ok: true, stdout, stderr };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      stdout: String(failure.stdout || ""),
      stderr: String(failure.stderr || failure.message || ""),
    };
  }
}

function tail(value: string, limit: number): string {
  return value.length > limit ? value.slice(-limit) : value;
}

function parseJson(text: string): any | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function safeRelative(workDir: string, relative: string): string | null {
  const normalized = relative.replace(/\\/g, "/").trim();
  if (!normalized || normalized.startsWith("/") || normalized.includes("..")) return null;
  if (/(^|\/)(\.git|node_modules|dist|\.next|build)(\/|$)/.test(normalized)) return null;
  if (/(^|\/)\.env(\.|$)/.test(normalized)) return null;
  if (/(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(normalized)) return null;
  if (!ALLOWED_EXT.has(path.extname(normalized).toLowerCase())) return null;
  const full = path.resolve(workDir, normalized);
  if (full !== workDir && !full.startsWith(`${workDir}${path.sep}`)) return null;
  return full;
}

async function collectTree(workDir: string): Promise<string[]> {
  const result = await run("git", ["ls-files"], workDir);
  if (!result.ok) throw new Error(`git ls-files failed: ${result.stderr}`);
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !!line && !!safeRelative(workDir, line))
    .slice(0, 500);
}

async function readFiles(workDir: string, files: string[]): Promise<FileContent[]> {
  const output: FileContent[] = [];
  let total = 0;
  for (const relative of files) {
    const full = safeRelative(workDir, relative);
    if (!full || !existsSync(full)) continue;
    const stat = await fs.stat(full);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) continue;
    if (total + stat.size > MAX_FILE_BYTES * MAX_FILES) break;
    const content = await fs.readFile(full, "utf8");
    output.push({ path: relative.replace(/\\/g, "/"), content });
    total += stat.size;
  }
  return output;
}

async function chooseFiles(prompt: string, tree: string[]): Promise<string[]> {
  const text = await groqChat(
    [
      "You choose which files a coding change needs.",
      'Return ONLY JSON: { "files": string[] }.',
      `Pick at most ${MAX_FILES} exact paths from the list. Prefer source files over docs/assets.`,
      "Never invent a path.",
    ].join("\n"),
    `REQUEST:\n${prompt}\n\nFILES:\n${tree.join("\n")}`,
    true,
    { maxTokens: 500 }
  );
  if (!text) return [];
  const parsed = parseJson(text);
  const picked = Array.isArray(parsed?.files) ? parsed.files.map(String) : [];
  return picked.filter((file: string) => tree.includes(file)).slice(0, MAX_FILES);
}

async function proposeEdits(prompt: string, files: FileContent[]): Promise<EditBundle> {
  const text = await groqChat(
    [
      "You are a careful senior engineer editing an existing repository.",
      'Return ONLY JSON: { "summary": string, "edits": [ { "path": string, "content": string } ] }.',
      "Rules:",
      "- Edit only the files provided below.",
      "- Return the FULL new content of each edited file, no markdown fences.",
      "- Preserve existing behavior unless the request asks to change it.",
      "- Keep TypeScript strict-safe. Do not add dependencies unless explicitly asked.",
      "- Never add secrets, telemetry, or destructive scripts.",
      "- If nothing should change, return an empty edits array.",
    ].join("\n"),
    [
      `REQUEST:\n${prompt}`,
      "",
      "FILES:",
      ...files.map((file) => `--- ${file.path} ---\n${file.content}`),
    ].join("\n"),
    true,
    { maxTokens: 4096 }
  );

  if (!text) throw new Error("The model returned nothing. Check the Groq key and quota.");
  const parsed = parseJson(text);
  if (!parsed) throw new Error("The model did not return valid JSON edits.");

  const summary = String(parsed.summary || "AI edit").slice(0, 500);
  const edits = (Array.isArray(parsed.edits) ? parsed.edits : [])
    .map((edit: any) => ({ path: String(edit?.path || ""), content: String(edit?.content ?? "") }))
    .filter((edit: { path: string; content: string }) => !!edit.path && !!edit.content);

  return { summary, edits };
}

async function fail(job: any, message: string): Promise<void> {
  job.status = "failed";
  job.error = redact(message);
  job.updatedAt = new Date();
  await job.save();
}

export async function runCodingJob(jobId: string): Promise<void> {
  await connectDB();
  const job: any = await CodingJob.findById(jobId);
  if (!job || job.status !== "queued") return;

  job.status = "running";
  job.updatedAt = new Date();
  await job.save();

  const repo: CodingRepo | null = resolveCodingRepo(String(job.repoKey));
  if (!repo) return fail(job, `Repository "${job.repoKey}" is not configured. Add it to CODING_REPOS.`);
  if (!groqConfigured()) return fail(job, "No Groq key configured. Add GROQ_API_KEYS on the server.");

  const workDir = path.join(codingTmpRoot(), String(job._id));
  const logs: string[] = [];

  try {
    await fs.rm(workDir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(workDir), { recursive: true });

    const clone = await run("git", ["clone", "--local", "--no-hardlinks", repo.path, workDir], path.dirname(workDir));
    if (!clone.ok) throw new Error(`git clone failed: ${redact(clone.stderr)}`);
    logs.push(`cloned ${repo.key}`);

    // Keep sandbox-only artifacts out of the diff. A symlinked node_modules is
    // not matched by the trailing-slash ignore rule, so exclude it explicitly.
    await fs
      .appendFile(path.join(workDir, ".git/info/exclude"), "\nnode_modules\n.env\n.env.*\n*.log\n")
      .catch(() => undefined);

    const branch = `ai/${String(job._id).slice(-8)}`;
    const checkout = await run("git", ["checkout", "-b", branch], workDir);
    if (!checkout.ok) throw new Error(`git checkout failed: ${redact(checkout.stderr)}`);
    job.branch = branch;
    logs.push(`branch ${branch}`);

    const tree = await collectTree(workDir);
    if (!tree.length) throw new Error("No editable source files were found in this repository.");

    let files = Array.from(job.files || []).map(String).filter((file) => tree.includes(file)).slice(0, MAX_FILES);
    if (!files.length) {
      logs.push("choosing files");
      files = await chooseFiles(String(job.prompt), tree);
    }
    if (!files.length) {
      throw new Error("Could not pick files for this request. Name the files explicitly (for example src/core/id.ts).");
    }
    logs.push(`files: ${files.join(", ")}`);

    const contents = await readFiles(workDir, files);
    if (!contents.length) throw new Error("The selected files could not be read.");

    logs.push("asking the model for edits");
    const bundle = await proposeEdits(String(job.prompt), contents);
    if (!bundle.edits.length) throw new Error("The model returned no edits.");

    const allowed = new Set(contents.map((file) => file.path));
    let written = 0;
    for (const edit of bundle.edits) {
      const relative = edit.path.replace(/\\/g, "/").trim();
      if (!allowed.has(relative)) continue;
      if (Buffer.byteLength(edit.content, "utf8") > MAX_EDIT_BYTES) continue;
      const full = safeRelative(workDir, relative);
      if (!full) continue;
      await fs.writeFile(full, edit.content, "utf8");
      written += 1;
    }
    if (!written) throw new Error("The model proposed no valid file edits for the selected files.");
    logs.push(`wrote ${written} file(s)`);

    const sourceModules = path.join(repo.path, "node_modules");
    const targetModules = path.join(workDir, "node_modules");
    if (existsSync(sourceModules) && !existsSync(targetModules)) {
      try {
        await fs.symlink(sourceModules, targetModules, "dir");
        logs.push("linked node_modules from the source repo");
      } catch {
        // Tests can still run if the project installs dependencies itself.
      }
    }

    await run("git", ["add", "-A"], workDir);
    // A symlinked node_modules is not matched by the repo's "node_modules/"
    // ignore rule, so drop it from the index before producing the diff.
    await run("git", ["reset", "--", "node_modules"], workDir);
    const diff = await run("git", ["diff", "--cached"], workDir);
    const changed = await run("git", ["diff", "--cached", "--name-only"], workDir);
    if (!diff.ok || !diff.stdout.trim()) throw new Error("No diff was produced.");

    const testCommand = codingTestCommand(repo);
    let testOk = true;
    let testOutput = "No test command configured.";
    if (testCommand) {
      logs.push(`running tests: ${testCommand}`);
      const test = await run("sh", ["-lc", testCommand], workDir, TEST_TIMEOUT_MS);
      testOk = test.ok;
      testOutput = tail([test.stdout, test.stderr].filter(Boolean).join("\n"), 8000) || (test.ok ? "Passed." : "Failed.");
    }

    job.summary = bundle.summary;
    job.diff = tail(diff.stdout, MAX_DIFF_BYTES);
    job.changedFiles = changed.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
    job.testCommand = testCommand;
    job.testOk = testOk;
    job.testOutput = testOutput;
    job.workDir = workDir;
    job.logs = logs.join("\n");
    job.status = "needs_review";
    job.updatedAt = new Date();
    await job.save();
  } catch (error) {
    logs.push(`failed: ${(error as Error).message}`);
    job.logs = logs.join("\n");
    await fail(job, (error as Error).message);
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function cleanup(workDir: string): Promise<void> {
  if (!workDir) return;
  await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
}

export async function decideCodingJob(
  jobId: string,
  action: "approve" | "reject"
): Promise<{ ok: boolean; detail: string; prUrl?: string }> {
  await connectDB();
  const job: any = await CodingJob.findById(jobId);
  if (!job) return { ok: false, detail: "Coding job not found." };
  if (job.status !== "needs_review") {
    return { ok: false, detail: `This job is ${job.status}, not waiting for review.` };
  }

  if (action === "reject") {
    job.status = "rejected";
    job.updatedAt = new Date();
    await job.save();
    await cleanup(String(job.workDir || ""));
    return { ok: true, detail: "Rejected. The sandbox was deleted; nothing was pushed." };
  }

  const workDir = String(job.workDir || "");
  if (!workDir || !existsSync(workDir)) {
    job.status = "failed";
    job.error = "The sandbox copy is gone. Re-run the job.";
    job.updatedAt = new Date();
    await job.save();
    return { ok: false, detail: job.error };
  }

  const mode = job.commitMode === "bulk" ? "bulk" : "per-file";
  const summary = String(job.summary || job.prompt || "AI edit").slice(0, 120);
  const commits: string[] = [];

  if (mode === "bulk") {
    await run("git", ["add", "-A"], workDir);
    const message = `ai: ${summary}`.slice(0, 180);
    const commit = await run(
      "git",
      ["-c", "user.name=Jeevant AI", "-c", "user.email=ai@jeevant.local", "commit", "-m", message],
      workDir
    );
    if (!commit.ok) {
      job.status = "failed";
      job.error = redact(`git commit failed: ${commit.stderr}`);
      job.updatedAt = new Date();
      await job.save();
      await cleanup(workDir);
      return { ok: false, detail: job.error };
    }
    commits.push(message);
  } else {
    // One commit per file: easier to review a PR file by file.
    await run("git", ["reset"], workDir);
    for (const file of job.changedFiles || []) {
      const message = `ai: ${summary} — ${file}`.slice(0, 180);
      await run("git", ["add", "--", String(file)], workDir);
      const commit = await run(
        "git",
        ["-c", "user.name=Jeevant AI", "-c", "user.email=ai@jeevant.local", "commit", "-m", message],
        workDir
      );
      if (!commit.ok) {
        job.status = "failed";
        job.error = redact(`git commit failed for ${file}: ${commit.stderr}`);
        job.updatedAt = new Date();
        await job.save();
        await cleanup(workDir);
        return { ok: false, detail: job.error };
      }
      commits.push(message);
    }
  }

  job.commits = commits;

  const token = githubToken();
  const slug = String(job.repoSlug || "");
  let prUrl = "";

  if (token && slug) {
    const authUrl = `https://x-access-token:${token}@github.com/${slug}.git`;
    await run("git", ["remote", "set-url", "origin", authUrl], workDir);
    const push = await run("git", ["push", "origin", String(job.branch)], workDir, 180_000);
    if (!push.ok) {
      job.status = "failed";
      job.error = redact(`git push failed: ${push.stderr}`);
      job.updatedAt = new Date();
      await job.save();
      await cleanup(workDir);
      return { ok: false, detail: job.error };
    }

    try {
      const response = await safeFetch(`https://api.github.com/repos/${slug}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          title: `AI: ${job.summary || job.prompt}`.slice(0, 200),
          head: job.branch,
          base: codingBaseBranch(),
          body: [
            "Generated from the Jeevant mobile app.",
            "",
            `**Request:** ${job.prompt}`,
            "",
            `**Summary:** ${job.summary || "(none)"}`,
            "",
            `**Tests:** ${job.testOk ? "passed" : "failed"}${job.testCommand ? ` (\`${job.testCommand}\`)` : ""}`,
            "",
            "Review the diff before merging.",
          ].join("\n"),
        }),
      });
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        job.status = "failed";
        job.error = `GitHub PR failed: ${data?.message || response.status}`;
        job.updatedAt = new Date();
        await job.save();
        await cleanup(workDir);
        return { ok: false, detail: job.error };
      }
      prUrl = String(data?.html_url || "");
    } catch (error) {
      job.status = "failed";
      job.error = redact(`GitHub PR error: ${(error as Error).message}`);
      job.updatedAt = new Date();
      await job.save();
      await cleanup(workDir);
      return { ok: false, detail: job.error };
    }
  }

  job.status = "approved";
  job.prUrl = prUrl;
  job.updatedAt = new Date();
  await job.save();
  await cleanup(workDir);

  return {
    ok: true,
    detail: prUrl
      ? `Pull request opened: ${prUrl}`
      : "Approved. The diff is saved. No GITHUB_TOKEN/repo slug was configured, so no PR was created.",
    prUrl,
  };
}
