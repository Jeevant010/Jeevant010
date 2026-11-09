"use client";

import { useState } from "react";
import { Loader2, PlugZap } from "lucide-react";

type State = { status: "idle" | "busy" | "ok" | "fail"; detail: string };

export default function TestAccountButton({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "idle", detail: "" });

  async function run() {
    if (state.status === "busy") return;
    setState({ status: "busy", detail: "" });

    try {
      const res = await fetch("/api/accounts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setState({ status: json.ok ? "ok" : "fail", detail: String(json.detail || json.mode || "") });
    } catch (error) {
      setState({ status: "fail", detail: (error as Error).message });
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void run()}
        disabled={state.status === "busy"}
        className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted transition hover:text-[color:var(--shell-accent)] disabled:opacity-40"
      >
        {state.status === "busy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
        Test
      </button>
      {state.detail ? (
        <p
          className={`max-w-[22rem] text-right text-[10px] leading-4 ${
            state.status === "ok" ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {state.detail}
        </p>
      ) : null}
    </div>
  );
}
