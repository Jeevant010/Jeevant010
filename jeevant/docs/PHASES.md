# Build Phases

This is the working ledger for turning Jeevant OS into a genuinely dependable
personal operator. Each phase is independently shippable and has a check you can
run yourself. No phase starts until the previous one is verified.

## Ground truth (read this first)

A browser app — including an installed PWA — **cannot** drive other apps, toggle
system settings, read notifications from other apps, or control the lock screen.
iOS and Android sandbox that away. Anyone claiming otherwise is selling you an
Android accessibility-service hack or a jailbreak.

What actually works, and what these phases build:

| Chore type | How it gets done |
|---|---|
| Write to your own data (tasks, notes, posts, tracker) | Direct, via the agent tools and Mongo |
| Post to Telegram / Discord / Slack / Mastodon | Direct HTTP APIs, no paid tier |
| WhatsApp / SMS / calls | Meta Cloud API or Twilio, or a `wa.me` / `tel:` link |
| Email, calendar blocks, availability | Google APIs with a refresh token |
| Trigger phone automations | The app calls a signed webhook that iOS Shortcuts or Android Tasker/MacroDroid listens for |
| Hand a file to Instagram / LinkedIn | Web Share API → the phone share sheet |
| Receive a share from another app | Android Web Share Target; iOS can't, use the PWA share sheet |

## Phase 1 — Secure base and green CI

**Goal:** a foundation that cannot silently rot.

- [x] `npm run typecheck` and `npm run verify` scripts
- [x] GitHub Actions CI: install → typecheck → lint → build on every push and PR
- [x] Baseline lint made meaningful: `no-explicit-any` and React Compiler rules
      are warnings; the real errors (JSX comment, `prefer-const`) are fixed
- [x] Security headers: `nosniff`, `DENY` framing, referrer policy,
      permissions policy (mic allowed for voice, camera denied), HSTS
- [x] `X-Powered-By` removed
- [x] Session tokens bound to issuer/audience; login comparison is timing-safe;
      `ADMIN_SECRET` fails closed in production if missing or weak
- [x] Session cookie is `httpOnly`, `sameSite=lax`, `secure` in production
- [x] TTL-aware client state store (`lib/client/state.ts`) with quota recovery,
      expiry sweep, namespace clear, and stats
- [x] Reminder dedupe list migrated to the TTL store (30-day expiry, capped)
- [x] Service worker v2: private routes and `/api` are never cached, shell assets
      expire after 7 days, immutable `_next/static` cached, offline fallback
- [x] `public/offline.html` contains no personal data

**Verification:** `cd jeevant && npm run verify`. Then log in, open DevTools →
Application → Service Worker, confirm `jeevant-shell-v2`, and confirm
`localStorage` keys are prefixed `jv:`.

## Phase 2 — Action Bridge (the honest chore layer)

**Goal:** one tap, or one phone shortcut, actually finishes a chore.

- [x] Hashed, expiring action tokens at `/api/actions/run/<token>`; the raw token
      is shown once and only the hash is stored
- [x] Single-use by default, reusable only when explicitly requested, revocable,
      and deleted automatically at expiry
- [x] Atomic claim prevents replay and concurrent double-use; used, expired, and
      revoked links return `410 Gone`
- [x] Action registry with a server-side whitelist and shared field validation:
      `create_task`, `complete_task`, `create_note`, `block_time`,
      `start_focus`, `end_focus`, `log_activity`, `start_activity`,
      `stop_activity`, `open_page`, `request_approval`
- [x] `/actions` admin UI: create, copy-once, list, status, use counts, result,
      revoke, and the phone recipe
- [x] iOS Shortcuts and Android Tasker/MacroDroid recipes in the UI and
      [`docs/BRIDGE.md`](./BRIDGE.md)
- [x] Every run writes to `AuditLog`; external actions still queue approvals
- [x] `block_time` detects overlaps and says so in the receipt
- [x] Dashboard quick actions: block 60m, start/end focus, log 30m, and add a
      task, each with a receipt and a board refresh

**Acceptance:** create a reusable `create_task` link, run it twice, revoke it,
and confirm the third run returns `410` with no new task. Check `/guardrails` for
two `executed` audit rows.

## Phase 3 — Credential vault and real transports

**Goal:** paste credentials once, then post from phone or desktop.

- [x] `/accounts` accepts guided fields or a raw JSON paste, structured or flat
- [x] Secret keys are detected, stored server-side, and only their names are
      shown in the browser
- [x] Read-only "Test connection" per account: Telegram, WhatsApp, Twilio,
      Discord, Slack, Mastodon, Google, X
- [x] Honest capability matrix per channel: direct, webhook, share, or manual,
      with no fake success
- [x] Default accounts are merged into runtime config, so Telegram, Discord,
      Slack, Mastodon, and WhatsApp transports use them automatically
