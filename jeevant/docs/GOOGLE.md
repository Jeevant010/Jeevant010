# Google layer

Gmail and Calendar share one OAuth refresh token. Reading mail needs an
additional scope; if it is missing the app says so instead of pretending the
inbox is empty.

## Required scopes

| Capability | Scope |
|---|---|
| Read and search mail | `https://www.googleapis.com/auth/gmail.readonly` |
| Create Gmail drafts | `https://www.googleapis.com/auth/gmail.compose` |
| Read free/busy and events | `https://www.googleapis.com/auth/calendar` |

Re-authorize the refresh token if a call returns `403 insufficientPermissions`.
The error message on `/inbox` and in the agent names the exact scope to add.

## What is read-only

- `gmail_search`, `read_email`, `summarize_email`, `email_digest`
- `check_availability`, `upcoming_events`

## What is gated

- `draft_email_reply` drafts in your learned style and **queues an email
  approval**. Approving it creates the Gmail draft. Nothing is sent.
- `schedule_block` checks conflicts, then **queues a calendar approval**.
  Approving it creates the Google Calendar event. Nothing is written before
  that.
- `/inbox/[id]` uses the same approval path.

## Availability

`check_availability` calls Calendar `freeBusy`, then walks a 15-minute grid
inside working hours (default 09:00–18:00 in `GOOGLE_TIMEZONE`, default
`Asia/Kolkata`). It returns the first slot that fits the requested length. It
does not assume weekends are free or busy — every day is considered.

Tune the window per request with `workStart` and `workEnd`, or pass an explicit
`start`/`end` ISO window.

## Agent tools

| Tool | Args | Result |
|---|---|---|
| `gmail_search` | `query`, `count?` | Read-only list of matching mail |
| `read_email` | `id` | Headers and body preview |
| `summarize_email` | `id` | Three bullets plus the needed action |
| `email_digest` | `query?`, `count?` | One summary of recent mail |
| `draft_email_reply` | `id`, `instruction?` | Queues an email approval |
| `check_availability` | `start?`, `end?`, `minutes?`, `workStart?`, `workEnd?` | First free slot |
| `upcoming_events` | `days?`, `max?` | Next events |
| `schedule_block` | `title`, `start`, `minutes?`, `notes?` | Queues a calendar approval |

## Honest limits

- Attachments are not parsed.
- Thread-aware reply headers are not wired; replies are new drafts with a `Re:`
  subject.
- `email_digest` summarizes up to 20 messages and needs `GROQ_API_KEY` for a real
  summary.
- The 07:20 worker digest still reads the `Message` collection, not Gmail.
- Listing mail costs one metadata request per message (up to 20).
