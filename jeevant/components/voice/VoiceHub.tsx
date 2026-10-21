"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Linkedin, Youtube, MessageSquare, Twitter, FileText, Trash2, Save, Copy,
  Send, CalendarClock, ListPlus, Inbox, RefreshCw, Loader2, Sparkles, AlertTriangle, CheckCircle2, Volume2,
} from "lucide-react";
import {
  deleteVoiceCapture, updateVoiceDraft, pushEmailDraft, lockSchedule,
  createTasksFromCapture, promoteDraftToPost,
} from "@/lib/actions/voice.actions";

const KIND_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  youtube: <Youtube className="h-3.5 w-3.5" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
  twitter: <Twitter className="h-3.5 w-3.5" />,
  generic: <FileText className="h-3.5 w-3.5" />,
};

const KIND_LABEL: Record<string, string> = {
  email: "Email", linkedin: "LinkedIn", youtube: "YouTube",
  whatsapp: "WhatsApp", twitter: "X", generic: "Note",
};

interface Draft { _id: string; kind: string; title: string; body: string; meta?: Record<string, unknown> }
interface Capture {
  _id: string;
  transcript: string;
  durationSec: number;
  status: string;
  intent: string;
  drafts: Draft[];
  calendarBlocks: { _id: string; title: string; start?: string; end?: string }[];
  taskSuggestions: { _id: string; title: string; priority?: string }[];
  simulated: boolean;
  error?: string;
  createdAt: string;
  provider?: { whisper?: string; llm?: string };
}

interface Digest {
  unreadMessages: { name: string; contact: string; preview: string; priority?: string; at?: string }[];
  overnightCaptures: { id: string; summary: string; intent: string; drafts: number }[];
  todayBlocks: { title: string; start?: string; end?: string }[];
}

