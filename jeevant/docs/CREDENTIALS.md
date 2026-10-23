# Credentials and transports

`/accounts` stores one or more accounts per channel. A channel's default account
is used unless an approval names another one. Secrets are stored server-side and
are never serialized to the browser; the page only sees the names of secret keys.

## Paste formats

Structured (preferred):

```json
{
  "channel": "telegram",
  "label": "Personal",
  "config": { "chatId": "123456789" },
  "secrets": { "botToken": "123:ABC" }
}
```

Flat (keys are sorted automatically):

```json
{
  "channel": "discord",
  "label": "Guild",
  "webhookUrl": "https://discord.com/api/webhooks/..."
}
```

Any key matching `token`, `secret`, `key`, `webhook`, `password`, or `sid` is
treated as a secret in the flat form. Values from the guided fields win when both
forms are filled.

## Examples

| Channel | Config | Secrets |
|---|---|---|
| Telegram | `chatId` | `botToken` |
| WhatsApp | `phoneNumberId`, `fromNumber` | `token` |
| SMS / Calls | `fromNumber` | `accountSid`, `authToken` |
| Email | `sender` | `clientId`, `clientSecret`, `refreshToken` |
| Discord | — | `webhookUrl` |
| Slack | — | `webhookUrl` |
| Mastodon | `instance` | `token` |
| X | — | `bearerToken` |
| LinkedIn | `authorUrn` | `accessToken` |
| Reddit | `username` | `clientId`, `clientSecret`, `password` |

## What "Test" actually does

Every probe is read-only. It never sends a message.

- Telegram: `getMe`, reports the bot username.
- WhatsApp: reads the phone-number metadata from the Graph API.
- Twilio: reads the account resource.
- Discord: `GET` on the webhook.
- Slack: validates the webhook URL shape only; Slack confirms on a real POST.
- Mastodon: `verify_credentials`.
- Email: exchanges the refresh token for an access token.
- X: `GET /2/users/me` with the bearer token.
- LinkedIn / Reddit: no free posting probe; the UI says so instead of pretending.

## Transport reality

| Mode | Meaning |
|---|---|
| `direct` | The app posts or sends through the provider API |
| `webhook` | The app POSTs to a webhook URL |
| `share` | The app opens the platform composer; you confirm in the app |
| `manual` | The app gives you copy-ready text |

`direct` and `webhook` accounts are merged into runtime config, so the existing
dispatcher uses them without extra wiring. Today that covers Telegram, Discord,
Slack, Mastodon, WhatsApp, email, SMS, and calls.

## Current limits

- Secrets are plaintext in MongoDB until Phase 5 encrypts them at rest. Use env
  vars for anything you would not want in a database backup.
- X, LinkedIn, and Reddit posting still use share intent; real posting needs an
  approved developer app.
- Rate-limit and quota counters are Phase 6.
- Instagram has no free silent-post path; use the share sheet or n8n.
