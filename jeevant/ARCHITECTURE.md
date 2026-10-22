# Jeevant Architecture

This file is the primary source of truth for how the app is structured, what is already implemented, and what should be prioritized next.

## 1. Product Goal

Jeevant is a backend-driven personal portfolio and admin CMS built as a cyberpunk/sci-fi terminal-inspired web app. It has two equally important faces:

- Public portfolio pages for visitors, recruiters, and collaborators.
- Private admin/CMS pages for maintaining content, schedules, timelines, notes, and profile data.

The long-term goal is not just to look unique. The app should remain easy to maintain, data-backed, fast to load, and structured enough to grow into a complete personal operating system.

## 2. Current Stack

- Framework: Next.js App Router
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS v4 via `app/globals.css`
- Database: MongoDB through Mongoose
- Auth/session: `jose` signed session cookie
- Dev/build: Turbopack through `next dev` and `next build`

Important repo reality:

- There is no `tailwind.config.ts` in the current codebase.
- Theme and custom utilities are currently handled in `app/globals.css`.
- Turbopack root is pinned in `next.config.ts` so the app starts from the correct workspace root.

## 3. Runtime Flow

### Public flow

1. A visitor opens a public route under `app/(public)`.
2. The page fetches data from server actions in `lib/actions`.
3. Data is rendered directly in the page or through small feature components.
4. The public UI stays lightweight and mostly server-rendered.

### Admin flow

1. The user visits `/login`.
2. The password is compared against `ADMIN_SECRET` from `.env.local`.
3. If valid, a signed `session` cookie is set.
4. Protected routes are guarded by `proxy.ts`.
5. Admin pages under `app/(private)` load data from MongoDB and submit forms to server actions.

## 4. Route Map

### Public routes

- `/` home
- `/about` profile/character sheet style page
- `/journey` experience and career timeline
- `/projects` project showcase
- `/research` notes and experimentation
- `/library` learning resources
- `/expertise` achievements and proof
- `/schedule` public schedule snapshot
- `/responsibilities` work and commitments
- `/resume` concise resume view
- `/contact` contact form

### Private routes

- `/dashboard` overview
- `/cms/profile` profile editor
- `/cms/projects` project editor
- `/cms/schedule` schedule planner
- `/cms/journey` experience editor
- `/cms/expertise` achievements editor
- `/cms/resume` resume/profile editor
- `/cms/rpg` legacy content/editor area
- `/voice` voice inbox (speech → AI drafts → Gmail/Calendar/Studio)
- `/studio` content studio (write once, distribute to every channel)
- `/integrations` automation wiring, connection status, and channel tests
- `/brain`, `/learning`, `/career`, `/planner/daily`, `/arsenal` for internal organization and content workflows

## 5. Data Layer

All persistent data lives in `lib/database/models.ts`.

### Existing schemas

- `Project`
- `Task`
- `Note`
- `Learning`
- `Experience`
- `Achievement`
- `Certificate`
- `Application`
- `Message`
- `Snippet`
- `Profile`
- `Schedule`
- `VoiceCapture`
- `ContentPost`
- `Setting`

### Key schema responsibilities

#### `Project`

Used for public project cards, CMS project editing, and future chronology views.

Current important fields:

- `title`
- `slug`
- `description`
- `content`
- `techStack`
- `repoLink`
- `liveLink`
- `startDate`
- `endDate`
- `isOngoing`
- `visibility`
- `status`

#### `Experience`

Used for journey and resume timelines.

Current important fields:

- `company`
- `role`
- `startDate`
- `endDate`
- `description`
- `skillsUsed`
- `logoUrl`
- `type`

#### `Schedule`

Used for calendar/planner work blocks.

Current important fields:

- `title`
- `start`
- `end`
- `projectId`
- `notes`
- `isRecurring`
- `recurrence`
- `colorCode`

#### `Profile`

Used for the public identity card, resume page, and homepage summary.

## 6. Server Actions

Server actions live in `lib/actions`.

### Core actions already used

