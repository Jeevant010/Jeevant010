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
- [ ] Dashboard "run now" tiles (deferred; `/actions` covers manual use)

**Acceptance:** create a reusable `create_task` link, run it twice, revoke it,
and confirm the third run returns `410` with no new task. Check `/guardrails` for
two `executed` audit rows.

## Phase 3 — Credential vault and real transports

**Goal:** paste credentials once, then post from phone or desktop.

- `/accounts` guided + raw JSON paste, with a "Test connection" button per account
- Transport capability matrix shown honestly per channel:
  direct / link / manual, and why
- Transports: Telegram, Discord, Slack, Mastodon, WhatsApp Cloud API, email,
  Reddit, X (token or OAuth PKCE), LinkedIn (approved-app token only)
- Secrets encrypted at rest; never sent to the browser; masked in logs
- Per-account rate-limit and quota counters with visible remaining budget
- Mobile-first composer with copy, share-sheet, and direct-send paths

**Acceptance:** paste a Telegram bot token and a Discord webhook, hit test, post
from a phone, and see the dispatch log entry. WhatsApp without credentials must
still produce a working `wa.me` link, never a fake "sent".

## Phase 4 — Google layer

**Goal:** the time savings that actually matter.

- Gmail read/search (requires the read scope), thread summary, reply drafting
- Calendar availability lookup, conflict detection, and "schedule this" that
  proposes the first free slot instead of guessing
- Agent tools: `check_availability`, `schedule_block`, `email_digest`,
  `draft_reply_from_email`
- Overnight digest built from real mail, not just the `Message` collection

**Acceptance:** "when am I free tomorrow for 90 minutes" returns a real slot from
Google Calendar, and creating it appears in Google Calendar.

## Phase 5 — Privacy and retention

**Goal:** defensible privacy, not a privacy claim.

- Strict CSP with nonces (report-only first, then enforce)
- Secrets encrypted at rest with a key derived from `ADMIN_SECRET`
- Retention policy with Mongo TTL indexes: chat, audit, jobs, activity
- Data export and hard delete for personal records
- Redaction of tokens and phone numbers in logs and error messages
- Threat model document covering what leaves the device and to whom

**Acceptance:** export produces a complete archive; delete removes every record;
turning on `blocked` mode stops queued approvals from executing.

## Phase 6 — Reliability and reach

**Goal:** it still works when the network, a key, or a tab is not cooperating.

- Web Push with VAPID so reminders fire with the phone locked
- Rate limiting on auth and agent endpoints
- Timeouts and circuit breakers for every outbound provider
- Unit tests for guardrails and tool argument validation
- Bundle budget and a Lighthouse check in CI
- Metrics endpoint plus alert thresholds for failed jobs and approvals

**Acceptance:** a lock-screen reminder arrives with the app closed; a dead
provider degrades to a documented fallback instead of a hang.

## Deliberately not promised

- Controlling other apps, system settings, alarms, music, or HomeKit from the PWA
- Silent posting to Instagram, LinkedIn, or X without their approved APIs
- Reading other apps' notifications
- Wake-word listening in the background