export default function VoiceHub({ initialCaptures, digest }: { initialCaptures: Capture[]; digest: Digest }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(initialCaptures[0]?._id ?? null);
  const [activeKind, setActiveKind] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { title: string; body: string }>>({});
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const active = useMemo(
    () => initialCaptures.find((capture) => capture._id === activeId) || null,
    [initialCaptures, activeId]
  );

  const kinds = active ? Array.from(new Set(active.drafts.map((draft) => draft.kind))) : [];
  const currentKind = activeKind && kinds.includes(activeKind) ? activeKind : kinds[0];
  const draft = active?.drafts.find((item) => item.kind === currentKind) || null;

  const editOf = (d: Draft | null) =>
    d ? edits[d._id] ?? { title: d.title, body: d.body } : { title: "", body: "" };

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setToast(null);
    try {
      const result: any = await fn();
      if (result && typeof result === "object" && "success" in result) {
        setToast({ ok: !!result.success, text: result.detail || (result.success ? "Done." : "Failed.") });
      } else {
        setToast({ ok: true, text: "Done." });
      }
      router.refresh();
    } catch (error) {
      setToast({ ok: false, text: (error as Error).message });
    } finally {
      setBusy("");
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setToast({ ok: true, text: "Copied to clipboard." });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Morning digest */}
      <section className="cut-corners border border-shell-border bg-[#0a0a0f]/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--accent)]">
            <Sparkles className="h-4 w-4" /> 07:20 Digest
          </h2>
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-shell-muted hover:text-shell-text"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DigestCard title={`Overnight inbox (${digest.unreadMessages.length})`} icon={<Inbox className="h-4 w-4" />}>
            {digest.unreadMessages.slice(0, 4).map((message, index) => (
              <div key={index} className="border-b border-shell-border/40 pb-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-shell-text">{message.name}</span>
                  {message.priority && message.priority !== "low" && (
                    <span className="text-[9px] uppercase text-amber-400">{message.priority}</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-shell-muted">{message.preview}</p>
              </div>
            ))}
            {digest.unreadMessages.length === 0 && <Empty text="No overnight messages." />}
          </DigestCard>

          <DigestCard title={`Today's captures (${digest.overnightCaptures.length})`} icon={<Volume2 className="h-4 w-4" />}>
            {digest.overnightCaptures.slice(0, 4).map((capture) => (
              <button
                key={capture.id}
                onClick={() => setActiveId(capture.id)}
                className="block w-full border-b border-shell-border/40 pb-2 text-left text-xs hover:text-[color:var(--accent)]"
              >
                <span className="text-[9px] uppercase tracking-widest text-[color:var(--accent)]">{capture.intent} · {capture.drafts} drafts</span>
                <p className="mt-1 line-clamp-2 text-shell-muted">{capture.summary}</p>
              </button>
            ))}
            {digest.overnightCaptures.length === 0 && <Empty text="No captures today yet." />}
          </DigestCard>

          <DigestCard title={`Blocked time (${digest.todayBlocks.length})`} icon={<CalendarClock className="h-4 w-4" />}>
            {digest.todayBlocks.slice(0, 5).map((block, index) => (
              <div key={index} className="flex items-center justify-between border-b border-shell-border/40 pb-2 text-xs">
                <span className="text-shell-text">{block.title}</span>
                <span className="text-shell-muted">
                  {block.start ? new Date(block.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            ))}
            {digest.todayBlocks.length === 0 && <Empty text="Nothing on the calendar." />}
          </DigestCard>
        </div>
      </section>

      {toast && (
        <div className={`flex items-center gap-2 border px-4 py-3 text-xs uppercase tracking-widest ${
          toast.ok ? "border-emerald-800 bg-emerald-950/30 text-emerald-400" : "border-rose-800 bg-rose-950/30 text-rose-400"
        }`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Capture list */}
        <div className="cut-corners border border-shell-border bg-[#0a0a0f]/60 p-3">
          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
            Captures ({initialCaptures.length})
          </div>
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto custom-scrollbar">
            {initialCaptures.map((capture) => (
              <button
                key={capture._id}
                onClick={() => { setActiveId(capture._id); setActiveKind(null); }}
                className={`border p-3 text-left transition-colors ${
                  capture._id === activeId
                    ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/10"
                    : "border-shell-border hover:border-shell-muted"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-[color:var(--accent)]">{capture.intent}</span>
                  <span className="text-[9px] uppercase tracking-widest text-shell-muted">
                    {capture.drafts.length} drafts
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-shell-text">{capture.transcript || "(no transcript)"}</p>
                <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-widest text-shell-muted">
                  <span>{new Date(capture.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {capture.simulated && <span className="text-amber-500">simulated</span>}
                </div>
              </button>
            ))}
            {initialCaptures.length === 0 && <Empty text="No captures yet. Record your first voice note." />}
          </div>
        </div>

        {/* Detail */}
        <div className="cut-corners border border-shell-border bg-[#0a0a0f]/60 p-5">
          {!active ? (
            <Empty text="Select a capture to see its drafts." />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="border-b border-shell-border pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-shell-muted">Transcript</div>
                    <p className="mt-2 text-sm leading-6 text-shell-text">{active.transcript || "(no transcript)"}</p>
                  </div>
                  <button
                    onClick={() => run("delete", () => deleteVoiceCapture(active._id))}
                    className="flex shrink-0 items-center gap-1 border border-rose-900/60 px-2 py-1 text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-950/40"
                  >
                    {busy === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                  </button>
                </div>
                {active.error && (
                  <p className="mt-3 flex items-center gap-2 text-[11px] text-amber-400">
                    <AlertTriangle className="h-3 w-3" /> {active.error}
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {kinds.map((kind) => (
                  <button
                    key={kind}
                    onClick={() => setActiveKind(kind)}
                    className={`flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      kind === currentKind
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-shell-border text-shell-muted hover:text-shell-text"
                    }`}
                  >
                    {KIND_ICON[kind] || KIND_ICON.generic} {KIND_LABEL[kind] || kind}
                  </button>
                ))}
              </div>

              {draft ? (
                <div className="flex flex-col gap-3">
                  <input
                    value={editOf(draft).title}
                    onChange={(event) => setEdits((prev) => ({ ...prev, [draft._id]: { ...editOf(draft), title: event.target.value } }))}
                    className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
                    placeholder="Title / subject"
                  />
                  <textarea
                    value={editOf(draft).body}
                    onChange={(event) => setEdits((prev) => ({ ...prev, [draft._id]: { ...editOf(draft), body: event.target.value } }))}
                    rows={12}
                    className="w-full resize-y border border-shell-border bg-black px-3 py-2 text-sm leading-6 text-shell-text outline-none focus:border-[color:var(--accent)] custom-scrollbar"
                    placeholder="Draft body"
                  />
                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={<Save className="h-3.5 w-3.5" />} label="Save" busy={busy === "save"} onClick={() =>
                      run("save", () => updateVoiceDraft(active._id, draft._id, editOf(draft).body, editOf(draft).title))} />
                    <ActionButton icon={<Copy className="h-3.5 w-3.5" />} label="Copy" onClick={() => copy(editOf(draft).body)} />
                    {draft.kind === "email" && (
                      <ActionButton icon={<Send className="h-3.5 w-3.5" />} label="Gmail draft" busy={busy === "gmail"} onClick={() =>
                        run("gmail", () => pushEmailDraft(active._id, draft._id))} />
                    )}
                    <ActionButton icon={<Sparkles className="h-3.5 w-3.5" />} label="Send to Studio" busy={busy === "studio"} onClick={() =>
                      run("studio", () => promoteDraftToPost(active._id, draft._id))} />
                  </div>
                </div>
              ) : (
                <Empty text="No drafts of this type." />
              )}

              {/* Capture-level actions */}
              <div className="flex flex-wrap gap-2 border-t border-shell-border pt-4">
                {active.calendarBlocks.length > 0 && (
                  <ActionButton icon={<CalendarClock className="h-3.5 w-3.5" />} label={`Lock ${active.calendarBlocks.length} block(s)`} busy={busy === "schedule"} onClick={() =>
                    run("schedule", () => lockSchedule(active._id))} />
                )}
                {active.taskSuggestions.length > 0 && (
                  <ActionButton icon={<ListPlus className="h-3.5 w-3.5" />} label={`Create ${active.taskSuggestions.length} task(s)`} busy={busy === "tasks"} onClick={() =>
                    run("tasks", () => createTasksFromCapture(active._id))} />
                )}
              </div>

              {(active.calendarBlocks.length > 0 || active.taskSuggestions.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {active.calendarBlocks.length > 0 && (
                    <div className="border border-shell-border p-3">
                      <div className="mb-2 text-[10px] uppercase tracking-widest text-shell-muted">Suggested blocks</div>
                      {active.calendarBlocks.map((block) => (
                        <div key={block._id} className="border-b border-shell-border/40 py-1 text-xs text-shell-text">
                          {block.title}
                          {block.start && <span className="ml-2 text-shell-muted">{new Date(block.start).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {active.taskSuggestions.length > 0 && (
                    <div className="border border-shell-border p-3">
                      <div className="mb-2 text-[10px] uppercase tracking-widest text-shell-muted">Suggested tasks</div>
                      {active.taskSuggestions.map((task) => (
                        <div key={task._id} className="flex items-center justify-between border-b border-shell-border/40 py-1 text-xs text-shell-text">
                          <span>{task.title}</span>
                          <span className="text-[9px] uppercase text-shell-muted">{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DigestCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-shell-border p-4">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted">
        {icon} {title}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, busy }: { icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean }) {
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

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">{text}</p>;
}