- `lib/actions/auth.actions.ts`
- `lib/actions/profile.actions.ts`
- `lib/actions/project.action.ts`
- `lib/actions/rpg.actions.ts`
- `lib/actions/task.actions.ts`
- `lib/actions/learning.actions.ts`
- `lib/actions/note.actions.ts`
- `lib/actions/schedule.actions.ts`

### Important behaviors

- Actions connect to MongoDB via `connectDB()`.
- Writes usually call `revalidatePath()` so public pages and CMS pages refresh.
- Forms are mostly server-action driven instead of client-side API calls.

## 7. Admin Security

### Authentication

- Login is password-based and uses `ADMIN_SECRET`.
- The session is a signed cookie called `session`.
- `lib/auth.ts` handles signing and verification.

### Route protection

- `proxy.ts` protects private admin and planner routes.
- If the session is missing or invalid, the user is redirected to `/login`.

### Operational notes

- Changing `ADMIN_SECRET` requires restarting the dev server.
- The app should always be run from `d:\Desktop\Jeevant\jeevant`.
- If port `3000` is busy, start on another port or stop the existing dev process.

## 8. Visual System

The current visual direction is intentionally terminal-like, neon, and cinematic.

### Current implementation

- Layouts use dark backgrounds, border accents, and glow-like gradients.
- Motion is limited and intentional.
- Public pages are content-first, not dashboard clutter.
- Admin pages keep a terminal/operations style.

### Styling reality

- Tailwind utilities are available.
- Custom CSS lives in `app/globals.css`.
- Because there is no `tailwind.config.ts`, custom shadow or theme utilities should be added in `app/globals.css` unless the project later adopts a Tailwind config file.

## 9. What Is Already Built Well

- Public pages are wired to real backend content.
- Admin schedule has a dedicated CMS page.
- Journey, expertise, and resume editors now exist.
- Public journey and resume pages show timeline-style visuals.
- Project creation already accepts chronology fields.
- The build currently passes after the latest changes.

## 10. What Is Still Missing or Incomplete

These are real gaps, not assumed features.

### Missing or partial items

- True drag-and-drop interaction in the admin schedule is not implemented.
- The admin calendar is a custom day/week view, not a drag-and-drop calendar library.
- Project timeline bars are present conceptually, but there is no fully accurate month-scale Gantt engine yet.
- Edit/delete flows for journey and expertise entries are still basic.
- Some CMS forms could still use broader accessibility and keyboard polish.
- A dedicated migration/backfill script for old project chronology data does not exist yet.

### Not present in the repo right now

- `tailwind.config.ts`
- `@dnd-kit/core`
- `react-big-calendar`
- `@fullcalendar/react`
- A migration script folder or CLI tooling for schema backfills

## 11. Prioritized Roadmap

This is the order that should matter most.

### Priority 1: Keep the foundation stable

- Preserve build stability.
- Keep admin auth working.
- Keep the data model aligned with pages.
- Avoid adding heavy libraries unless they solve a real problem.

### Priority 2: Improve content maintenance

- Finish CRUD for journey, expertise, and schedule entries.
- Add safer discard/unsaved-changes warnings for CMS forms.
- Improve a11y across all CMS forms.

### Priority 3: Make chronology accurate

- Add a proper project date backfill strategy.
- Ensure public and admin timelines derive from the same data source.
- Improve the month-by-month visualization math for project and experience views.

### Priority 4: Add interaction carefully

- If drag-and-drop scheduling is needed, add a small headless library only when necessary.
- Keep the UI custom and cyberpunk-themed.
- Avoid corporate calendar visuals.

### Priority 5: Expand documentation

- Keep this file current whenever schemas, routes, or CMS flows change.
- Update `README.md` for setup, env vars, and admin usage.

## 12. Working Rules For Future Changes

- Prefer server actions over extra API routes unless there is a clear reason not to.
- Prefer custom UI over bulky third-party UI kits.
- Use lightweight dependencies only for logic, not presentation.
- Keep data models and public pages in sync.
- Update this file whenever a new route, schema, or CMS area becomes important.

