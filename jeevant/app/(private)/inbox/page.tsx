import Link from "next/link";
import PrivateShell from "@/components/layout/PrivateShell";
import { listMessages } from "@/lib/integrations/gmail-read";
import { Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

function shortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "in:inbox").trim();
  const result = await listMessages({ query, count: 12 });

  return (
    <PrivateShell
      eyebrow="Comm center · mail"
      title="Inbox"
      description="Read-only Gmail search and summaries. Replies are drafted in your style and wait in approvals; nothing sends itself."
      accent="emerald"
      icon={<Inbox className="h-6 w-6 text-emerald-400" />}
    >
      <form method="get" className="panel-cyber flex flex-wrap items-center gap-2 p-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="in:inbox is:unread newer_than:7d"
          className="min-w-0 flex-1 border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]"
        />
        <button
          type="submit"
          className="border border-[color:var(--shell-accent)]/50 bg-[color:var(--shell-accent)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/20"
        >
          Search
        </button>
        <Link
          href="/inbox"
          className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-shell-muted hover:text-shell-text"
        >
          Reset
        </Link>
      </form>

      {!result.ok ? (
        <div className="mt-4 border border-amber-800/50 bg-amber-950/20 p-4 text-[11px] leading-5 text-amber-200">
          {result.detail}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {result.messages.map((message) => (
          <Link
            key={message.id}
            href={`/inbox/${message.id}`}
            className="panel-cyber block p-4 transition hover:border-[color:var(--shell-accent)]/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-shell-muted">
                  {message.unread ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /> : null}
                  <span className="truncate">{message.from || "unknown sender"}</span>
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-shell-text">{message.subject}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-shell-muted">{message.snippet}</p>
              </div>
              <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] text-shell-muted/60">
                {shortDate(message.date)}
              </span>
            </div>
          </Link>
        ))}

        {result.ok && result.messages.length === 0 ? (
          <p className="panel-cyber p-8 text-center text-[10px] uppercase tracking-[0.16em] text-shell-muted/60">
            No messages matched.
          </p>
        ) : null}
      </div>
    </PrivateShell>
  );
}
