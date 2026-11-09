import Link from "next/link";
import PrivateShell from "@/components/layout/PrivateShell";
import { getMessage, summarizeMessage } from "@/lib/integrations/gmail-read";
import { queueReplyAction } from "@/lib/actions/inbox.actions";
import { ArrowLeft, Bot, Reply } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getMessage(id);

  if (!result.ok || !result.message) {
    return (
      <PrivateShell
        eyebrow="Comm center · mail"
        title="Message"
        description="The message could not be loaded."
        accent="emerald"
        icon={<Bot className="h-6 w-6 text-emerald-400" />}
      >
        <div className="panel-cyber p-6 text-[11px] leading-5 text-amber-200">{result.detail}</div>
        <Link href="/inbox" className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-shell-muted hover:text-shell-text">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to inbox
        </Link>
      </PrivateShell>
    );
  }

  const message = result.message;
  const summary = await summarizeMessage(message);
  const body = message.body.length > 12000 ? `${message.body.slice(0, 12000)}\n\n…truncated` : message.body;

  return (
    <PrivateShell
      eyebrow="Comm center · mail"
      title={message.subject}
      description={`${message.from} · ${message.date}`}
      accent="emerald"
      icon={<Bot className="h-6 w-6 text-emerald-400" />}
      actions={
        <Link
          href="/inbox"
          className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-shell-muted hover:text-shell-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Inbox
        </Link>
      }
    >
      <article className="panel-cyber p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-shell-muted">
          <span>from {message.from}</span>
          <span>to {message.to || "me"}</span>
          <span>{message.date}</span>
        </div>
        <pre className="mt-4 max-h-[28rem] overflow-y-auto whitespace-pre-wrap break-words font-sans text-[13px] leading-6 text-shell-text custom-scrollbar">
          {body || message.snippet}
        </pre>
      </article>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-cyber p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-shell-muted">Summary</p>
          <div className="mt-3 whitespace-pre-wrap text-[12px] leading-6 text-shell-text">
            {summary.detail}
          </div>
          {!summary.ok ? (
            <p className="mt-2 text-[10px] leading-4 text-amber-300/80">
              Set GROQ_API_KEYS / GROQ_API_KEY for real summaries. The snippets above are still accurate.
            </p>
          ) : null}
        </div>

        <form action={queueReplyAction} className="panel-cyber h-fit p-5">
          <input type="hidden" name="id" value={message.id} />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-shell-muted">
            <Reply className="h-4 w-4" /> Draft a reply
          </div>
          <label className="mt-3 block text-[9px] uppercase tracking-[0.16em] text-shell-muted">
            Optional instruction
          </label>
          <textarea
            name="instruction"
            rows={4}
            placeholder="Say I can do Friday, keep it short."
            className="mt-1 w-full resize-none border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
          />
          <button
            type="submit"
            className="mt-3 flex w-full items-center justify-center gap-2 border border-[color:var(--shell-accent)]/50 bg-[color:var(--shell-accent)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/20"
          >
            <Reply className="h-3.5 w-3.5" /> Queue reply draft
          </button>
          <p className="mt-3 border-t border-white/5 pt-3 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/70">
            Drafted in your style and queued in approvals. Nothing sends from this page.
          </p>
        </form>
      </section>
    </PrivateShell>
  );
}