## 13. Setup Notes

### Required environment variables

- `ADMIN_SECRET`
- MongoDB connection variable used by `lib/db.ts`

### Common run commands

```bash
cd jeevant
npm run dev
```

```bash
cd jeevant
npm run build
```

## 14. Practical Summary

If you need one short version of the current architecture:

- Public pages read from MongoDB through server actions.
- Admin pages write to MongoDB through server actions.
- Authentication is one secret and one signed cookie.
- Scheduling, journey, expertise, resume, and projects are the main content systems.
- The repo is intentionally leaning toward a custom cyberpunk terminal UI rather than a standard SaaS dashboard.

This file should be treated as the canonical architecture summary for the project.

---

## 15. Automation Layer (Voice / Studio / Integrations)

This is a self-contained subsystem added on top of the CMS. Full setup guide:
[`docs/AUTOMATION.md`](./docs/AUTOMATION.md). Env template: [`.env.example`](./.env.example).

### Principles

- No paid services. Groq + Gemini free tiers, Telegram Bot API, self-hosted n8n.
- Every adapter is optional. Missing credentials produce a **local fallback**, never a crash.
- Secrets stay in `.env.local`. The `Setting` collection only holds non-secret config.

### Integration adapters (`lib/integrations/`)

- `whisper.ts` — Groq Whisper transcription (`GROQ_API_KEY`).
- `gemini.ts` — drafting engine with rotating `GEMINI_API_KEYS`; retries the next key on 429/403/5xx; heuristic fallback when unconfigured.
- `google.ts` — shared OAuth refresh-token helper.
- `gmail.ts` — creates real Gmail drafts.
- `calendar.ts` — creates Google Calendar events; caller falls back to `Schedule`.
- `channels.ts` — distribution: n8n webhook → direct API → share link → manual.
- `config.ts` — env defaults merged with `Setting` overrides.
- `types.ts` — shared contracts.

### Data flow

1. `POST /api/voice` (admin-only) stores a `VoiceCapture`, transcribes, drafts, and persists all artifacts.
2. The user reviews/edits in `/voice`, then optionally pushes to Gmail, locks calendar blocks, creates tasks, or promotes a draft into a `ContentPost`.
3. `/studio` dispatches `ContentPost`s to selected channels and records a `dispatch[]` log per attempt.
4. `/api/cron/dispatch` publishes `queued` posts whose `scheduledAt` has passed.

### Models

- `VoiceCapture` — transcript, intent, `drafts[]`, `calendarBlocks[]`, `taskSuggestions[]`, `simulated`, provider metadata.
- `ContentPost` — master body, channels, status (`draft|queued|published|failed`), `scheduledAt`, `dispatch[]` log.
- `Setting` — key/value non-secret runtime config editable from `/integrations`.

### Route protection

`proxy.ts` protects `/voice`, `/studio`, and `/integrations` alongside the existing private zones.

### Notes and limits

- LinkedIn/X/WhatsApp/Reddit/YouTube do not expose free silent-posting APIs; the app returns share-intent links or copy-ready drafts. n8n removes that limitation.
- Gmail *reading* for the overnight digest requires a read scope; without it the digest uses the `Message` collection.
- Audio blobs are not persisted (transcript only) to avoid DB/filesystem bloat.

---

## 16. Assistant, Memory, Worker, Approvals

### Assistant (`/assistant`)

Voice-first surface: hold the orb → Groq Whisper → agent → spoken reply via the
browser SpeechSynthesis API. Text input works the same way. Every reply shows the
provider (`groq:openai/gpt-oss-120b`, `gemini:…`, or `fallback-parser`).

### Agent (`/agent` and `lib/agent`)

- `tools.ts` — tool registry that writes to the same MongoDB collections as the
  admin UI: tasks, notes, projects, posts, achievements, memory, approvals.
- `run.ts` — planner. Gemini keys are used when present; otherwise Groq chat
  (`GROQ_MODEL`, default `openai/gpt-oss-120b`); otherwise a deterministic parser.
