"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRIDGE_ACTIONS, getActionMeta, type ActionField } from "@/lib/bridge/catalog";
import { Check, Copy, Link2, Loader2, RefreshCw, ShieldAlert, Smartphone, Trash2 } from "lucide-react";

type TokenView = {
  id: string;
  action: string;
  label: string;
  hint: string;
  status: "active" | "exhausted" | "revoked" | "expired";
  uses: number;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  result: string;
};

const TTL_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "60", label: "1 hour" },
  { value: "1440", label: "24 hours" },
  { value: "43200", label: "30 days" },
];

const STATUS_STYLE: Record<TokenView["status"], string> = {
  active: "border-emerald-700/50 bg-emerald-950/20 text-emerald-300",
  exhausted: "border-amber-800/50 bg-amber-950/20 text-amber-300",
  revoked: "border-rose-900/50 bg-rose-950/20 text-rose-300",
  expired: "border-white/10 bg-black/30 text-shell-muted",
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultsFor(actionId: string): Record<string, string> {
  const meta = getActionMeta(actionId);
  const values: Record<string, string> = {};
  for (const field of meta?.fields || []) {
    if (field.default !== undefined) values[field.name] = String(field.default);
    if (field.type === "datetime" && !values[field.name]) {
      values[field.name] = toLocalInput(new Date(Date.now() + 60 * 60_000));
    }
  }
  return values;
}

export default function ActionBridge() {
  const [tokens, setTokens] = useState<TokenView[]>([]);
  const [actionId, setActionId] = useState(BRIDGE_ACTIONS[0].id);
  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor(BRIDGE_ACTIONS[0].id));
  const [label, setLabel] = useState("");
  const [ttl, setTtl] = useState("15");
  const [reusable, setReusable] = useState(false);
  const [created, setCreated] = useState<{ path: string; action: string } | null>(null);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const meta = useMemo(() => getActionMeta(actionId), [actionId]);
  const createdLink = created ? `${origin}${created.path}` : "";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/actions", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setTokens(Array.isArray(json.tokens) ? (json.tokens as TokenView[]) : []);
    } catch {
      // Best effort.
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    void load();
  }, [load]);

  function chooseAction(next: string) {
    setActionId(next);
    setValues(defaultsFor(next));
    setCreated(null);
    setError("");
  }

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function buildArgs(): Record<string, string> {
    const args: Record<string, string> = {};
    for (const field of meta?.fields || []) {
      const value = values[field.name];
      if (value !== undefined && value !== "") args[field.name] = value;
    }
    return args;
  }

  async function createToken() {
    if (busy) return;
    setBusy(true);
    setError("");
    setCreated(null);

    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionId,
          args: buildArgs(),
          label,
          ttlMinutes: Number(ttl),
          maxUses: reusable ? 0 : 1,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setCreated({ path: json.path, action: actionId });
      await load();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    try {
      const res = await fetch(`/api/actions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Revoke failed (${res.status})`);
      await load();
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setError("Clipboard is blocked here. Select the link and copy it manually.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="panel-cyber h-fit p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
          <Link2 className="h-4 w-4" /> New bridge link
        </div>
        <p className="mt-3 text-[10px] uppercase leading-5 tracking-[0.14em] text-shell-muted/70">
          The link is the credential. It runs one whitelisted action, then expires.
        </p>

        <label className="mt-4 block text-[9px] uppercase tracking-[0.18em] text-shell-muted">Action</label>
        <select
          value={actionId}
          onChange={(event) => chooseAction(event.target.value)}
          className="mt-1 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
        >
          {BRIDGE_ACTIONS.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
        {meta ? <p className="mt-2 text-[11px] leading-5 text-shell-muted">{meta.description}</p> : null}

        <div className="mt-4 grid gap-3">
          {meta?.fields.map((field) => (
            <Field
              key={field.name}
              field={field}
              value={values[field.name] || ""}
              onChange={(value) => setField(field.name, value)}
            />
          ))}
          {meta?.fields.length === 0 ? (
            <p className="border border-white/5 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-shell-muted/70">
              This action needs no arguments.
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[9px] uppercase tracking-[0.18em] text-shell-muted">Label</label>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Phone shortcut"
              className="mt-1 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-[0.18em] text-shell-muted">Expires</label>
            <select
              value={ttl}
              onChange={(event) => setTtl(event.target.value)}
              className="mt-1 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
            >
              {TTL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2 text-[10px] uppercase leading-5 tracking-[0.12em] text-shell-muted">
          <input
            type="checkbox"
            checked={reusable}
            onChange={(event) => setReusable(event.target.checked)}
            className="mt-0.5 accent-emerald-400"
          />
          Reusable — needed for a phone shortcut. Revoke it when you are done.
        </label>

        <button
          type="button"
          onClick={() => void createToken()}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-[color:var(--shell-accent)]/40 bg-[color:var(--shell-surface)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--shell-accent)] transition hover:bg-[color:var(--shell-accent)]/10 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
          Create link
        </button>

        {error ? (
          <p className="mt-3 border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-[11px] text-rose-300">{error}</p>
        ) : null}

        {created ? (
          <div className="mt-4 border border-emerald-900/50 bg-emerald-950/15 p-3">
            <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300">
              Link created — shown once
            </p>
            <p className="mt-2 break-all font-mono text-[11px] leading-5 text-shell-text">{createdLink}</p>
            <button
              type="button"
              onClick={() => void copy(createdLink, "created")}
              className="mt-2 inline-flex items-center gap-2 border border-emerald-700/50 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-emerald-300"
            >
              {copied === "created" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied === "created" ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6">
        <section className="panel-cyber p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
              <ShieldAlert className="h-4 w-4" /> Active links
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="text-shell-muted transition hover:text-shell-text"
              aria-label="Refresh links"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {tokens.map((token) => (
              <div key={token.id} className="border border-white/5 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] ${STATUS_STYLE[token.status]}`}>
                    {token.status}
                  </span>
                  <span className="font-mono text-[11px] text-shell-text">{token.action}</span>
                  {token.label ? (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-shell-muted">· {token.label}</span>
                  ) : null}
                  <span className="ml-auto font-mono text-[9px] text-shell-muted/60">{token.hint}…</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] uppercase tracking-[0.12em] text-shell-muted/70">
                  <span>
                    uses {token.uses}/{token.maxUses === 0 ? "∞" : token.maxUses}
                  </span>
                  <span>expires {new Date(token.expiresAt).toLocaleString()}</span>
                  {token.lastUsedAt ? <span>last {new Date(token.lastUsedAt).toLocaleString()}</span> : null}
                </div>
                {token.result ? <p className="mt-2 text-[10px] leading-4 text-shell-muted">{token.result}</p> : null}
                {token.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => void revoke(token.id)}
                    className="mt-2 inline-flex items-center gap-1.5 border border-rose-900/40 px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-rose-300 transition hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </button>
                ) : null}
              </div>
            ))}
            {tokens.length === 0 ? (
              <p className="py-6 text-center text-[10px] uppercase tracking-[0.16em] text-shell-muted/60">
                No links yet.
              </p>
            ) : null}
          </div>
        </section>

        <section className="panel-cyber p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
            <Smartphone className="h-4 w-4" /> Phone shortcut
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-shell-text">iOS Shortcuts</p>
              <ol className="mt-2 space-y-1.5 text-[11px] leading-5 text-shell-muted">
                <li>1. New Shortcut → Get Contents of URL.</li>
                <li>2. URL: your bridge link.</li>
                <li>3. Method: POST, Request Body: JSON.</li>
                <li>4. Add the fields, then put it on the Home Screen or an NFC tag.</li>
              </ol>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-shell-text">Android</p>
              <ol className="mt-2 space-y-1.5 text-[11px] leading-5 text-shell-muted">
                <li>1. Tasker → Net → HTTP Request, or MacroDroid → Webhook trigger.</li>
                <li>2. Method: POST, URL: your bridge link.</li>
                <li>3. Body: JSON with the same fields.</li>
                <li>4. Bind it to a widget, quick tile, or schedule.</li>
              </ol>
            </div>
          </div>
          <p className="mt-3 border-t border-white/5 pt-3 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/70">
            A bridge link can only run its one action — it cannot read your data or reach other tools. Revoke it any
            time. For a lock-screen reminder rather than a button, that is Phase 6 push.
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: ActionField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-[0.18em] text-shell-muted">
        {field.label}
        {field.required ? <span className="text-rose-400"> *</span> : null}
      </label>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
          value={value}
          min={field.min}
          max={field.max}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
        />
      )}
    </div>
  );
}
