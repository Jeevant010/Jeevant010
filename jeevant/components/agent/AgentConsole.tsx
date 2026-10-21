"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Mic,
  Square,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CornerDownRight,
} from "lucide-react";

type Action = {
  tool: string;
  args: Record<string, unknown>;
  ok: boolean;
  result: string;
  needsConfirm?: boolean;
};

type Entry = {
  kind: "user" | "agent";
  text: string;
  actions?: Action[];
  simulated?: boolean;
};

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function AgentConsole() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Entry[]>([
    { kind: "agent", text: "Operator ready. Type a command, or hold the mic." },
  ]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef("");

  const push = (entry: Entry) => setLog((prev) => [...prev, entry]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  async function send(prompt: string) {
    if (!prompt.trim() || busy) return;
    push({ kind: "user", text: prompt });
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);
      push({ kind: "agent", text: json.reply, actions: json.actions, simulated: json.simulated });
      router.refresh();
    } catch (error) {
      push({ kind: "agent", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function sendVoice(blob: Blob) {
    push({ kind: "user", text: "🎙 voice note…" });
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("audio", new File([blob], "agent.webm", { type: blob.type || "audio/webm" }));
      const res = await fetch("/api/agent/voice", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);
      setLog((prev) => {
        const next = [...prev];
        next[next.length - 1] = { kind: "user", text: json.transcript };
        return next;
      });
      push({ kind: "agent", text: json.reply, actions: json.actions, simulated: json.simulated });
      router.refresh();
    } catch (error) {
      push({ kind: "agent", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    if (recording || busy) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      mimeRef.current = mime;
      chunksRef.current = [];
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        cleanup();
        setRecording(false);
        if (blob.size > 0) void sendVoice(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      push({ kind: "agent", text: "Microphone access denied." });
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  return (
    <div className="panel-cyber overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
          <Bot className="h-4 w-4" /> Operator agent
        </div>
        <span className="text-[9px] uppercase tracking-widest text-shell-muted">
          tools write directly to MongoDB
        </span>
      </div>

      <div className="max-h-[52vh] space-y-4 overflow-y-auto p-5 custom-scrollbar">
        {log.map((entry, index) => (
          <div key={index}>
            {entry.kind === "user" ? (
              <div className="ml-auto max-w-[85%] border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-shell-text">
                {entry.text}
              </div>
            ) : (
              <div className="max-w-[90%] text-sm text-shell-muted">
                <div className="flex items-start gap-2">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-shell-text">{entry.text}</span>
                </div>
                {entry.simulated && entry.actions?.length ? (
                  <p className="mt-1 pl-6 text-[10px] uppercase tracking-widest text-amber-500">
                    fallback parser — add GEMINI_API_KEYS for free-form commands
                  </p>
                ) : null}
                {entry.actions?.map((action, actionIndex) => (
                  <div
                    key={actionIndex}
                    className={`ml-6 mt-2 flex items-start gap-2 border px-3 py-2 text-[11px] ${
                      action.ok
                        ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
                        : action.needsConfirm
                        ? "border-amber-800/50 bg-amber-950/20 text-amber-300"
                        : "border-rose-900/50 bg-rose-950/20 text-rose-300"
                    }`}
                  >
                    <CornerDownRight className="mt-0.5 h-3 w-3" />
                    <div>
                      <span className="font-bold uppercase tracking-widest">{action.tool}</span>
                      <span className="ml-2 text-shell-muted">{action.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 pl-6 text-[11px] uppercase tracking-widest text-shell-muted">
            <Loader2 className="h-3 w-3 animate-spin" /> thinking…
          </div>
        )}
      </div>

      <div className="border-t border-white/5 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='e.g. "add task: finish the RAG eval" or "note: paper idea | MCP latency"'
            className="flex-1 border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex items-center gap-2 border border-shell-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-text hover:border-[color:var(--accent)] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" /> Run
          </button>
          <button
            type="button"
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            disabled={busy}
            aria-label="Hold to talk"
            className={`flex items-center justify-center border px-3 py-2 transition-colors disabled:opacity-40 ${
              recording
                ? "border-rose-500 bg-rose-500/10 text-rose-400"
                : "border-shell-border text-shell-muted hover:border-emerald-500 hover:text-emerald-400"
            }`}
          >
            {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {["list tasks", "add task: review the paper draft", "note: idea | agent approvals queue"].map((sample) => (
            <button
              key={sample}
              onClick={() => setInput(sample)}
              className="border border-white/5 px-2 py-1 text-[10px] uppercase tracking-widest text-shell-muted hover:text-shell-text"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
