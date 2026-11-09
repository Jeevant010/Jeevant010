# Phone coding sandbox

Change a repo from the phone: clone → AI edits → diff → tests → your approval →
optional PR. No laptop and no on-device model.

## Setup

Add an allowlist on the server. Only these repos are accepted; the client can
never send an arbitrary path.

```env
# key = absolute path | owner/repo (optional) | test command (optional)
CODING_REPOS=jeevant-app=/home/jeevant/Desktop/Jeevant/jeevant-app|Jeevant010/My-OS|npm run build
# Fallback when a repo does not declare its own test command:
CODING_TEST_CMD=
CODING_BASE_BRANCH=main
CODING_TMP_DIR=/tmp/opencode/jv-coding
# Optional: push the approved branch and open a PR
GITHUB_TOKEN=
```

- The repo must be a git repository (`<path>/.git`).
- The test command runs with `sh -lc` inside the temp clone, with a 180s timeout.
- If the source repo has `node_modules`, the sandbox symlinks it into the clone
  so tests run without reinstalling. The symlink is excluded from the diff.

## Flow

1. The phone posts `{ repo, prompt, files?, commitMode }` to
   `POST /api/mobile/code`.
2. A `CodingJob` is created and the runner clones the repo into
   `CODING_TMP_DIR/<jobId>` on a new `ai/<id>` branch.
3. Files are chosen from the request, or by the model from `git ls-files`.
4. Groq returns full new file contents for the selected files.
5. The runner writes them, builds a `git diff`, and runs the test command.
6. The job stops at `needs_review` with the diff, changed files, and test output.
7. `POST /api/mobile/code/<id>` with `{ action: "approve" | "reject" }`:
   - reject deletes the sandbox;
   - approve commits, then optionally pushes and opens a PR.
8. The temp clone is deleted after the decision.

## Commit strategy

- `per-file` (default): one commit per changed file, so a PR can be reviewed
  file by file. Commit messages look like
  `ai: <summary> — src/core/id.ts`.
- `bulk`: one commit with all changes.

The test command runs against the final state, not after each per-file commit.

## Safety

- Only `CODING_REPOS` entries are accepted.
- Edits are limited to the selected files.
- `.env`, lockfiles, `.git`, `node_modules`, `dist`, `.next`, and build output
  are blocked.
- Path traversal is rejected; every write is resolved inside the clone.
- No push happens before approval.
- `GITHUB_TOKEN` is placed in the temporary remote URL and the clone is deleted
  after the decision. Prefer a fine-grained token scoped to the repo.
- The local runner executes the repo's test command on the server host. For a
  shared/company deployment, run this inside Docker or E2B instead.

## Serverless note

The job starts after the HTTP response (`void runCodingJob`). This is fine on a
VPS or any long-running Node host. On a serverless host, move the runner into the
durable `Job` queue and drain it from `/api/cron/worker`.