- Destructive tools (`delete_task`, `delete_note`) require `confirm: true` and
  otherwise return `needsConfirm` without changing anything.
- `remember` / `recall` persist durable facts; the 20 most recent memories are
  injected into every planning prompt.

### Memory (`Memory`)

Manual add/delete on `/assistant`; agent-created via the `remember` tool.

### Worker queue (`Job`, `lib/worker/queue.ts`)

- Durable jobs in MongoDB with `attempts`, `maxAttempts`, and exponential backoff.
- `GET|POST /api/cron/worker?limit=10` drains the queue.
- Current handlers: `dispatch_due` (scheduled posts) and `digest`.

### Approvals (`Approval`, `/approvals`)

Human-in-the-loop gate for external actions. The agent can queue one with
`request_approval`. Approving executes the action (post dispatch, Gmail draft, or
Calendar event); rejecting records the decision. Every decision is stored with a
result string and timestamp.

By default **all outbound actions are gated**: `dispatchPost`, voice email drafts,
and voice calendar locks create pending approvals instead of firing. Set
`AUTO_APPROVE=true` in `.env.local` to bypass the gate. Scheduled posts
(`dispatch_due`) run automatically because the schedule itself is the approval.

### Health

`GET /api/health` reports DB reachability, provider configuration, queue depth,
and pending approvals.

### Guardrails (`/guardrails`, `lib/guardrails/policy.ts`)

Hard rules, enforced in code — not by prompt:

- **No auto-send path exists.** `AUTO_APPROVE` was removed. Every outbound action
  either creates an `Approval` or is blocked.
- **Emergency stop.** Setting `guardrailMode=blocked` blocks new actions *and*
  blocks execution of approvals queued before the switch flipped.
- **HTTP allowlist.** Workflow `http` steps are blocked unless the hostname is
  allowlisted; even then they still require approval.
- **Scheduled posts** create approvals when due; they never publish themselves.
- **Audit log.** Every decision (`approval`, `blocked`, `executed`, `failed`) is
  written to `AuditLog` and shown on `/guardrails`.
- Agent `send_message` also passes through the same gate.

### Accounts (`/accounts`)

- `ChannelAccount` stores multiple accounts per channel (`whatsapp`, `sms`,
  `call`, `telegram`, `email`) with a label and an `isDefault` flag.
- `config` holds non-secret fields; `secrets` holds tokens and is server-only —
  it is never included in the data sent to the browser.
- `resolveAccount(channel, id?)` picks an explicit account, else the channel
  default, else null (adapters then fall back to environment variables).

### Messaging (`/messages`)

- Channels: WhatsApp, SMS, calls.
- WhatsApp uses the Meta Cloud API (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`);
  without it, a `wa.me` link is returned.
- SMS and calls use Twilio (`TWILIO_*`); without it, the message is manual and
  calls return a `tel:` link.
- Every outbound message is approval-gated by default. Approving executes the
  send and writes an `OutboundMessage` log row.
- Agent tools: `send_message`, plus `remind` (creates a task with a due date).

### Mobile

`MobileDock` adds a bottom navigation bar on phones; the private shell stacks to
one column and the sidebar becomes a drawer.

### Workflows (in-app n8n alternative)

- `Workflow` stores ordered steps and a trigger (`manual`, `schedule`, `webhook`).
- `WorkflowRun` stores per-step results with attempt counts; `/automations` shows
  the last runs per workflow.
- Steps: `agent`, `task`, `note`, `post`, `email`, `calendar`, `http`.
- `http` lets a workflow call n8n, Zapier, or any webhook.
- Inbound trigger: `POST /api/hooks/<webhookKey>` (the key is the credential).
- Scheduled workflows run from `/api/cron/worker`; manual runs from the UI.
- Bounded retries apply only to safe-to-repeat steps (`agent`, `http`).
- `lib/agent/run.ts` stores recent `ChatMessage` turns and injects them, so the
  assistant has short-term conversation memory. Workflow-internal agent calls use
  `persist: false`.

