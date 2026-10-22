"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageCircle, Smartphone, Phone } from "lucide-react";
import { sendMessage } from "@/lib/actions/message.actions";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { id: "sms", label: "SMS", icon: <Smartphone className="h-3.5 w-3.5" /> },
  { id: "call", label: "Call", icon: <Phone className="h-3.5 w-3.5" /> },
];

export default function MessageComposer() {
  const router = useRouter();
  const [channel, setChannel] = useState("whatsapp");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; url?: string } | null>(null);

  async function submit(formData: FormData) {
    setBusy(true);
    setResult(null);
    try {
      const outcome: any = await sendMessage(formData);
      setResult({ ok: !!outcome?.success, text: outcome?.detail || "", url: outcome?.url });
      router.refresh();
    } catch (error) {
      setResult({ ok: false, text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel-cyber p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {CHANNELS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setChannel(item.id)}
            className={`flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              channel === item.id
                ? "border-[#c8b48a]/60 bg-[#c8b48a]/10 text-[#d8cfbe]"
                : "border-white/10 text-shell-muted hover:text-shell-text"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <form action={submit} className="flex flex-col gap-3">
        <input type="hidden" name="channel" value={channel} />
        <input
          name="to"
          required
          placeholder="Recipient (e.g. +91 93061 30032)"
          className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
        />
        <textarea
          name="body"
          rows={channel === "call" ? 2 : 5}
          required={channel !== "call"}
          placeholder={channel === "call" ? "What should the call say? (optional)" : "Message"}
          className="resize-y border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a] custom-scrollbar"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {channel === "call" ? "Queue call" : "Send"}
        </button>
      </form>

      {result && (
        <div className={`mt-4 border px-3 py-2 text-[11px] ${result.ok ? "border-emerald-800/60 bg-emerald-950/20 text-emerald-300" : "border-rose-800/60 bg-rose-950/20 text-rose-300"}`}>
          {result.text}
          {result.url && (
            <a href={result.url} target="_blank" rel="noreferrer" className="ml-2 underline">
              open
            </a>
          )}
        </div>
      )}

      <p className="mt-4 border-t border-white/5 pt-3 text-[10px] uppercase tracking-widest text-shell-muted/70">
        By default every message waits in /approvals. Set AUTO_APPROVE=true to send immediately.
      </p>
    </div>
  );
}
