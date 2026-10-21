"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Save, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createPost, dispatchPost } from "@/lib/actions/content.actions";
import { CHANNELS, CHANNEL_ACCENT } from "@/lib/catalog/channels";

export default function Composer() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string[]>(["linkedin", "telegram"]);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  async function submit(distribute: boolean) {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    formData.delete("channels");
    selected.forEach((channel) => formData.append("channels", channel));

    const scheduledRaw = String(formData.get("scheduledAt") || "");
    const isFuture = !!scheduledRaw && new Date(scheduledRaw).getTime() > Date.now();
    const willDispatch = distribute && !isFuture;

    setBusy(willDispatch ? "distribute" : "save");
    setToast(null);
    try {
      const created: any = await createPost(formData);
      if (!created?.success) {
        setToast({ ok: false, text: created?.detail || "Could not save post." });
        return;
      }

      if (willDispatch) {
        const result: any = await dispatchPost(created.postId, selected);
        const modes = (result?.outcomes || [])
          .map((outcome: any) => `${outcome.channel}: ${outcome.mode}${outcome.ok ? "" : " ✗"}`)
          .join(" · ");
        setToast({ ok: !!result?.success, text: modes || result?.detail || "Dispatched." });
      } else if (isFuture) {
        setToast({ ok: true, text: `Queued for ${new Date(scheduledRaw).toLocaleString()} — the cron endpoint will publish it.` });
      } else {
        setToast({ ok: true, text: "Draft saved." });
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setToast({ ok: false, text: (error as Error).message });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="cut-corners border border-shell-border bg-[#0a0a0f]/80 p-6">
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <input
          name="title"
          placeholder="Post title / hook"
          className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
        />
        <textarea
          name="body"
          required
          rows={8}
          placeholder="Write your update, thought, or launch note. This is the master copy that gets adapted per channel."
          className="resize-y border border-shell-border bg-black px-3 py-2 text-sm leading-6 text-shell-text outline-none focus:border-[color:var(--accent)] custom-scrollbar"
        />
        <div className="grid gap-3 md:grid-cols-3">
          <input
            name="summary"
            placeholder="Optional summary"
            className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
          />
          <input
            name="tags"
            placeholder="tags, comma, separated"
            className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
          />
          <label className="flex flex-col gap-1">
            <input
              name="scheduledAt"
              type="datetime-local"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
            />
            <span className="text-[10px] uppercase tracking-widest text-shell-muted/70">Schedule for later (queues it)</span>
          </label>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Distribute to</div>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((channel) => {
              const on = selected.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  title={channel.hint}
                  onClick={() => toggle(channel.id)}
                  className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    on ? CHANNEL_ACCENT[channel.accent] : "border-shell-border text-shell-muted hover:text-shell-text"
                  }`}
                >
                  {channel.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!!busy}
            className="flex items-center gap-2 border border-shell-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-text hover:border-[color:var(--accent)] disabled:opacity-50"
          >
            {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!!busy}
            className="flex items-center gap-2 bg-[color:var(--accent)] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
          >
            {busy === "distribute" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Save & distribute
          </button>
        </div>
      </form>

      {toast && (
        <div className={`mt-4 flex items-center gap-2 border px-4 py-3 text-xs uppercase tracking-widest ${
          toast.ok ? "border-emerald-800 bg-emerald-950/30 text-emerald-400" : "border-rose-800 bg-rose-950/30 text-rose-400"
        }`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}
