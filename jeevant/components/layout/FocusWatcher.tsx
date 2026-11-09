"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, X } from "lucide-react";
import { checkInAction } from "@/lib/actions/tracker.actions";

type Status = { active: boolean; intent?: string; due?: boolean; minutesSince?: number };

export default function FocusWatcher() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ active: false });
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/focus/status", { cache: "no-store" });
      if (!res.ok) return;
      setStatus(await res.json());
    } catch {
      // best effort
    }
  }, []);

  useEffect(() => {
    void poll();
    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, [poll]);

  async function answer(wasted: boolean) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("answer", wasted ? "Off task" : "On task");
      formData.set("wasted", String(wasted));
      await checkInAction(formData);
      setHidden(true);
      await poll();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!status.active || !status.due || hidden) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[60] border border-[#c8b48a]/50 bg-[#07080a]/95 p-3 text-[11px] text-shell-text shadow-2xl backdrop-blur md:left-auto md:right-4 md:w-96">
      <div className="flex items-start gap-2">
        <Timer className="mt-0.5 h-4 w-4 shrink-0 text-[#c8b48a]" />
        <div className="min-w-0 flex-1">
          <p className="font-bold uppercase tracking-widest text-[#c8b48a]">Focus check-in</p>
          <p className="mt-1 truncate text-shell-muted">{status.intent}</p>
          <p className="mt-1 text-shell-muted/70">No check-in for {status.minutesSince} min.</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => answer(false)}
              disabled={busy}
              className="border border-emerald-700/60 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-300"
            >
              On task
            </button>
            <button
              onClick={() => answer(true)}
              disabled={busy}
              className="border border-rose-800/60 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-rose-300"
            >
              Distracted
            </button>
          </div>
        </div>
        <button onClick={() => setHidden(true)} aria-label="Dismiss" className="text-shell-muted hover:text-shell-text">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
