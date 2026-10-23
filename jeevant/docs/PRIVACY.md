# Privacy and retention

This is the honest privacy posture. It covers what is encrypted, what is
retained, what leaves the device, and what this design does not protect.

## Encryption at rest

Credential secrets in `ChannelAccount.secrets` are encrypted with AES-256-GCM.

- Key derivation: `scrypt(ADMIN_SECRET, per-record salt, 32 bytes)`.
- Each record has its own random salt, IV, and auth tag. The envelope is stored
  inline: `{ v, alg, salt, iv, tag, data }`.
- Existing plaintext records remain readable through a legacy fallback. Run
  `npm run secrets:encrypt` once to upgrade them.
- Rotating `ADMIN_SECRET` makes old encrypted credentials unreadable. Rotate the
  credentials too, or keep the old secret for a migration window.
- Non-secret `config` (for example a chat id or a from-number) is not encrypted.
  Treat phone numbers as personal data.

Failure behavior: if `ADMIN_SECRET` is missing or shorter than 16 characters in
production, sealing throws rather than storing plaintext.

## Retention

Mongo TTL indexes delete records automatically.

| Collection | Default | Env |
|---|---|---|
| `ChatMessage` | 90 days | `RETENTION_CHAT_DAYS` |
| `AuditLog` | 180 days | `RETENTION_AUDIT_DAYS` |
| `OutboundMessage` | 180 days | `RETENTION_OUTBOUND_DAYS` |
| `ActionToken` | at `expiresAt` | token TTL |
| Jobs | kept until done or failed | no TTL |

TTL indexes apply to existing data too: once the index builds, older records are
removed. Lower the windows deliberately.

## Export and deletion

`/privacy` provides:

- **Export** — one JSON archive of every personal collection. Credential values
  are replaced with key names; bridge token hashes are stripped.
- **Delete activity data** — chat, audit, activity, focus, approvals, outbound
  log, jobs, bridge links, memories. Content and credentials remain.
- **Delete everything** — the above plus tasks, notes, projects, learning,
  experience, achievements, certificates, schedules, applications, messages,
  snippets, profile, resume, voice captures, posts, workflows, contacts, style,
  templates, and channel accounts.

`Setting` is deliberately never deleted, so the guardrail emergency stop cannot
be erased by a data wipe.

Deletion does not reach provider-side copies. Mail already read by Google, text
sent to Groq or Gemini, and messages delivered by a provider are outside this
app's control.

## Browser state

- `localStorage` uses the `jv:` namespace with per-entry expiry and quota
  recovery (`lib/client/state.ts`).
- The service worker never caches `/api`, `/login`, or any private route.
- Only hashed, immutable `_next/static` assets and shell icons are cached.

## Content Security Policy

Enforced now (safe, non-breaking):

```
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

The full policy is sent as `Content-Security-Policy-Report-Only` with
`'unsafe-inline'` for scripts and styles. It surfaces violations in the browser
console without breaking the app. Nonce-based enforcement is still pending.

## Log redaction

`lib/logging/redact.ts` strips:

- bridge tokens (`jv_…`)
- Telegram bot tokens (`bot…:…`)
- bearer and `Authorization` values
- `token=`, `secret=`, `password=`, and similar query values
- 12–15 digit phone numbers

Redaction is applied to audit reasons and targets, and to approval results before
they are stored.

## What leaves the device

| Path | Destination |
|---|---|
| Voice transcription | Groq Whisper |
| Agent planning and drafting | Groq or Google Gemini |
| Email and calendar | Google APIs |
| Messaging and posting | The provider you configured |
| Weather and news | Open-Meteo, Hacker News |
| Web instant answers | DuckDuckGo |

Browser speech synthesis runs locally. There is no analytics or third-party
tracking script in this app.

## What this does not protect

- A compromised server or a leaked `ADMIN_SECRET` exposes everything.
- Database backups may contain deleted records until the backup expires.
- Provider-side retention is governed by each provider.
- Attachments and email bodies pass through Groq when summarized.
- There is no end-to-end encryption for outbound messages.
