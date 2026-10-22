# Jeevant OS — Feature Inventory

This is the honest list: what ships today, what is partial, and what is missing
versus Siri / Google Assistant. No invented capabilities.

## 1. Voice

| Capability | Status |
|---|---|
| Hold-to-talk recording in the browser (MediaRecorder) | **Done** |
| Speech-to-text (Groq Whisper, free tier) | **Done** |
| Spoken replies (browser SpeechSynthesis) | **Done** |
| Voice commands that write to the database | **Done** |
| Wake word ("Hey Jeevant") | **Missing** — needs an always-on client or a native app |
| Continuous listening / barge-in | **Missing** |
| Speaker verification | **Missing** |

## 2. Assistant / agent

| Capability | Status |
|---|---|
| Free-form planning with an LLM (Groq `openai/gpt-oss-120b`) | **Done** |
| Gemini fallback with rotating keys | **Done** |
| Deterministic fallback parser (no keys) | **Done** |
| Durable memory (`remember` / `recall`, injected into prompts) | **Done** |
| Conversation memory (recent turns) | **Done** |
| Tool calling into MongoDB | **Done** |
| Destructive-action confirmation | **Done** |
| Provider shown on every reply | **Done** |
| Weather (Open-Meteo, no key) | **Done** |
| Web instant answers (DuckDuckGo, no key) | **Partial** — no full news feed yet |
| Reminders (`remind` → task with due date) | **Done** |
| News (Hacker News top stories, no key) | **Done** |
| In-app due reminders (Notification API) | **Done** — while the app is open |
| Background push for due reminders | **Missing** — needs a service worker + VAPID keys |
| WhatsApp / SMS / calls | **Done** — approval-gated; Cloud API / Twilio when configured, otherwise links/manual |
| Smart-home / device control | **Missing** |

## 3. Tools the agent can call

create_task · complete_task · delete_task · create_note · delete_note ·
search_notes · create_project · create_post · add_achievement · remember ·
recall · request_approval · list_tasks

## 4. Automation (n8n alternative)

| Capability | Status |
|---|---|
| Workflow model with ordered steps | **Done** |
| Manual run | **Done** |
| Scheduled run with interval + worker | **Done** |
| Templates (morning brief, weekly review, voice→post) | **Done** |
| Steps: agent, task, note, post, email, calendar, HTTP webhook | **Done** |
| Outbound external steps gated by approvals | **Done** |
| Visual drag-and-drop builder | **Missing** (forms/templates only) |
| Per-step retries and run history | **Done** — bounded retries + `WorkflowRun` records |
| Inbound webhook trigger | **Done** — `POST /api/hooks/<key>` |

## 5. Publishing / integrations

| Capability | Status |
|---|---|
| Content Studio: write once → many channels | **Done** |
| Telegram direct posting | **Done** (needs bot token) |
| Gmail drafts | **Done** (needs Google OAuth) |
| Google Calendar events | **Done** (needs Google OAuth) |
| WhatsApp / X / LinkedIn / Reddit / YouTube | **Partial** — share links or n8n/HTTP webhook |
| Instagram | **Missing** — requires Meta Graph API/business account |
| Multi-account management | **Done** — `/accounts`; default per channel; secrets never sent to the browser |
| Approval gate for every outbound action | **Done** — no auto-send code path exists |
| Emergency stop (block all external actions) | **Done** — `/guardrails` |
| HTTP allowlist for workflow webhooks | **Done** — `/guardrails` |
| Audit log of every external decision | **Done** — `AuditLog` + `/guardrails` |
| Discord / Slack / Mastodon posting | **Done** — webhook / access token |

## 5b. Mobile

- Bottom dock (Assistant, Voice, Studio, Approvals, Board) on phones.
- Private pages stack to one column; sidebar becomes a drawer.
- Assistant, Messages, Automations, Approvals all usable at phone width.
- Safe-area padding for the dock.

## 6. Back office

- CMS: projects, profile, journey, expertise, resume, RPG.
- Tasks / daily planner.
- Career kanban.
- Learning tracker.
- Snippet vault.
- Notes / brain.
- Voice inbox with 07:20 digest.
- Approvals inbox.
- Health endpoint (`/api/health`) and durable job worker (`/api/cron/worker`).

## 7. Gap list, in priority order

1. Inbound webhook trigger for automations (so external services can start flows).
2. Per-step retries and a visible run log.
3. Web search tool (free provider) for news/weather.
4. Instagram / LinkedIn / X proper APIs (requires accounts and app review).
5. Wake word + continuous listening (needs a persistent client; browser-only cannot do this reliably).
6. Reminders with push notifications.
7. Multi-account credentials per channel.
