# Personal Readiness — Jeevant OS 0.12.0

This is the current, honest state for **one user: you**. It supersedes older
feature docs that described earlier builds.

## Verdict

**Fit for daily personal use after deployment and one real-device test.**

It is not “finished”, but the core is there: assistant, voice, memory, tasks,
notes, reminders, focus, contacts, mail, calendar, approvals, content, coding,
connectors, and reliability controls.

**Not ready as a business/SaaS.** Accounts, billing, onboarding, distribution,
compliance, support, and multi-tenant isolation are still missing. Do not build
those until a second person actually needs access.

---

## What you have

### Assistant
- Text and voice chat.
- Deterministic commands plus LLM planning.
- Tool retrieval and dynamic discovery.
- Persona: name, tone, language.
- Relevant memory + conversation context.
- MCP and OpenAPI connectors.
- Restricted code execution and public-page reading.
- Android UI actions, approval-gated.
- Reliability metrics, golden evals, safe retries, tool disable.

### Daily OS
- Tasks and daily planner.
- Notes.
- Reminders.
- Focus sessions.
- Activity/time tracking.
- Morning briefing and day summary.
- Approvals inbox.

### Communication
- Contacts and phone import.
- SMS and calls after permission + confirmation.
- WhatsApp approvals, with direct transport only if configured; otherwise link/manual.
- Gmail search, read, summarize, draft.
- Google Calendar availability, events, queued blocks.
- Meetings and people sync.

### Content and coding
- Content Studio and multi-channel drafts.
- Templates and learned writing style.
- Coding jobs: diff, tests, approval, PR.
- `run_code` sandbox (persistent host only).

### Mobile
- Native Android APK.
- Native TTS and Android speech recognition.
- Hands-free voice with barge-in.
- Network/battery policy and local fallback.
- Connector management.
- Reliability dashboard.
- Release-signed, non-debuggable build.

### Web/back office
- Portfolio CMS.
- Projects, journey, resume, career, learning.
- Media, templates, style.
- Automations and integrations.
- Guardrails, approvals, audit, privacy export.

Numbers: 43 data models, 51 API routes, 30+ private pages, 13 mobile feature
areas, 56 backend tests, 63 golden evals.

---

## What is still local, not live

The live backend is running an older build. These routes return 404 live:

- `/api/mobile/connectors`
- `/api/mobile/persona`
- `/api/mobile/voice/turn`
- `/api/mobile/metrics`

Deploy first:

```bash
cd /home/jeevant/Desktop/Jeevant/jeevant
vercel --prod
```

Set at minimum:
- `ADMIN_SECRET` (32+ random characters)
- `CRON_SECRET` (required now)
- `MONGODB_URI`
- Google OAuth values if using Gmail/Calendar
- `GROQ_API_KEYS`

No new key was created for the assistant. The phone uses the live admin secret.

---

## Install the release APK

Use this APK, not the older debug APK:

- `/home/jeevant/Desktop/Jeevant/Jeevant-0.12.0-release.apk`
- SHA-256: `e32aef7191cc01eca943d5b266f4dd9788133d681fe3efc3567ef6a42cbc7706`
- Version: `0.12.0`, `versionCode 8`
- Release-signed; backups disabled; cleartext blocked except localhost.

If you previously installed any debug build, uninstall it first. Android will not
install a release-signed APK over a debug-signed one.

Release signing files (back these up):
- `~/.jv-toolchain/jeevant-release.jks`
- `~/.jv-toolchain/jeevant-release.env`

If you lose them, future updates require uninstalling the app.

---

## Phone setup

1. Install the release APK.
2. Connect to `https://jeevant.is-a.dev` with the live admin secret.
3. Grant:
   - microphone
   - contacts
   - SMS
   - calls
   - notifications
   - accessibility only if you want UI actions
4. Verify Google:
   - Gmail read/draft
   - Calendar read/schedule
   - People API + contacts scope for sync
5. Set Settings → Network & AI to your preference. Default is Wi-Fi only.
6. Set persona name/tone/language.
7. Add a trusted MCP or OpenAPI connector if you have one.
8. Run Settings → Reliability → golden evals.

---

## Acceptance test

Do these in order:

1. “Add task: test personal readiness.”
2. “List tasks.”
3. “Note: test | this works.”
4. “Remind me in 20 minutes to stretch.”
5. “Start focus on readiness.”
6. “End focus.”
7. “What’s my briefing?”
8. “List approvals.”
9. “Read my latest email.”
10. “When am I free tomorrow afternoon?”
11. “Message Rahul: hello.” → must queue an approval, not send.
12. Voice: “Add task: voice works.” → executes locally.
13. Voice: “Message Rahul: hello.” → queues approval; tap Approve separately.
14. Ask a general question twice → second may show provider `cache`.
15. Settings → Reliability → run evals → expect 63/63.
16. Turn on emergency stop → external action must fail.
17. Resume approvals.
18. Disable a tool such as `weather` → weather must fail safely.
19. Re-enable it → weather works again.
20. Optional: add a connector and call one read-only tool.

If these pass, it is ready for daily personal use.

---

## What voice can and cannot do

Can:
- add/complete/delete tasks;
- save/search notes;
- set reminders;
- start/stop focus;
- open pages;
- ask for a briefing/day summary;
- run multiple internal actions in one spoken request;
- read mail/calendar when cloud AI is allowed;
- queue messages/calls/emails/calendar blocks/posts for approval.

Cannot:
- send an outbound message or make a call without a separate approval tap;
- approve its own outbound actions;
- run background loops or keep working after the turn;
- invoke SMS/call/notification/accessibility directly;
- guarantee fully offline speech; Android speech recognition may depend on the
  device language pack.

This is deliberate. Voice approval of outbound actions would let a misheard
phrase send a message or place a call.

---

## What is missing for business

Only relevant if you sell this:

- accounts, workspaces, roles, tenant isolation;
- billing, plans, quotas, invoices;
- onboarding, admin console, support;
- MFA, device/session management, secrets manager;
- legal: terms, privacy, DPA, GDPR/DPDP, data deletion;
- distribution: Play Store restrictions for SMS/call/contacts/accessibility;
- release/update pipeline and CI/CD;
- persistent code sandboxes and job queues;
- observability, uptime alerts, backups, load/cost controls;
- E2E mobile tests and LLM answer-quality evals;
- marketing, pricing, and support.

Phase 7 (multi-user) is not needed while it is only you.

---

## Recommended next steps

1. Deploy the backend.
2. Install the release APK.
3. Run the acceptance test.
4. Fix only what breaks.
5. Set up MongoDB backups and an uptime check.
6. Use it daily for 2–4 weeks and keep a friction list.
7. Decide on business only after that.

The biggest risk now is not missing features. It is installing before deploying,
or losing the release keystore. Do those two things carefully.
