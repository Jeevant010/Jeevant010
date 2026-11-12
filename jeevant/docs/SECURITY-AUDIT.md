# Security Audit — 2026-11-12

This audit covers the single-user Jeevant OS: backend API, agent tools, approvals,
connectors, code execution, Android packaging, and dependencies. It is a personal
sideload build, not a multi-tenant SaaS.

## Verdict

The guardrail model is sound for one trusted user:

- internal database writes run directly;
- outbound actions are approval-gated;
- emergency stop blocks external actions;
- native SMS/call/accessibility are manual and not AI-callable;
- connector, code, and UI actions have explicit risk handling;
- production dependency audit is clean.

It is **not** hardened for untrusted users or a public multi-tenant service. The
remaining gaps are listed below.

## Fixed in this audit

### 1. Cron endpoints failed open

Before: if `CRON_SECRET` was missing, `/api/cron/worker`, `/api/cron/dispatch`,
and `/api/cron/reminders` could be called anonymously.

Now:
- missing `CRON_SECRET` returns `503` in production/Vercel;
- secrets are compared in constant time;
- query-string secrets are no longer accepted;
- use `Authorization: Bearer CRON_SECRET` or `x-cron-secret`.

### 2. Webhook endpoint had no rate limit

`/api/hooks/[key]` now:
- rate-limits by client IP (60/minute);
- rejects malformed keys before database lookup.

### 3. Android backup and cleartext exposure

Before: `allowBackup=true`, `usesCleartextTraffic=true`.

Now:
- `allowBackup=false`, `fullBackupContent=false`;
- cleartext traffic is disabled globally;
- `network_security_config.xml` allows cleartext only for `localhost`,
  `127.0.0.1`, and the emulator host `10.0.2.2`;
- live traffic must be HTTPS.

### 4. Debug-signed APK

Before: the installable APK was a debug build.

Now:
- a release APK is signed with a dedicated keystore;
- release is not debuggable;
- keystore and password file live outside the repo at:
  - `~/.jv-toolchain/jeevant-release.jks`
  - `~/.jv-toolchain/jeevant-release.env` (chmod 600)
- certificate SHA-256:
  `dabd47522958ea1b36793ade0fba3a186bdfb8e047f4656903079ec51c0ae410`

Back up both files. If the keystore is lost, you cannot update the installed app;
you would have to uninstall and lose local data.

### 5. Vulnerable backend dependencies

Updated:
- Next.js `16.4.6`
- Mongoose `9.12.1`
- sharp `0.35.5`

`npm audit --omit=dev` now reports **0 vulnerabilities**. Remaining dev-only
warnings are lint tooling and are not shipped to production.

## Verified controls

### Authentication and authorization
- Admin web pages are protected by signed cookie sessions.
- Mobile APIs require a bearer token except login, health, and the public push key.
- Mobile login is rate-limited and compares the secret in constant time.
- Action-link tokens are random, hashed at rest, expiring, usage-limited, and rate-limited.
- Agent, code, connector, voice, metrics, and approval routes all require auth.

### Approvals and guardrails
- Every outbound action creates an `Approval`; no auto-send path exists.
- Approval execution re-checks the emergency stop before running.
- HTTP approvals require an allowlisted host or a connector host.
- MCP tools default to external risk unless marked read-only.
- OpenAPI POST/PUT/PATCH/DELETE queue for approval.
- UI actions only mark `needs_action` on the server; the phone must tap Run.
- Code execution queues an approval and shows the code before running.
- Audit log records external decisions.

### Native Android
- SMS, calls, contacts, microphone, notifications, and accessibility are runtime
  permissions.
- The AI has no native tool to send SMS, place calls, read notifications, or
  invoke accessibility directly.
- Accessibility sequences are user-initiated from Approvals.
- Notification listener and accessibility services are protected by Android's
  bind permissions.

### Connectors and code
- Connector secrets are AES-256-GCM encrypted and never returned to the app.
- Connector writes queue approvals.
- `http_request` without a connector requires a host allowlist.
- `read_url` blocks localhost/private/link-local hosts.
- `run_code` strips server env, times out, caps output, and:
  - JavaScript: Node permission model + network/subprocess/fetch patched off;
  - Python: audit hook blocks network, subprocesses, ctypes, and file access
    outside its temp dir/stdlib.
- `run_code` is disabled on Vercel.

## Remaining risks and limitations

1. **Single admin secret.** No MFA, no per-device revocation, one-week bearer
   tokens. Fine for one person; not for a team.
2. **Mobile token in localStorage.** Backups are disabled, but a rooted or
   compromised phone can read it. A future release should use Android Keystore.
3. **Connectors can reach internal hosts.** They are admin-only. Only add MCP or
   OpenAPI servers you trust.
4. **`run_code` is best-effort, not a hardened container.** Approve only code you
   understand. A VPS/container is the right long-term host.
5. **Action-link tokens are in URLs.** They are short-lived and single-use by
   default, but URLs can appear in logs. Do not share them.
6. **No external monitoring or backup automation.** Add Atlas backups and an
   uptime check.
7. **Sideload distribution.** SMS, call, contacts, notification-listener, and
   accessibility permissions make Play Store distribution impractical.
8. **Debug/local HTTP is restricted.** For LAN testing use `adb reverse` or the
   live HTTPS backend.
9. **Live backend is outdated.** Deploy the current repo before using the new
   security and mobile routes.

## Required production configuration

- `ADMIN_SECRET`: 32+ random characters, never the example value.
- `CRON_SECRET`: required for scheduled jobs.
- `MONGODB_URI`: database user restricted to the app database.
- Google OAuth: Gmail/Calendar/People scopes as needed.
- HTTPS only; the release APK enforces it.
- Back up the release keystore and password file.
- Back up MongoDB.
- Rotate any secret that has been shared in chat or logs.

## Voice execution behavior (important)

- A spoken command such as “add task…” or “start focus…” executes immediately.
- A spoken outbound command such as “message Rahul…” **queues an approval**.
- Approval still requires a tap in the Approvals screen.
- The assistant does not approve its own outbound actions. This is intentional.
- Multiple internal actions can be planned in one turn.
- There is no autonomous background loop. “Keep going” must be a new request.
- UI automation requires approval, then a manual “Run on this phone” tap.

This is the correct safety boundary. Voice approval of outbound actions was not
enabled because it would let a misheard phrase send a message or make a call.
