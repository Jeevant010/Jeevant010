"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Plug, Save, Zap } from "lucide-react";
import { saveSettings, testChannel } from "@/lib/actions/integration.actions";
import { CHANNELS, CHANNEL_ACCENT } from "@/lib/catalog/channels";

interface Status {
  id: string;
  label: string;
  env: string;
  configured: boolean;
  detail: string;
}

const FIELDS: { key: string; label: string; placeholder: string; secret?: boolean; help: string }[] = [
  { key: "n8nWebhookUrl", label: "n8n Webhook URL", placeholder: "https://your-n8n/webhook/xxxx", help: "One webhook fans every post out to all platforms." },
  { key: "telegramBotToken", label: "Telegram Bot Token", placeholder: "123456:ABC-DEF…", secret: true, help: "From @BotFather. Enables direct posting." },
  { key: "telegramChatId", label: "Telegram Chat ID", placeholder: "-1001234567890", help: "Target channel/chat for direct posts." },
  { key: "whatsappNumber", label: "WhatsApp Number", placeholder: "919999999999", help: "With country code, no +. Used for share links." },
  { key: "gmailSender", label: "Gmail Sender", placeholder: "you@gmail.com", help: "Shown as the From address on Gmail drafts." },
  { key: "googleCalendarId", label: "Calendar ID", placeholder: "primary", help: "Where voice time-blocks get created." },
  { key: "siteUrl", label: "Public Site URL", placeholder: "https://jeevant.is-a.dev", help: "Attached to share links." },
  { key: "linkedinProfile", label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/…", help: "Reference link." },
  { key: "youtubeChannel", label: "YouTube Channel", placeholder: "https://youtube.com/@…", help: "Reference link." },
  { key: "twitterHandle", label: "X Handle", placeholder: "@jeevant010", help: "Reference handle." },
];

export default function IntegrationPanel({ statuses, settings }: { statuses: Status[]; settings: Record<string, string> }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [test, setTest] = useState<{ ok: boolean; text: string; url?: string } | null>(null);

  async function runTest(channel: string) {
    setBusy(channel);
    setTest(null);
    try {
      const result: any = await testChannel(channel);
      setTest({ ok: !!result?.success, text: `${channel}: ${result?.detail || ""}`, url: result?.url });
    } catch (error) {
      setTest({ ok: false, text: (error as Error).message });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-shell-muted">
          <Plug className="h-4 w-4" /> Connection status
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {statuses.map((status) => (
            <div key={status.id} className="cut-corners border border-shell-border bg-[#0a0a0f]/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-shell-text">{status.label}</span>
                {status.configured ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-shell-muted">{status.detail}</p>
              <code className="mt-2 block break-all text-[10px] text-[color:var(--accent)]">{status.env}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-shell-muted">
          <Zap className="h-4 w-4" /> Test a channel
        </h2>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => runTest(channel.id)}
              disabled={!!busy}
              className={`flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 ${CHANNEL_ACCENT[channel.accent]}`}
            >
              {busy === channel.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {channel.label}
            </button>
          ))}
        </div>
        {test && (
          <div className={`mt-3 flex flex-wrap items-center gap-2 border px-4 py-3 text-[11px] tracking-wide ${
            test.ok ? "border-emerald-800 bg-emerald-950/30 text-emerald-400" : "border-amber-800 bg-amber-950/20 text-amber-400"
          }`}>
            {test.text}
            {test.url && (
              <a href={test.url} target="_blank" rel="noreferrer" className="underline">
                open share link
              </a>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-shell-muted">
          <Save className="h-4 w-4" /> Runtime configuration
        </h2>
        <form
          action={async (formData) => {
            setBusy("save");
            await saveSettings(formData);
            setBusy("");
            router.refresh();
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          {FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">{field.label}</span>
              <input
                name={field.key}
                type={field.secret ? "password" : "text"}
                defaultValue={settings[field.key] || ""}
                placeholder={field.placeholder}
                className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
              />
              <span className="text-[10px] text-shell-muted/70">{field.help}</span>
            </label>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy === "save"}
              className="flex items-center gap-2 bg-[color:var(--accent)] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
            >
              {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save configuration
            </button>
            <p className="mt-2 text-[10px] text-shell-muted/70">
              API keys (Groq, Gemini, Google OAuth) stay in <code className="text-[color:var(--accent)]">.env.local</code> — never in the database.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
