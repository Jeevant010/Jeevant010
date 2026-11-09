# Free transports, native shell, and the Rust decision

Goal: zero recurring cost, minimal setup, phone-first. This is the practical
answer to "how do I send WhatsApp / SMS / calls / YouTube and code from my phone
without paying for an API or opening a laptop?"

## 1. What is already free in the app

- **Telegram, Discord, Slack, Mastodon** — official free APIs, already wired.
- **Gmail drafts and Calendar** — free Google OAuth, quota-limited.
- **WhatsApp / SMS / calls** — one-tap `wa.me`, `sms:`, and `tel:` links.
- **Instagram / LinkedIn / X** — Web Share API → the phone share sheet.
- **Anything else** — `N8N_WEBHOOK_URL`, self-hosted, free.

## 2. Messaging matrix

| Channel | Free, one tap | Free, fully automatic | Cost / risk | Setup time |
|---|---|---|---|---|
| WhatsApp | `wa.me/<number>?text=…` (already) | n8n + Baileys / whatsapp-web.js on your server | Unofficial protocol; account-ban risk; personal use only | ~1–2 hours |
| WhatsApp (official) | Meta Cloud API test number | Meta Cloud API | Free tier, but business verification + template approval | ~1 day |
| SMS | `sms:<number>?body=…` | Android native `SmsManager` (thin shell) | Free on your own SIM; `SEND_SMS` permission | ~1 hour |
| Calls | `tel:<number>` | Android native `ACTION_CALL` | Free on your own SIM; `CALL_PHONE` permission | ~1 hour |
| SMS / calls (server) | — | Twilio | Paid (trial credit only) | ~30 min |
| Telegram | — | Bot API | Free | ~5 min |
| Discord / Slack | — | Webhook | Free | ~5 min |
| Mastodon | — | Access token | Free | ~5 min |
| YouTube | — | Data API v3 upload | Free quota: ~10k units/day, ~1,600 per upload; unverified projects upload **private** | ~1 hour + audit |

### Fully automatic WhatsApp without a paid API

The app already emits this payload to `N8N_WEBHOOK_URL` when no Meta/Twilio
credential exists:

```json
{ "type": "message", "channel": "whatsapp", "to": "9198…", "body": "running late" }
```

Build one n8n workflow:

1. **Webhook** node (POST) → receives the payload.
2. **IF** `{{$json.type}} === "message"` and `{{$json.channel}} === "whatsapp"`.
3. **Baileys** (or an HTTP node to a `whatsapp-web.js` service) sends `body` to `to`.
4. **Respond** `200`.

The app reports **"handed off to n8n"**, not "delivered" — a webhook 200 does not
prove the message arrived. Check the workflow log for the real result.

Risks to accept up front: unofficial WhatsApp clients can get the number banned.
Use a secondary number for automation, keep the session backup, and never use
this for company/customer messaging. For a company, use the official Cloud API.

### Direct Android send (no webhook)

A thin native shell can send SMS and place calls directly with the user's own
SIM and permissions. This is the only way to get **fully automatic** SMS/calls
for free:

- `SmsManager.sendTextMessage(...)` with `SEND_SMS`.
- `Intent.ACTION_CALL` with `CALL_PHONE`.
- iOS refuses both without a user confirmation, so this is Android-only.

## 3. Coding your repos from the phone

No on-device model is involved. The phone is the remote control:

1. The app creates a `Job` with the repo, task, and branch.
2. A sandbox (E2B, Modal, or a Docker microVM on your VPS) clones the repo.
3. **OpenCode / Aider / OpenHands / goose** runs inside the sandbox with your keys.
4. The sandbox runs `typecheck`, `lint`, `test`, `build`.
5. The phone receives the diff, test results, and a preview.
6. You approve → it pushes a branch and opens a PR. Never auto-merge.

Guardrails: one branch per task, no force-push, tests must pass, approval before
merge, audit log. Reuse the existing `Approval` and `AuditLog` models.

## 4. PWA vs Capacitor vs Rust

| Option | Best at | Gaps | Verdict |
|---|---|---|---|
| **PWA (current)** | Free, instant updates, one codebase, push | No OS intents, no share-in on iOS, no platform on-device models | Keep as the base |
| **Capacitor shell** | Native intents, `SmsManager`, `ACTION_CALL`, share-in, native push, plugin access to Apple/Gemini models | Build toolchain, signing, store accounts | Add when a chore truly needs OS access |
| **Tauri 2 (Rust core + web UI)** | Rust core for inference/crypto/performance, small binaries, mobile targets | Smaller mobile ecosystem; still needs platform plugins for intents; iOS constraints | Good if you specifically want Rust in the core |
| **Full Rust UI (egui / Slint)** | Maximum control, single language | Expensive to build, weaker accessibility, worse UI iteration, store friction | Not recommended for this app |

**Recommendation:** keep the Next.js UI and add a **thin Capacitor shell** when
you need OS-level actions. If you want Rust, use it as an **optional core module**
(llama.cpp / candle / mistral.rs) behind a plugin — not as the UI layer. "People
are switching from Go to Rust" is true for inference servers and CLI tools; it is
not a reason to rewrite a UI.

## 5. On-device inference in 2026

| Surface | Real option | Use it for |
|---|---|---|
| PWA | WebLLM / transformers.js over WebGPU | Embeddings, intent classification, VAD — not the main brain (0.5–2 GB models, heat, battery, iOS limits) |
| Android native | Gemini Nano (AICore / ML Kit) | Fast small tasks, offline commands |
| iOS native | Apple Foundation Models (iOS/iPadOS/macOS 27+, on-device + Private Cloud Compute) | Fast small tasks, private text work |
| Desktop | Ollama / llama.cpp | Private local coding and bulk work |
| Server | Groq (speed), Gemini (quality) | Reasoning, drafting, planning, coding |

The "tablet kid, instant reply" feel is **streaming UX**, not an on-device LLM:
instant local ack → streaming STT → speculative intent → streamed tokens →
sentence-level TTS → prefetch/cache.

## 6. Build order

1. **Deterministic router** — done: fixed commands run with zero LLM calls.
2. **Groq key pool** — done: `GROQ_API_KEYS` rotates free keys on 429/401/403/5xx.
3. **n8n message webhook** — done: free WhatsApp/SMS handoff when no paid provider.
4. **Capacitor shell** — next: native intents, share-in, push, platform models.
5. **Remote coding sandbox** — the laptop replacement.
6. **Platform on-device models** — optional accelerator, never the brain.
