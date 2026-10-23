# Action Bridge

A bridge link is a short-lived, revocable URL that runs exactly one whitelisted
action. It is how a phone shortcut, a shell script, a QR code, or an NFC tag
finishes a chore without an admin session.

## Security model

- The raw token exists only once, in the response that created it. The database
  stores a SHA-256 hash and a 12-character hint, never the token.
- Tokens are single-use by default. A reusable token must be requested
  explicitly and still expires.
- Claims are atomic: two concurrent requests cannot both run the same single-use
  token.
- Expired, used, and revoked links return `410 Gone`; they never fall back to a
  weaker path.
- Every run writes an `AuditLog` row with the action, token id, label, and result.
- A bridge link cannot read your data, call the agent, or reach an arbitrary
  tool. The action is fixed when the link is created; arguments can only fill
  the fields that action defines.
- External actions (`request_approval`) still go through the guardrail gate and
  land in `/approvals`. A bridge link can never send a message, post, or email
  directly.

## Actions

| Action | What it does | External |
|---|---|---|
| `create_task` | Adds a daily task | No |
| `complete_task` | Marks the first matching task complete | No |
| `create_note` | Saves a private note | No |
| `block_time` | Creates a private schedule block and warns about overlaps | No |
| `start_focus` / `end_focus` | Opens or closes a focus session | No |
| `log_activity` | Records a finished time block | No |
| `start_activity` / `stop_activity` | Starts or stops the activity tracker | No |
| `open_page` | Returns a deep link to a page | No |
| `request_approval` | Queues an external action for approval | Yes, gated |

## API

### Preview (no side effect)

```bash
curl https://your-host/api/actions/run/<token>
```

```json
{
  "ok": true,
  "action": "create_task",
  "token": { "status": "active", "uses": 0, "maxUses": 1, "expiresAt": "..." }
}
```

### Execute

```bash
curl -X POST https://your-host/api/actions/run/<token> \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship the bridge","priority":"high"}'
```

```json
{
  "ok": true,
  "summary": "Created task \"Ship the bridge\".",
  "action": "create_task",
  "receipt": { "tokenId": "...", "uses": 1, "maxUses": 1, "at": "..." }
}
```

Arguments may also be nested under `{"args": { ... }}`. Values in the request
override the defaults stored in the token, but only fields defined by that action
are accepted.

## iOS Shortcuts

1. Create a reusable link on `/actions` and copy it.
2. Shortcuts → **New Shortcut** → **Get Contents of URL**.
3. URL: the bridge link.
4. Tap **Show More** → Method: `POST` → Request Body: `JSON`.
5. Add the fields, for example `title` = the task name.
6. Add it to the Home Screen, or trigger it from an NFC tag or a Personal
   Automation.

Shortcuts cannot install themselves. You create the shortcut once; after that it
is one tap.

## Android

**Tasker:** Task → Net → HTTP Request → Method `POST`, URL = bridge link, Body =
JSON. Bind it to a widget, quick tile, or schedule.

**MacroDroid:** Add a Webhook trigger or a Widget trigger, then an HTTP Request
action with the same URL and JSON body.

## Local development

A phone cannot reach `localhost`. Use your machine's LAN address
(`http://192.168.x.x:3000`) or an HTTPS tunnel. Bridge links use whatever origin
the browser was on when you created them.

## What this deliberately cannot do

- Control other apps, system settings, alarms, or media.
- Wake on a schedule in the background (that is Phase 6 Web Push).
- Read notifications from other apps.
- Run an action the token was not created for.
