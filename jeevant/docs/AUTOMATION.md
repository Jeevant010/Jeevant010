# Automation Layer

Everything runs inside this Next.js app. No paid services are required: Groq and
Gemini have free tiers, Telegram's Bot API is free, and n8n Community Edition is
free/self-hosted. Every integration is **optional** — when a key is missing the
adapter degrades to a local fallback so the UI keeps working.

## Surfaces

| Route | What it does |
|-------|--------------|
| `/voice` | Record a voice note (hold the mic). Whisper transcribes it, Gemini drafts the email / LinkedIn post / YouTube outline / schedule. Review, edit, push to Gmail, lock calendar, or send to Studio. |
| `/studio` | Write once and distribute to WhatsApp, Telegram, X, LinkedIn, YouTube, Reddit, and Gmail. Queue for later. |
| `/integrations` | Connection status, per-channel test buttons, and runtime configuration (webhook URL, chat IDs, numbers). |
| `/api/voice` | `POST` multipart `audio` + optional `hint` + `durationSec`. Admin-only. |
| `/api/cron/dispatch` | Publishes due queued posts and returns the morning digest. Protect with `CRON_SECRET`. |

## Pipeline

```
mic ──► /api/voice ──► Groq Whisper ──► Gemini (rotating keys)
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
        email draft                 content drafts               schedule blocks
     (Gmail drafts API)        (LinkedIn / YouTube / X)      (Google Calendar / local)
              │                           │
              └──────────► Studio ◄───────┘
                              │
                     n8n webhook / direct / share links
```

## Keys and where to get them (free)

### Groq (speech-to-text)
1. Create a key at <https://console.groq.com/keys>.
2. Set `GROQ_API_KEY`. Model defaults to `whisper-large-v3`.

### Gemini (drafting)
1. Create one or more keys at <https://aistudio.google.com/app/apikey>.
2. Set `GEMINI_API_KEYS` as a comma-separated list, e.g. `a,b,c`.
3. The adapter round-robins across keys and retries the next key on 429/403/5xx.

### Google (Gmail drafts + Calendar)
1. In Google Cloud Console create an OAuth client (Desktop/Web).
2. Enable **Gmail API** and **Google Calendar API**.
3. Generate a refresh token with the scopes:
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/calendar.events`
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`,
   `GMAIL_SENDER`, and optionally `GOOGLE_CALENDAR_ID`.

### Telegram (free direct posting)
1. Message `@BotFather`, create a bot, copy the token → `TELEGRAM_BOT_TOKEN`.
2. Add the bot to your channel/group as an admin.
3. Get the chat id (e.g. via `https://api.telegram.org/bot<token>/getUpdates`)
   → `TELEGRAM_CHAT_ID`.

You can also paste these into `/integrations` instead of `.env.local` (values are
stored as non-secret Setting documents). **API keys should stay in `.env.local`.**

## n8n fan-out (optional but recommended)

n8n gives you one webhook that can post to *anything* with a node — including
platforms with no free API. Self-host with Docker (`docker run -it --rm -p 5678:5678 n8nio/n8n`).

1. Import a workflow with a **Webhook (POST)** trigger.
2. Point `N8N_WEBHOOK_URL` at the production webhook URL.
3. The app sends this JSON:

```json
{
  "channel": "twitter",
  "title": "Post title",
  "body": "Post body",
  "tags": ["buildinpublic"],
  "source": "manual"
}
```

4. Switch on `{{ $json.channel }}` and route to the matching node
   (Telegram, Discord, Slack, HTTP Request to a platform, etc.).

Without n8n, each channel still works:
- **Telegram** → direct Bot API (fully automatic).
- **Email** → real Gmail draft.
- **WhatsApp / X / LinkedIn / Reddit / YouTube** → the app returns a share-intent
  link or a copy-ready draft (browsers do not allow silent posting to these).

## Scheduled posting

Posts with a future `scheduledAt` are saved as `queued`. Hit the cron endpoint
from any free scheduler:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-host/api/cron/dispatch
```

Schedulers: system crontab, GitHub Actions (`schedule`), cron-job.org, Vercel Cron.

## Local fallbacks (no keys needed)

| Missing | Fallback |
|---------|----------|
| `GROQ_API_KEY` | Transcript is blank; capture is flagged `simulated` |
| `GEMINI_API_KEYS` | Deterministic heuristic drafts |
| Google OAuth | Gmail drafts stay in-app; time blocks go to the local `Schedule` |
| `N8N_WEBHOOK_URL` | Share links / copy-ready drafts |
