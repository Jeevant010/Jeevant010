# Reliability and reach

## Web Push

Reminders can reach the lock screen with the app closed. This needs VAPID keys,
HTTPS, and a cron hit.

1. Generate keys once:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Put them in `.env.local`:

   ```
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:you@example.com
   ```

3. Open `/assistant` and press **Enable push** on the device.
4. Press **Send test** to confirm.
5. Point a scheduler at the reminder cron every minute:

   ```bash
   curl "https://your-host/api/cron/reminders" -H "Authorization: Bearer $CRON_SECRET"
   ```

It sends tasks whose `dueDate` is within the last 10 minutes or next 5 minutes,
marks `reminderPushedAt` only when a notification actually went out, and removes
subscriptions the provider reports as gone (`404`/`410`).

### Platform notes

- **HTTPS is required** except on `localhost`.
- **iPhone**: add the app to the Home Screen first. Web Push on iOS needs 16.4+
  and the installed PWA, not a Safari tab.
- **Android/desktop**: works from the installed PWA or a normal tab.
- The service worker shows the notification and focuses/opens the target page on
  click.
- Without VAPID keys the panel says "not configured" and nothing fails silently.

## Rate limits

In-memory sliding windows, applied per IP. Limits reset when the process
restarts.

| Endpoint | Limit |
|---|---|
| Login | 10 attempts / 10 minutes |
| Agent (JSON and stream) | 30 / minute |
| Bridge run | 30 / minute |
| Bridge preview | 60 / minute |
| Account test | 20 / minute |
| Privacy export | 5 / minute |

This is per instance. On a multi-instance deployment, replace the store with
Redis or a Mongo-backed counter; the interface is one function,
`rateLimit(key, limit, windowMs)`.

## Health

`GET /api/health` returns:

- `status`: `ok`, `degraded`, or `down`
- `queue`: queued, running, failed, done, and `stuck` (running over 10 minutes)
- `approvals.pending`
- `push.subscriptions`
- provider configuration flags

Thresholds: `degraded` when the DB is down, failed jobs are 5 or more, a job is
stuck, or 50+ approvals are pending.

## Tests

```bash
npm test
```

Nineteen tests cover bridge argument validation, secret sealing and tampering,
log redaction, the rate limiter, and page-theme routing. They use Node's built-in
test runner through `tsx`, so there is no extra test framework.

Not covered yet: DB-backed guardrail execution, provider adapters, and browser
push end to end.

## Bundle budget

```bash
npm run build && npm run budget
```

CI fails above 1800 KB of `.next/static/chunks`. The current build is about
1403 KB. Raise `BUNDLE_BUDGET_KB` deliberately, not accidentally.

## Timeouts

Read-only probes and the Gmail/Calendar readers use an 8-second
`AbortSignal.timeout`. The older Groq, Gemini, and channel adapters still rely on
platform defaults; adding a shared timeout wrapper is the next reliability task.

## Honest limits

- Push needs a reachable public HTTPS origin. A laptop on `localhost` can test,
  but a phone on the LAN needs HTTPS or a tunnel.
- There is no background wake-word or OS-level automation; push is the only
  background channel.
- Rate limits are not distributed.
- There is no Lighthouse CI yet; typecheck, lint, tests, build, and the bundle
  budget are the current gates.
