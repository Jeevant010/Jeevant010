// Repository allowlist for the phone coding sandbox. Never accept an arbitrary
// path from the client: only keys listed in CODING_REPOS are usable.
//
//   CODING_REPOS=jeevant-app=/path/to/jeevant-app|Jeevant010/My-OS|npm run build,jeevant=/path/to/jeevant|Jeevant010/Jeevant|npm run typecheck
//
// Parts: key=path|owner/repo|test command. The slug is used only when
// GITHUB_TOKEN is set and the user approves a PR.

import { existsSync, statSync } from "node:fs";

export type CodingRepo = { key: string; path: string; slug: string; testCommand: string };

function parseRepos(): CodingRepo[] {
  return String(process.env.CODING_REPOS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("=");
      if (separator === -1) return null;
      const key = entry.slice(0, separator).trim();
      const rest = entry.slice(separator + 1).trim();
      const [repoPath, slug, testCommand] = rest.split("|").map((part) => part.trim());
      if (!key || !repoPath) return null;
      return { key, path: repoPath, slug: slug || "", testCommand: testCommand || "" };
    })
    .filter((repo): repo is CodingRepo => !!repo);
}

export function codingRepos(): CodingRepo[] {
  return parseRepos();
}

export function publicCodingRepos(): { key: string; slug: string }[] {
  return parseRepos().map((repo) => ({ key: repo.key, slug: repo.slug }));
}

export function codingConfigured(): boolean {
  return parseRepos().length > 0;
}

export function resolveCodingRepo(key: string): CodingRepo | null {
  const repo = parseRepos().find((item) => item.key === key);
  if (!repo) return null;
  try {
    if (!statSync(repo.path).isDirectory()) return null;
    if (!existsSync(`${repo.path}/.git`)) return null;
    return repo;
  } catch {
    return null;
  }
}

export function codingTestCommand(repo?: CodingRepo | null): string {
  return String(repo?.testCommand || process.env.CODING_TEST_CMD || "").trim();
}

export function codingBaseBranch(): string {
  return String(process.env.CODING_BASE_BRANCH || "main").trim() || "main";
}

export function githubToken(): string {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

export function codingTmpRoot(): string {
  return String(process.env.CODING_TMP_DIR || "/tmp/opencode/jv-coding").trim();
}
