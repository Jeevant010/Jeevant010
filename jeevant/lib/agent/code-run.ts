// Restricted code runner for the run_code tool.
//
// This is not a container. It is a best-effort subprocess sandbox:
// - no server env/secrets are passed in,
// - JavaScript runs under Node's permission model (filesystem outside the temp
//   dir is denied) with network/child-process modules patched off,
// - Python runs with an audit hook that blocks network, subprocesses, ctypes,
//   and file access outside the temp dir/stdlib,
// - a hard timeout and output cap apply.
//
// Code execution needs a persistent Node host. It is intentionally disabled on
// Vercel, where a reproducible sandbox is not available.

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type CodeLanguage = "javascript" | "python";

export type CodeResult = {
  ok: boolean;
  result: string;
  data?: {
    language: CodeLanguage;
    exitCode: number | null;
    timedOut: boolean;
    stdout: string;
    stderr: string;
    artifacts: { name: string; bytes: number }[];
  };
};

const MAX_CODE_BYTES = 20_000;
const MAX_OUTPUT_BYTES = 32_000;
const DEFAULT_TIMEOUT_MS = 15_000;

const NODE_GUARD = `
const net = require("node:net");
const tls = require("node:tls");
const dns = require("node:dns");
const dgram = require("node:dgram");
const http2 = require("node:http2");
const cp = require("node:child_process");

function blocked() {
  throw new Error("Network and process spawning are blocked in run_code.");
}

net.Socket.prototype.connect = blocked;
net.connect = blocked;
net.createConnection = blocked;
dns.lookup = blocked;
dns.resolve = blocked;
dns.resolve4 = blocked;
dns.resolve6 = blocked;
tls.connect = blocked;
http2.connect = blocked;
dgram.createSocket = blocked;
for (const key of ["spawn", "exec", "execFile", "fork", "spawnSync", "execSync", "execFileSync"]) {
  cp[key] = blocked;
}

globalThis.fetch = async () => blocked();
globalThis.WebSocket = class {
  constructor() {
    blocked();
  }
};
`;

const PYTHON_GUARD = `
import os as _os
import sys as _sys

_ROOT = _os.path.realpath(_os.getcwd())
_ALLOWED = tuple(
    _os.path.realpath(p)
    for p in {_sys.prefix, _sys.base_prefix}
    if isinstance(p, str) and p
)

def _inside(value):
    try:
        text = _os.fspath(value)
    except TypeError:
        return False
    if isinstance(text, bytes):
        text = text.decode("utf-8", "replace")
    if not text or text.startswith(("http://", "https://")):
        return True
    resolved = _os.path.realpath(text)
    if resolved == _ROOT or resolved.startswith(_ROOT + _os.sep):
        return True
    return any(resolved == root or resolved.startswith(root + _os.sep) for root in _ALLOWED)

def _guard(event, args):
    if event in ("subprocess.Popen", "os.system", "os.exec", "os.spawn", "ctypes.dlopen"):
        raise PermissionError("Process spawning is blocked in run_code: " + event)
    if event.startswith("socket."):
        raise PermissionError("Network is blocked in run_code.")
    if event in ("open", "os.listdir", "os.scandir", "os.remove", "os.rename", "os.rmdir", "os.mkdir", "os.chmod"):
        if args and not _inside(args[0]):
            raise PermissionError("File access outside the sandbox is blocked: " + str(args[0]))
    if event == "os.chdir" and args and not _inside(args[0]):
        raise PermissionError("Changing directory outside the sandbox is blocked.")

_sys.addaudithook(_guard)
`;

export function normalizeCodeLanguage(value: unknown): CodeLanguage | null {
  const text = String(value || "").toLowerCase().trim();
  if (text === "javascript" || text === "js" || text === "node" || text === "typescript" || text === "ts") {
    return "javascript";
  }
  if (text === "python" || text === "py" || text === "python3") return "python";
  return null;
}

export function codeExecutionAvailable(): boolean {
  if (process.env.VERCEL) return false;
  return String(process.env.CODE_SANDBOX_ENABLED || "true").toLowerCase() !== "false";
}

export function codeExecutionUnavailableReason(): string {
  if (process.env.VERCEL) {
    return "run_code needs a persistent host; Vercel serverless functions do not provide the sandbox. The coding sandbox is available only on a VPS/local server.";
  }
  if (String(process.env.CODE_SANDBOX_ENABLED || "true").toLowerCase() === "false") {
    return "Code execution is disabled. Set CODE_SANDBOX_ENABLED=true on a host that has Node and Python installed.";
  }
  return "";
}

