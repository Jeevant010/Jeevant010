# Jeevant OS — Phase Plan V2 (capability broker)

The goal is not "a million hardcoded tools." The goal is a system that can
**discover, describe, and execute** capabilities it was not shipped with.

## The core idea

An LLM cannot hold millions of tools in a prompt. Real systems use a
**capability broker**:

1. **Registry** — every tool has metadata: name, description, input schema,
   tags, risk, cost, latency, permissions, and an executor.
2. **Retriever** — the user request is matched against the registry (BM25 or
   embeddings). Only the top 8–20 tools enter the model prompt.
3. **Router** — a cheap first pass picks a domain (tasks, mail, code, files,
   messaging, web, device) before the planner.
4. **Meta-tools** — the model can call:
   - `search_tools(query)` — find more tools,
   - `describe_tool(name)` — get the schema,
   - `call_tool(name, args)` — execute,
   - `http_request` — call any REST/OpenAPI endpoint,
   - `run_code` — execute code in a sandbox,
   - `ui_action` — tap/type through Accessibility or a browser.
5. **Connectors** — MCP servers, OpenAPI specs, webhooks, native Android
   plugins, and the app's own server actions.
6. **Guardrails** — per-tool risk, approval, allowlist, rate limits, audit, and
   an emergency stop.

This is how you support the long tail without writing every tool: **generic
executors + discovery + permissions**, not an infinite switch statement.

## Current state (honest)

- `lib/agent/tools.ts` has ~40 tools in one `TOOL_CATALOG` string, injected into
  every planning prompt.
- Fixed commands are deterministic (router first).
- External actions are approval-gated in code.
- The mobile app has a native bridge for contacts, SMS, calls, notifications,
  and manual accessibility taps.
- The coding job already uses a sandbox, diff, tests, and approval.

This works for today, but the prompt grows with every tool and the model cannot
discover anything outside the catalog.

---

# Phases

Each phase is shippable and has a check you can run.

## Phase 1 — Tool registry + retrieval + search_tools

**Goal:** stop putting every tool in the prompt.

- Extract `lib/agent/registry.ts`:
  - structured entries: `{ name, description, args, tags, risk, executor }`
  - generated from the current catalog, not a rewrite.
- Add `retrieveTools(prompt, domain?, limit=14)`:
  - keyword/BM25 scoring over name + description + tags;
  - always include core tools (briefing, tasks, notes, contacts, approvals,
    `search_tools`).
- Add meta-tools:
  - `search_tools({ query })` returns matching tool names/descriptions;
  - `describe_tool({ name })` returns the schema.
- `plan()` injects only the retrieved subset, plus the meta-tools.
- Add `ToolCall` metrics: name, ok, latency, provider.

**Acceptance:** an unknown request ("make a chart from my activities") makes the
model call `search_tools`, finds the right tools, and completes. The prompt is
smaller than today. Fixed commands still resolve without an LLM.

## Phase 2 — Dynamic connectors (MCP + OpenAPI + generic HTTP)

**Goal:** add capabilities after deploy, without editing the app.

- MCP client:
  - connect to one or more MCP servers;
  - discover tools/resources at runtime;
  - register them in the same registry with a namespace (`mcp:server/tool`).
- OpenAPI loader:
  - paste a spec URL; generate tool entries from operations;
  - `http_request` as the generic fallback.
- Credentials:
  - per-connector secrets encrypted at rest (already have AES-GCM);
  - never send secrets to the browser.
- Permissions:
  - each connector declares read/write/outbound risk;
  - write/outbound still needs approval.

**Acceptance:** add an MCP server from Settings, ask for one of its tools, and the
agent uses it. Add an OpenAPI URL and call one endpoint through `http_request`.

## Phase 3 — Universal fallbacks (code + UI automation)

**Goal:** cover apps and sites with no API.

- `run_code` sandbox:
  - Node/Python in a temp container or the existing coding sandbox;
  - network allowlist, timeouts, no secrets in the prompt;
  - return stdout/stderr/artifacts.
- `ui_action`:
  - Android Accessibility for tap/type/scroll in a named app;
  - browser automation for web flows;
  - always one explicit confirmation per action sequence.
- Approvals:
  - a short plan is shown before a multi-step UI/code action;
  - failures stop, not loop.

**Acceptance:** "open WhatsApp and tap <contact>" works manually; "fetch this
page and summarize it" runs through the browser/code tool. No background loops.

## Phase 4 — Voice, persona, and conversation

**Goal:** make it feel like talking to one consistent operator.

- **Voice pipeline:** VAD → streaming STT → agent → streaming TTS.
- **Barge-in:** stop speaking when the user starts.
- **Persona:** one system prompt with name, tone, language mirroring (Hinglish
  supported), and the learned writing style.
- **Memory:** durable facts + recent turns + retrieval (top relevant memories,
  not "last 20").
- **Voice actions:** the same tool registry as text; no separate command list.
- **Wake word (optional):** separate foreground-service build; battery cost.

**Acceptance:** a 30-second spoken exchange feels continuous; memory carries
across sessions; the assistant answers in the user's language.

## Phase 5 — Network and on-device policy

**Goal:** control where inference runs.

Settings:

- **Cloud AI:** `always` / `Wi-Fi only` / `Wi-Fi + charging` / `never`.
- **Hotspot/mobile data:** local-only by default; cloud only with an explicit tap.
- **On-device fallback:**
  - deterministic router (always),
  - local STT/TTS (whisper.cpp / Piper or platform),
  - small local model (1–3B) for short conversation.
- **Battery guard:** pause heavy local inference below a threshold.
- **Cache:** repeated commands and summaries.

**Acceptance:** with cloud AI off, tasks/notes/reminders/focus still work; voice
STT can run locally; the app never silently spends mobile data.

## Phase 6 — Reliability, evals, and guardrails

**Goal:** know what actually works.

- Tool success rate and latency per tool.
- Retrieval hit rate: did the right tool enter the prompt?
- Golden tests for 50 common commands.
- Retries only for safe tools; no retries for outbound.
- Per-tool risk levels and approvals.
- Audit log and emergency stop (already present).

**Acceptance:** a dashboard shows the top failing tools and the p95 latency; a
broken tool is disabled without breaking the agent.

## Phase 7 — Multi-user / company (later)

Only when a second person actually needs access:

- `User`, `Workspace`, `Membership`.
- scoped data and credentials per workspace.
- RBAC and per-workspace guardrails.
- SSO.

Do not do this before Phase 1–6. It adds complexity with no personal benefit.

---

# On-device odds (honest)

| Capability | Odds | Notes |
|---|---|---|
| Deterministic commands offline | 10/10 | already |
| Small intent classifier on device | 9/10 | tiny model |
| Local STT (whisper.cpp) | 8/10 | battery/heat |
| Local TTS (Piper/platform) | 9/10 | good |
| Local 1–3B conversation | 5–6/10 | flagship only; battery |
| Local 7B+ | 2/10 | not realistic on a phone |
| Full agent + tools on device | 3/10 | today |
| Hybrid (local first, cloud for complex) | 9/10 | recommended |

So: **on-device for commands, STT/TTS, and small talk; cloud for reasoning,
tools, and long context.** A Wi-Fi/charging/hotspot policy makes that automatic.

# The rule for "every tool"

You will never hardcode every tool. You need:

1. a registry with retrieval,
2. `search_tools` / `describe_tool` / `call_tool`,
3. MCP + OpenAPI connectors,
4. `http_request` and `run_code`,
5. `ui_action` for apps without APIs,
6. approvals and risk levels.

That is how a software product "has everything" without containing everything.