- [x] Mobile-first composer already works at phone width; direct-send and
      share-sheet paths are unchanged
- [ ] X, LinkedIn, and Reddit real posting (needs approved developer apps; share
      intent is the honest fallback today)
- [ ] Secrets encrypted at rest (Phase 5)
- [ ] Rate-limit and quota counters (Phase 6)

**Acceptance:** paste a Telegram bot token and chat id, press Test, and see the
bot username. Send a post to Telegram from `/studio` on a phone-width viewport
and confirm the dispatch log row.

## Phase 4 — Google layer

**Goal:** the time savings that actually matter.

- [x] Gmail read and search with metadata parsing, unread state, and body
      extraction (`lib/integrations/gmail-read.ts`)
- [x] Three-bullet message summaries and one-shot inbox digests, with a
      deterministic fallback when Groq is not configured
- [x] Reply drafting in the learned style, queued as an email approval; the
      approval creates the Gmail draft
- [x] Calendar `freeBusy`, conflict detection, upcoming events, and first-free
      slot search on a 15-minute grid inside working hours
- [x] "Schedule this" checks conflicts and queues a calendar approval; the
      approval writes to Google Calendar
- [x] Agent tools: `gmail_search`, `read_email`, `summarize_email`,
      `email_digest`, `draft_email_reply`, `check_availability`,
      `upcoming_events`, `schedule_block`
- [x] Mobile-friendly `/inbox` and `/inbox/[id]` pages, plus sidebar entry
- [x] Explicit scope errors that name the OAuth scope to add
- [x] Overnight digest includes real Gmail unread summaries when Google is
      configured, and falls back to the `Message` collection
- [x] Thread-aware reply drafts (`threadId`, `In-Reply-To`, `References`) and
      attachment metadata (name, type, size)
- [ ] Attachment download and parsing

**Acceptance:** search `in:inbox newer_than:7d`, open one message, see a summary,
queue a reply, and approve it. Then ask the assistant "when am I free tomorrow
for 90 minutes" and confirm it returns a real slot, not a guess.

## Phase 5 — Privacy and retention

**Goal:** defensible privacy, not a privacy claim.

- [x] Credential secrets encrypted at rest with AES-256-GCM and a per-record
      salt; key derived from `ADMIN_SECRET`
- [x] Legacy plaintext secrets stay readable, with `npm run secrets:encrypt` to
      migrate them
- [x] Mongo TTL retention for chat (90d), audit (180d), and outbound messages
      (180d), configurable by env
- [x] Full JSON export with credential values replaced by key names and token
      hashes stripped
- [x] Two-tier deletion on `/privacy`: activity data, or everything, both
      confirmation-gated; guardrail settings always survive
- [x] Token, bearer, password, and phone-number redaction in audit logs and
      approval results
- [x] Safe CSP directives enforced; full policy report-only so nothing breaks
- [x] Threat model and data-flow document (`docs/PRIVACY.md`)
- [ ] Nonce-based strict CSP enforcement
- [x] Non-secret config (phone numbers, chat ids) encrypted at rest too
- [x] Backup-aware deletion guidance in `docs/PRIVACY.md`

**Acceptance:** run `npm run secrets:encrypt`, confirm `/accounts` still tests a
credential, download the export, and verify a deleted activity record is gone
from MongoDB while a project remains.

## Phase 6 — Reliability and reach

**Goal:** it still works when the network, a key, or a tab is not cooperating.

- [x] Web Push with VAPID: subscription model, service worker push and click
      handlers, on-device setup panel, test endpoint, and a reminder cron
- [x] Push removes dead subscriptions on `404`/`410` and only marks a reminder
      pushed when a notification actually sent
- [x] In-memory rate limiting on login, agent, bridge, account tests, and export
- [x] Node test suite (19 tests) for validation, encryption, redaction, rate
      limiting, and theme routing, wired into CI
- [x] Bundle budget in CI (1800 KB limit, current ~1403 KB)
- [x] Health endpoint reports `ok`/`degraded`/`down` with failed and stuck jobs,
      pending approvals, and push subscribers
- [x] `docs/RELIABILITY.md` with setup, thresholds, and limits
- [x] Shared `safeFetch` with a 10-second timeout and a per-host circuit breaker
      across Groq, Gemini, Google, Gmail, Calendar, channels, messaging, and tools
- [x] Mongo-backed distributed rate limiting with an in-memory fallback
      (`RATE_LIMIT_STORE=memory`)
- [ ] Lighthouse CI

**Acceptance:** enable push on a phone, receive the test, then let the reminder
cron fire a due task with the app closed. `npm run verify` must pass, including
tests and the bundle budget.

## Deliberately not promised

- Controlling other apps, system settings, alarms, music, or HomeKit from the PWA
- Silent posting to Instagram, LinkedIn, or X without their approved APIs
- Reading other apps' notifications
- Wake-word listening in the background