async function collectArtifacts(dir: string): Promise<{ name: string; bytes: number }[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const artifacts: { name: string; bytes: number }[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (["main.js", "main.py", "guard.cjs", "input.json"].includes(entry.name)) continue;
      const stat = await fs.stat(path.join(dir, entry.name));
      if (stat.size <= 500_000) artifacts.push({ name: entry.name, bytes: stat.size });
    }
    return artifacts.slice(0, 20);
  } catch {
    return [];
  }
}

export async function executeCode(
  language: CodeLanguage,
  code: string,
  input?: unknown
): Promise<CodeResult> {
  if (!codeExecutionAvailable()) {
    return { ok: false, result: codeExecutionUnavailableReason() };
  }
  const source = String(code || "").trim();
  if (!source) return { ok: false, result: "No code was provided." };
  if (Buffer.byteLength(source, "utf8") > MAX_CODE_BYTES) {
    return { ok: false, result: `Code is too large (limit ${MAX_CODE_BYTES} bytes).` };
  }

  const dir = path.join(os.tmpdir(), "jeevant-code", randomUUID());
  await fs.mkdir(dir, { recursive: true });

  const isPython = language === "python";
  const mainFile = path.join(dir, isPython ? "main.py" : "main.js");
  const guardFile = path.join(dir, "guard.cjs");
  const body = isPython ? `${PYTHON_GUARD}\n\n${source}\n` : source;

  try {
    await fs.writeFile(mainFile, body, "utf8");
    if (!isPython) await fs.writeFile(guardFile, NODE_GUARD, "utf8");
    if (input !== undefined) {
      await fs.writeFile(path.join(dir, "input.json"), JSON.stringify(input), "utf8");
    }

    const timeoutMs = Math.min(
      Math.max(Number(process.env.CODE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS, 2000),
      30_000
    );
    const env: Record<string, string> = {
      PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
      HOME: dir,
      TMPDIR: dir,
      LANG: "C.UTF-8",
      ...(isPython ? { PYTHONIOENCODING: "utf-8", PYTHONDONTWRITEBYTECODE: "1" } : {}),
    };

    const command = isPython ? process.env.PYTHON_BIN || "python3" : process.execPath;
    const args = isPython
      ? ["-I", "-S", mainFile]
      : [
          "--permission",
          `--allow-fs-read=${dir}`,
          `--allow-fs-write=${dir}`,
          "--require",
          guardFile,
          mainFile,
        ];

    const outcome = await new Promise<{
      exitCode: number | null;
      timedOut: boolean;
      stdout: string;
      stderr: string;
      error?: string;
    }>((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;
      const child = spawn(command, args, {
        cwd: dir,
        env: { ...env, NODE_ENV: process.env.NODE_ENV || "production" } as NodeJS.ProcessEnv,
        stdio: ["ignore", "pipe", "pipe"] as const,
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, timeoutMs);

      const append = (current: string, chunk: Buffer): string => {
        if (current.length >= MAX_OUTPUT_BYTES) return current;
        return (current + chunk.toString("utf8")).slice(0, MAX_OUTPUT_BYTES);
      };

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = append(stdout, chunk);
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr = append(stderr, chunk);
      });
      child.on("error", (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ exitCode: null, timedOut, stdout, stderr, error: error.message });
      });
      child.on("close", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ exitCode: code, timedOut, stdout, stderr });
      });
    });

    const artifacts = await collectArtifacts(dir);
    const parts: string[] = [];
    if (outcome.timedOut) parts.push(`Timed out after ${timeoutMs}ms.`);
    if (outcome.error) parts.push(outcome.error);
    if (outcome.stdout.trim()) parts.push(outcome.stdout.trim());
    if (outcome.stderr.trim()) parts.push(`stderr:\n${outcome.stderr.trim()}`);
    if (artifacts.length) parts.push(`files: ${artifacts.map((file) => `${file.name} (${file.bytes}B)`).join(", ")}`);
    if (!parts.length) parts.push("Code ran with no output.");

    const result = parts.join("\n\n").slice(0, MAX_OUTPUT_BYTES);
    return {
      ok: !outcome.timedOut && !outcome.error && outcome.exitCode === 0,
      result,
      data: {
        language,
        exitCode: outcome.exitCode,
        timedOut: outcome.timedOut,
        stdout: outcome.stdout,
        stderr: outcome.stderr,
        artifacts,
      },
    };
  } catch (error) {
    return { ok: false, result: (error as Error).message };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
