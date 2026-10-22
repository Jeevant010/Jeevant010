import PrivateShell from "@/components/layout/PrivateShell";
import {
  createAccountAction,
  deleteAccountAction,
  getAccounts,
  setDefaultAccountAction,
} from "@/lib/actions/account.actions";
import { KeyRound, Star, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_STYLE: Record<string, string> = {
  whatsapp: "border-emerald-700/60 bg-emerald-950/20 text-emerald-300",
  sms: "border-sky-700/60 bg-sky-950/20 text-sky-300",
  call: "border-amber-700/60 bg-amber-950/20 text-amber-300",
  telegram: "border-blue-700/60 bg-blue-950/20 text-blue-300",
  email: "border-violet-700/60 bg-violet-950/20 text-violet-300",
};

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <PrivateShell
      eyebrow="Comm center · credentials"
      title="Accounts"
      description="Multiple accounts per channel. The default is used unless an approval specifies another."
      accent="emerald"
      icon={<KeyRound className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Add account</h2>
          <form action={createAccountAction} className="mt-4 flex flex-col gap-3">
            <select name="channel" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]">
              {["whatsapp", "sms", "call", "telegram", "email"].map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
            <input name="label" required placeholder="Label (e.g. Personal, Work)" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="phoneNumberId" placeholder="WhatsApp phone number id" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="token" type="password" placeholder="WhatsApp token" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="accountSid" type="password" placeholder="Twilio account SID" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="authToken" type="password" placeholder="Twilio auth token" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="fromNumber" placeholder="From number (Twilio) / sender (email)" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="chatId" placeholder="Telegram chat id" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <button type="submit" className="border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
              Save account
            </button>
          </form>
          <p className="mt-4 border-t border-white/5 pt-3 text-[10px] leading-4 tracking-wide text-amber-400/80">
            Secrets are stored in your own MongoDB and are never sent to the browser. Prefer env vars for production.
          </p>
        </aside>

        <section className="space-y-3">
          {accounts.length === 0 && (
            <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
              No accounts yet. Messaging falls back to env vars.
            </div>
          )}
          {accounts.map((account: any) => (
            <article key={account._id} className="panel-cyber p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${CHANNEL_STYLE[account.channel] || ""}`}>
                      {account.channel}
                    </span>
                    {account.isDefault && (
                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#c8b48a]">
                        <Star className="h-3 w-3" /> default
                      </span>
                    )}
                    <span className={`text-[9px] uppercase tracking-widest ${account.hasSecrets ? "text-emerald-400" : "text-amber-400"}`}>
                      {account.hasSecrets ? "secrets set" : "no secrets"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-shell-text">{account.label}</h3>
                  <p className="mt-1 text-[11px] text-shell-muted">
                    {Object.entries(account.config).map(([key, value]) => `${key}: ${value}`).join(" · ") || "no config"}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!account.isDefault && (
                    <form action={setDefaultAccountAction}>
                      <input type="hidden" name="id" value={account._id} />
                      <button className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#c8b48a]">
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
          ))}
        </section>
      </div>
    </PrivateShell>
  );
}
