"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Copy, Trash2, Loader2, ExternalLink, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { dispatchPost, deletePost, duplicatePost } from "@/lib/actions/content.actions";
import { CHANNEL_ACCENT } from "@/lib/catalog/channels";

const STATUS_STYLE: Record<string, string> = {
  draft: "border-slate-700 text-slate-400",
  queued: "border-amber-700 text-amber-400",
  published: "border-emerald-700 text-emerald-400",
  failed: "border-rose-800 text-rose-400",
};

interface Post {
  _id: string;
  title: string;
  body: string;
  summary?: string;
  status: string;
  source: string;
  channels: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  dispatch: { _id: string; channel: string; ok: boolean; mode: string; url?: string; detail?: string; at?: string }[];
}

export default function PostBoard({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<any>) {
    setBusy(label);
    setToast(null);
    try {
      const result = await fn();
      setToast({ ok: !!result?.success, text: result?.detail || (result?.success ? "Done." : "Failed.") });
      router.refresh();
    } catch (error) {
      setToast({ ok: false, text: (error as Error).message });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className={`flex items-center gap-2 border px-4 py-3 text-xs uppercase tracking-widest ${
          toast.ok ? "border-emerald-800 bg-emerald-950/30 text-emerald-400" : "border-rose-800 bg-rose-950/30 text-rose-400"
        }`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.text}
        </div>
      )}

      {posts.length === 0 && (
        <div className="cut-corners border border-shell-border bg-[#0a0a0f]/60 p-10 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
          No posts yet. Write one above, or promote a voice draft here.
        </div>
      )}

      {posts.map((post) => (
        <article key={post._id} className="cut-corners border border-shell-border bg-[#0a0a0f]/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${STATUS_STYLE[post.status] || STATUS_STYLE.draft}`}>
                  {post.status}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-shell-muted">{post.source}</span>
                {post.scheduledAt && (
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-amber-500">
                    <Clock className="h-3 w-3" /> {new Date(post.scheduledAt).toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-bold text-shell-text">{post.title || "(untitled)"}</h3>
              <p className={`mt-2 text-xs leading-5 text-shell-muted ${open === post._id ? "" : "line-clamp-3"}`}>{post.body}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <IconButton icon={<Send className="h-3.5 w-3.5" />} label="Distribute" busy={busy === `d-${post._id}`} onClick={() =>
                run(`d-${post._id}`, () => dispatchPost(post._id))} />
              <IconButton icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" busy={busy === `c-${post._id}`} onClick={() =>
                run(`c-${post._id}`, () => duplicatePost(post._id))} />
              <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" busy={busy === `x-${post._id}`} onClick={() =>
                run(`x-${post._id}`, () => deletePost(post._id))} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.channels.map((channel) => (
              <span key={channel} className={`border px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${CHANNEL_ACCENT[
                channel === "telegram" ? "sky" : channel === "whatsapp" ? "emerald" : channel === "twitter" ? "slate" :
                channel === "linkedin" ? "blue" : channel === "youtube" ? "rose" : channel === "reddit" ? "orange" : "violet"
              ]}`}>
                {channel}
              </span>
            ))}
            <button onClick={() => setOpen(open === post._id ? null : post._id)} className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-widest text-shell-muted hover:text-shell-text">
              <FileText className="h-3 w-3" /> {open === post._id ? "Collapse" : "Expand"}
            </button>
          </div>

          {post.dispatch?.length > 0 && (
            <div className="mt-4 border-t border-shell-border pt-3">
              <div className="mb-2 text-[9px] uppercase tracking-widest text-shell-muted">Dispatch log</div>
              <div className="flex flex-col gap-1">
                {post.dispatch.slice().reverse().map((entry) => (
                  <div key={entry._id} className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className={entry.ok ? "text-emerald-400" : "text-rose-400"}>{entry.ok ? "✓" : "✗"}</span>
                    <span className="font-bold uppercase tracking-widest text-shell-text">{entry.channel}</span>
                    <span className="text-shell-muted">{entry.mode}</span>
                    {entry.detail && <span className="text-shell-muted/70">{entry.detail}</span>}
                    {entry.url && (
                      <a href={entry.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[color:var(--accent)] hover:underline">
                        open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function IconButton({ icon, label, onClick, busy }: { icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-2 border border-shell-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-text transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon} {label}
    </button>
  );
}
