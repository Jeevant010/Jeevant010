import PrivateShell from "@/components/layout/PrivateShell";
import {
  createAccountAction,
  deleteAccountAction,
  getAccounts,
  setDefaultAccountAction,
} from "@/lib/actions/account.actions";
import { ACCOUNT_CHANNELS, getAccountChannel } from "@/lib/integrations/account-catalog";
import TestAccountButton from "@/components/integrations/TestAccountButton";
import { KeyRound, Star, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const MODE_STYLE: Record<string, string> = {
  direct: "border-emerald-700/60 bg-emerald-950/20 text-emerald-300",
  webhook: "border-sky-700/60 bg-sky-950/20 text-sky-300",
  share: "border-amber-700/60 bg-amber-950/20 text-amber-300",
  manual: "border-white/10 bg-black/30 text-shell-muted",
};

const JSON_EXAMPLE = `{
  "channel": "telegram",
  "label": "Personal",
  "config": { "chatId": "123456789" },
  "secrets": { "botToken": "123:ABC" }
}`;

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <PrivateShell
      eyebrow="Comm center · credentials"
      title="Accounts"
      description="Paste credentials once. Guided fields or raw JSON both work. Every secret stays server-side, and every connection can be tested without sending anything."
      accent="emerald"
      icon={<KeyRound className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Add account</h2>
          <form action={createAccountAction} className="mt-4 flex flex-col gap-3">
            <select
              name="channel"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
            >
              {ACCOUNT_CHANNELS.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label} · {channel.mode}
                </option>
              ))}
            </select>
            <input
              name="label"
              required
              placeholder="Label (e.g. Personal, Work)"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
            />

            <details className="border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-[0.18em] text-shell-muted">
                Guided fields (WhatsApp, Twilio, Telegram, email)
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                <input name="phoneNumberId" placeholder="WhatsApp phone number id" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="token" type="password" placeholder="Token" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="accountSid" type="password" placeholder="Twilio account SID" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="authToken" type="password" placeholder="Twilio auth token" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="fromNumber" placeholder="From number / sender" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="chatId" placeholder="Telegram chat id" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
                <input name="sender" placeholder="Email sender" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]" />
              </div>
            </details>

            <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-shell-muted">Paste JSON</label>
            <textarea
              name="configJson"
              rows={7}
              spellCheck={false}
              placeholder={JSON_EXAMPLE}
              className="border border-shell-border bg-black px-3 py-2 font-mono text-[11px] leading-5 text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
            />
            <p className="text-[9px] leading-4 tracking-wide text-shell-muted/70">
              Guided fields win when both are filled. Keys matching token, secret, key, webhook, password, or sid are
              stored as secrets.
            </p>

            <button type="submit" className="border border-[color:var(--shell-accent)]/50 bg-[color:var(--shell-accent)]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/20">
              Save account
            </button>
          </form>
          <p className="mt-4 border-t border-white/5 pt-3 text-[10px] leading-4 tracking-wide text-amber-400/80">
            Secrets are stored in your MongoDB and never sent to the browser. Encryption at rest lands in Phase 5;
            prefer env vars for production until then.
          </p>
        </aside>

        <div className="space-y-6">
          <section className="space-y-3">
            {accounts.length === 0 && (
              <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
                No accounts yet. Messaging falls back to env vars.
              </div>
            )}

            {accounts.map((account: any) => {
              const meta = getAccountChannel(account.channel);
              return (
                <article key={account._id} className="panel-cyber p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${MODE_STYLE[meta?.mode || "manual"]}`}>
                          {meta?.mode || "manual"}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-shell-muted">{account.channel}</span>
                        {account.isDefault && (
                          <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[color:var(--shell-accent)]">
                            <Star className="h-3 w-3" /> default
                          </span>
                        )}
                        <span className={`text-[9px] uppercase tracking-widest ${account.hasSecrets ? "text-emerald-400" : "text-amber-400"}`}>
                          {account.hasSecrets ? "secrets set" : "no secrets"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-shell-text">{account.label}</h3>
                      <p className="mt-1 break-words text-[11px] text-shell-muted">
                        {Object.entries(account.config).map(([key, value]) => `${key}: ${String(value)}`).join(" · ") || "no config"}
                      </p>
                      {account.secretKeys.length > 0 ? (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-shell-muted/60">
                          secret keys: {account.secretKeys.join(", ")}
                        </p>
                      ) : null}
                      {meta ? <p className="mt-2 text-[10px] leading-4 text-shell-muted/70">{meta.note}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      <TestAccountButton id={account._id} />
                      {!account.isDefault && (
                        <form action={setDefaultAccountAction}>
                          <input type="hidden" name="id" value={account._id} />
                          <button className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[color:var(--shell-accent)]">
                            <Star className="h-3.5 w-3.5" /> Make default
                          </button>
                        </form>
                      )}
                      <form action={deleteAccountAction}>
                        <input type="hidden" name="id" value={account._id} />
                        <button className="flex items-center gap-2 border border-rose-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/30">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="panel-cyber p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Channel reality</h2>
            <p className="mt-2 text-[10px] uppercase leading-5 tracking-[0.12em] text-shell-muted/70">
              Direct and webhook post silently. Share opens the platform composer. Nothing here pretends to be more
              than it is.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ACCOUNT_CHANNELS.map((channel) => (
                <div key={channel.id} className="border border-white/5 bg-black/20 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-shell-text">{channel.label}</span>
                    <span className={`border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] ${MODE_STYLE[channel.mode]}`}>
                      {channel.mode}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.12em] text-shell-muted/60">
                      {channel.testable ? "testable" : "no probe"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-shell-muted/70">{channel.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PrivateShell>
  );
}
