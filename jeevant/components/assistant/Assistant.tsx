"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Volume2, VolumeX, Send, Bot, CornerDownRight } from "lucide-react";

type Action = { tool: string; ok: boolean; result: string; needsConfirm?: boolean };
type Entry = { kind: "user" | "agent"; text: string; actions?: Action[]; provider?: string };

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function Assistant() {
  const router = useRouter();
  const [log, setLog] = useState<Entry[]>([
    { kind: "agent", text: "I'm listening. Hold the orb and talk, or type below." },
  ]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [tts, setTts] = useState(true);
  const [input, setInput] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log, busy]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  function speak(text: string) {
    if (!tts || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  const push = (entry: Entry) => setLog((prev) => [...prev, entry]);

  async function ask(prompt: string) {
    push({ kind: "user", text: prompt });
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);
      push({ kind: "agent", text: json.reply, actions: json.actions, provider: json.provider });
      speak(json.reply || "Done.");
      router.refresh();
    } catch (error) {
      push({ kind: "agent", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function askVoice(blob: Blob) {
    push({ kind: "user", text: "🎙 …" });
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("audio", new File([blob], "assistant.webm", { type: blob.type || "audio/webm" }));
      const res = await fetch("/api/agent/voice", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);
      setLog((prev) => {
        const next = [...prev];
        next[next.length - 1] = { kind: "user", text: json.transcript };
        return next;
      });
      push({ kind: "agent", text: json.reply, actions: json.actions, provider: json.provider });
      speak(json.reply || "Done.");
      router.refresh();
    } catch (error) {
      push({ kind: "agent", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function start() {
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
        if (blob.size > 0) void askVoice(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      push({ kind: "agent", text: "Microphone access denied." });
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  return (
    <div className="panel-cyber flex min-h-[70vh] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
          <Bot className="h-4 w-4" /> Assistant
        </div>
        <button
          onClick={() => {
            setTts((value) => !value);
            if (typeof window !== "undefined") window.speechSynthesis?.cancel();
          }}
          className="flex items-center gap-2 border border-shell-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-shell-muted hover:text-shell-text"
        >
          {tts ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {tts ? "Voice on" : "Voice off"}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
        {log.map((entry, index) => (
          <div key={index}>
            {entry.kind === "user" ? (
              <div className="ml-auto max-w-[80%] border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-shell-text">
                {entry.text}
              </div>
            ) : (
              <div className="max-w-[85%]">
                <div className="flex items-start gap-2 text-sm">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-shell-text">{entry.text}</span>
                </div>
                {entry.provider && (
                  <p className={`mt-1 pl-6 text-[10px] uppercase tracking-widest ${entry.provider.startsWith("fallback") ? "text-amber-500" : "text-emerald-500"}`}>
                    via {entry.provider}
                  </p>
                )}
                {entry.actions?.map((action, actionIndex) => (
                  <div
                    key={actionIndex}
                    className={`ml-6 mt-2 flex items-start gap-2 border px-3 py-2 text-[11px] ${
                      action.ok ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300" : action.needsConfirm ? "border-amber-800/50 bg-amber-950/20 text-amber-300" : "border-rose-900/50 bg-rose-950/20 text-rose-300"
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
            <Loader2 className="h-3 w-3 animate-spin" /> working…
          </div>
        )}
      </div>

      <div className="border-t border-white/5 p-5">
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            disabled={busy}
            className={`relative flex h-28 w-28 select-none items-center justify-center rounded-full border transition-all ${
              recording
                ? "scale-105 border-rose-500 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.4)]"
                : "border-emerald-500/60 bg-emerald-500/5 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]"
            } disabled:opacity-50`}
            aria-label="Hold to talk"
          >
            {recording && <span className="absolute inset-0 animate-ping rounded-full border border-rose-500/50" />}
            {busy ? <Loader2 className="h-9 w-9 animate-spin text-emerald-400" /> : recording ? <Square className="h-9 w-9 text-rose-400" /> : <Mic className="h-9 w-9 text-emerald-400" />}
          </button>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (input.trim()) {
                void ask(input);
                setInput("");
              }
            }}
            className="flex w-full max-w-2xl items-center gap-2"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type instead, or ask what I remember…"
              className="flex-1 border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[color:var(--accent)]"
            />
            <button type="submit" disabled={busy || !input.trim()} className="border border-shell-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-text hover:border-emerald-500 disabled:opacity-40">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
