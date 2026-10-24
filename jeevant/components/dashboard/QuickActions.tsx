"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Loader2, Play, Plus, Square, Timer } from "lucide-react";

type Shortcut = {
  label: string;
  action: string;
  args: () => Record<string, unknown>;
};

const SHORTCUTS: Shortcut[] = [
  {
    label: "Block 60m",
    action: "block_time",
    args: () => ({ title: "Focus block", start: new Date().toISOString(), minutes: 60 }),
  },
  { label: "Start focus", action: "start_focus", args: () => ({ intent: "Deep work" }) },
  {
    label: "Log 30m",
    action: "log_activity",
    args: () => ({ kind: "deep_work", label: "Deep work", minutes: 30 }),
  },
  { label: "End focus", action: "end_focus", args: () => ({}) },
];

export default function QuickActions() {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [task, setTask] = useState("");

  async function run(action: string, args: Record<string, unknown>, label: string) {
    if (busy) return;
    setBusy(label);
    setMessage("");

    try {
      const res = await fetch("/api/bridge/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, args }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.summary || `Failed (${res.status})`);
      setMessage(json.summary || "Done.");
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function addTask() {
    const title = task.trim();
    if (!title) return;
    await run("create_task", { title }, "task");
    setTask("");
  }

  return (
    <section className="panel-cyber p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--shell-accent)]">Quick actions</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-shell-muted/70">
            Runs against the real database, then refreshes this board.
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-[0.14em] text-shell-muted/50">session-authenticated</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.label}
            type="button"
            disabled={!!busy}
            onClick={() => void run(shortcut.action, shortcut.args(), shortcut.action)}
            className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-shell-muted transition hover:border-[color:var(--shell-accent)]/40 hover:text-[color:var(--shell-accent)] disabled:opacity-40"
          >
            {busy === shortcut.action ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : shortcut.action === "block_time" ? (
              <Timer className="h-3 w-3" />
            ) : shortcut.action === "start_focus" ? (
              <Crosshair className="h-3 w-3" />
            ) : shortcut.action === "end_focus" ? (
              <Square className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {shortcut.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={task}
          onChange={(event) => setTask(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void addTask();
            }
          }}
          placeholder="Add a task…"
          className="min-w-0 flex-1 border border-white/10 bg-black/50 px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--shell-accent)]/50"
        />
        <button
          type="button"
          disabled={!!busy || !task.trim()}
          onClick={() => void addTask()}
          className="inline-flex items-center gap-2 border border-[color:var(--shell-accent)]/40 bg-[color:var(--shell-accent)]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--shell-accent)] disabled:opacity-40"
        >
          {busy === "task" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Add
        </button>
      </div>

      {message ? <p className="mt-3 text-[10px] leading-4 text-shell-muted">{message}</p> : null}
    </section>
  );
}
