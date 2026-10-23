"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  CornerDownRight,
  Loader2,
  Mic,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { Briefing, HistoryEntry } from "@/lib/agent/briefing";

type Action = {
  tool: string;
  ok: boolean;
  result: string;
  needsConfirm?: boolean;
  args?: Record<string, unknown>;
  data?: unknown;
};

type AgentResult = { reply: string; actions?: Action[]; provider?: string };

type Entry = {
  id: string;
  kind: "user" | "agent";
  text: string;
  actions?: Action[];
  provider?: string;
};

const QUICK = [
  { label: "Brief me", prompt: "brief me" },
  { label: "Due today", prompt: "what's due today" },
  { label: "What did I do", prompt: "what did i do today" },
  { label: "Start focus", prompt: "start focus on the most important task" },
  { label: "Approvals", prompt: "show pending approvals" },
  { label: "Open record", prompt: "open projects" },
];

const MUTATING = new Set([
  "create_task",
  "complete_task",
  "delete_task",
  "create_note",
  "delete_note",
  "remember",
  "start_focus",
  "end_focus",
  "create_project",
  "add_achievement",
  "create_post",
  "log_activity",
  "start_activity",
  "stop_activity",
  "remind",
  "send_message",
  "send_message_to",
  "request_approval",
]);

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function dueLabel(value: string | null | undefined) {
  if (!value) return "no date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "no date";
  const today = new Date();
  const same =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (same) return "today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Assistant({
  initialBriefing,
  initialHistory,
  memoryCount,
}: {
  initialBriefing: Briefing;
  initialHistory: HistoryEntry[];
  memoryCount: number;
}) {
  const router = useRouter();
  const [briefing, setBriefing] = useState(initialBriefing);
  const [entries, setEntries] = useState<Entry[]>(() =>
    initialHistory.map((item) => ({
      id: uid(),
      kind: item.role === "user" ? "user" : "agent",
      text: item.content,
      provider: item.provider || undefined,
    }))
  );
  const [historyLimit, setHistoryLimit] = useState(6);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [tts, setTts] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.02);
  const [voiceName, setVoiceName] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hidden = Math.max(0, entries.length - historyLimit);
  const visibleEntries = useMemo(() => (hidden ? entries.slice(hidden) : entries), [entries, hidden]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, steps, busy]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      setVoiceName((current) => {
        if (current) return current;
        const preferred =
          list.find((voice) => /en-IN/i.test(voice.lang)) ||
          list.find((voice) => /en-GB/i.test(voice.lang)) ||
          list[0];
        return preferred?.name || "";
      });
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const cleanupAudio = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [cleanupAudio]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        setSpeaking(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const push = useCallback((entry: Entry) => setEntries((prev) => [...prev, entry]), []);

  function stopSpeaking() {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function speak(text: string) {
    if (!tts || typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = text.replace(/[*_`#>]/g, "").slice(0, 900).trim();
    if (!clean) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = rate;
    const voice = voices.find((item) => item.name === voiceName);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function refreshBriefing() {
    try {
      const res = await fetch("/api/agent/briefing", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json && !json.error) setBriefing(json as Briefing);
    } catch {
      // best effort
    }
  }

  function afterResult(result: AgentResult) {
    push({
      id: uid(),
      kind: "agent",
      text: result.reply || "Done.",
      actions: result.actions || [],
      provider: result.provider,
    });
    speak(result.reply || "");

    const opened = result.actions?.find((action) => action.tool === "open_page" && action.ok);
    const path = (opened?.data as { path?: string } | undefined)?.path;
    if (path) {
      window.setTimeout(() => router.push(path), 650);
      return;
    }

    void refreshBriefing();
    if (result.actions?.some((action) => MUTATING.has(action.tool))) {
      router.refresh();
    }
  }

  async function consumeStream(response: Response): Promise<AgentResult> {
    if (!response.body) throw new Error("No response stream.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result: AgentResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";

      for (const chunk of chunks) {
        let event = "message";
        let data = "";
        for (const line of chunk.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        let parsed: unknown;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }
        const payload = (parsed || {}) as { step?: unknown; message?: unknown };
        if (event === "status" && typeof payload.step === "string") {
          const step = payload.step;
          setSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
        } else if (event === "result") {
          result = parsed as AgentResult;
        } else if (event === "error") {
          throw new Error(typeof payload.message === "string" ? payload.message : "The agent failed.");
        }
      }
    }

    if (!result) throw new Error("The stream ended without a result.");
    return result;
  }

  async function askJson(prompt: string): Promise<AgentResult> {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);
    return json as AgentResult;
  }

  async function ask(prompt: string) {
    const clean = prompt.trim();
    if (!clean || busy) return;
    stopSpeaking();
    setInput("");
    setError("");
    setSteps([]);
    push({ id: uid(), kind: "user", text: clean });
    setBusy(true);

    try {
      let result: AgentResult;
      const res = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: clean }),
      });

      if (res.ok && res.body && (res.headers.get("content-type") || "").includes("text/event-stream")) {
        result = await consumeStream(res);
      } else {
        result = await askJson(clean);
      }
      afterResult(result);
    } catch (cause) {
      try {
        const result = await askJson(clean);
        afterResult(result);
      } catch (fallbackError) {
        const message = (fallbackError as Error).message || (cause as Error).message;
        setError(message);
        push({ id: uid(), kind: "agent", text: `I could not complete that: ${message}` });
      }
    } finally {
      setBusy(false);
      setSteps([]);
    }
  }

  async function askVoice(blob: Blob) {
    push({ id: uid(), kind: "user", text: "🎙 …" });
    setBusy(true);
    setSteps(["transcribing audio"]);
    setError("");

    try {
      const form = new FormData();
      form.append("audio", new File([blob], "assistant.webm", { type: blob.type || "audio/webm" }));
      const res = await fetch("/api/agent/voice", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);

      setEntries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.text === "🎙 …") {
          next[next.length - 1] = { ...last, text: json.transcript || "(no transcript)" };
        }
        return next;
      });
      afterResult(json as AgentResult);
    } catch (cause) {
      const message = (cause as Error).message;
      setError(message);
      push({ id: uid(), kind: "agent", text: `Voice failed: ${message}` });
    } finally {
      setBusy(false);
      setSteps([]);
    }
  }

  async function startRecording() {
    if (recording || busy) return;
    stopSpeaking();
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
        cleanupAudio();
        setRecording(false);
        if (blob.size > 0) void askVoice(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      cleanupAudio();
      setError("Microphone access denied.");
      push({ id: uid(), kind: "agent", text: "Microphone access denied. Type instead." });
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  function confirmAction(action: Action) {
    const query = String(action.args?.query || "");
    const prompt =
      action.tool === "delete_note"
        ? `confirm delete note: ${query}`
        : action.tool === "delete_task"
          ? `confirm delete task: ${query}`
          : `confirm ${action.tool.replace(/_/g, " ")}${query ? `: ${query}` : ""}`;
    void ask(prompt);
  }

  return (
    <div className="panel-cyber console-shell flex h-[calc(100svh-21rem)] min-h-[26rem] flex-col overflow-hidden lg:h-[calc(100svh-15rem)] lg:min-h-[32rem]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
            <Bot className="h-4 w-4 text-emerald-300" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Operator</p>
            <p className="hidden text-[10px] uppercase tracking-[0.16em] text-shell-muted sm:block">
              voice in · tools out · {memoryCount} memories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-shell-muted sm:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${briefing.live ? "bg-emerald-400" : "bg-amber-400"}`} />
            {briefing.live ? "database live" : "archive mode"}
          </span>
          <span className="hidden border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-shell-muted md:block">
            {briefing.provider}
          </span>
          {speaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 border border-rose-900/50 bg-rose-950/30 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-rose-300"
            >
              <VolumeX className="h-3 w-3" /> Stop
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowSettings((value) => !value)}
            className={`grid h-8 w-8 place-items-center border transition ${showSettings ? "border-emerald-500/50 text-emerald-300" : "border-white/10 text-shell-muted hover:text-shell-text"}`}
            aria-label="Voice settings"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="flex flex-wrap items-center gap-4 border-b border-white/8 bg-black/20 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              setTts((value) => !value);
              stopSpeaking();
            }}
            className="flex items-center gap-2 border border-white/10 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-shell-muted hover:text-shell-text"
          >
            {tts ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            {tts ? "voice on" : "voice off"}
          </button>

          <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-shell-muted">
            voice
            <select
              value={voiceName}
              onChange={(event) => setVoiceName(event.target.value)}
              className="max-w-[11rem] border border-white/10 bg-black px-2 py-1 text-[10px] text-shell-text outline-none"
            >
              {voices.length === 0 && <option value="">system default</option>}
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-shell-muted">
            rate {rate.toFixed(2)}
            <input
              type="range"
              min={0.7}
              max={1.5}
              step={0.02}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="w-24 accent-emerald-400"
            />
          </label>

          <span className="text-[9px] uppercase tracking-[0.16em] text-shell-muted/70">⌘K focuses the prompt · Esc stops speech</span>
        </div>
      )}

      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_21rem]">
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => setHistoryLimit((value) => value + 10)}
                className="mx-auto flex items-center gap-2 border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-shell-muted hover:text-shell-text"
              >
                <ChevronDown className="h-3 w-3" /> {hidden} earlier message{hidden === 1 ? "" : "s"}
              </button>
            )}

            <div className="lg:hidden">
              <BriefingCard briefing={briefing} onRefresh={() => void refreshBriefing()} />
            </div>

            {visibleEntries.map((entry) => (
              <div key={entry.id}>
                {entry.kind === "user" ? (
                  <div className="ml-auto max-w-[82%] chat-bubble-user px-4 py-3 text-sm text-shell-text">
                    {entry.text}
                  </div>
                ) : (
                  <div className="max-w-[92%]">
                    <div className="chat-bubble-agent px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <div className="chat-md min-w-0 flex-1 text-sm text-shell-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.text}</ReactMarkdown>
                        </div>
                      </div>
                      {entry.provider && (
                        <p
                          className={`mt-2 pl-6 text-[9px] uppercase tracking-[0.18em] ${
                            entry.provider.startsWith("fallback") ? "text-amber-400" : "text-emerald-400/80"
                          }`}
                        >
                          via {entry.provider}
                        </p>
                      )}
                    </div>

                    {entry.actions && entry.actions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {entry.actions.map((action, index) => (
                          <ActionCard
                            key={`${entry.id}-${index}`}
                            action={action}
                            onConfirm={() => confirmAction(action)}
                            onComplete={(title) => void ask(`complete task: ${title}`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="max-w-[92%] chat-bubble-agent px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  working
                </div>
                <ul className="mt-2 space-y-1 pl-5">
                  {(steps.length ? steps : ["connecting to the operator"]).map((step, index) => (
                    <li key={`${step}-${index}`} className="think-step flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-shell-muted">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-[11px] text-rose-300">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/8 p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {QUICK.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={busy}
                  onClick={() => void ask(item.prompt)}
                  className="shrink-0 border border-white/10 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-shell-muted transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  disabled={busy}
                  aria-label="Hold to talk"
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full border transition ${
                    recording
                      ? "border-rose-500 bg-rose-500/15 text-rose-300"
                      : "border-emerald-500/50 bg-emerald-500/5 text-emerald-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                  } disabled:opacity-40`}
                >
                  {recording && <span className="absolute inset-0 animate-ping rounded-full border border-rose-500/40" />}
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : recording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <span className="text-[8px] uppercase tracking-[0.16em] text-shell-muted">
                  {recording ? "release" : "hold"}
                </span>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (input.trim()) void ask(input);
                }}
                className="flex min-w-0 flex-1 items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (input.trim()) void ask(input);
                    }
                  }}
                  placeholder="Ask or command…"
                  className="max-h-32 min-h-11 flex-1 resize-none border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-shell-text outline-none transition focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="grid h-11 w-11 shrink-0 place-items-center border border-emerald-600/40 bg-emerald-950/30 text-emerald-300 transition hover:bg-emerald-900/40 disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="mt-2 flex items-center justify-between text-[8px] uppercase tracking-[0.16em] text-shell-muted/60">
              <span>Enter sends · Shift+Enter newline</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${recording ? "bg-rose-400" : "bg-emerald-400/60"}`} />
                {recording ? "listening" : tts ? "voice replies on" : "voice replies off"}
              </span>
            </div>
          </div>
        </div>

        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-l border-white/8 bg-black/20 p-4 custom-scrollbar lg:flex">
          <BriefingCard briefing={briefing} onRefresh={() => void refreshBriefing()} />

          <div className="border border-white/8 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-shell-muted">Session</p>
              <span className="live-dot" />
            </div>
            <dl className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-shell-muted">Provider</dt>
                <dd className="truncate text-shell-text">{briefing.provider}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-shell-muted">Memories</dt>
                <dd className="text-shell-text">{memoryCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-shell-muted">Voice</dt>
                <dd className="text-shell-text">{tts ? "on" : "off"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-shell-muted">Shortcuts</dt>
                <dd className="text-shell-text">⌘K · Esc</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-white/5 pt-3 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/70">
              Actions run against the same MongoDB collections as the admin pages. Outbound messages stay queued for
              approval.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BriefingCard({ briefing, onRefresh }: { briefing: Briefing; onRefresh: () => void }) {
  return (
    <div className="border border-white/8 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-300">Live state</p>
        <button type="button" onClick={onRefresh} aria-label="Refresh briefing" className="text-shell-muted hover:text-shell-text">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <p className="mt-3 font-serif text-2xl leading-tight tracking-[-0.03em] text-shell-text">
        {briefing.greeting}, Jeevant.
      </p>
      <p className="mt-2 text-[11px] leading-5 text-shell-muted">{briefing.line}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {briefing.stats.map((stat) => (
          <div key={stat.label} className="border border-white/8 p-2.5">
            <p className="text-[8px] uppercase tracking-[0.16em] text-shell-muted">{stat.label}</p>
            <p className="mt-1 font-serif text-2xl leading-none text-shell-text">{stat.value}</p>
            <p className="mt-1 truncate text-[8px] uppercase tracking-[0.12em] text-shell-muted/70">{stat.detail}</p>
          </div>
        ))}
      </div>

      {briefing.tasks.length > 0 && (
        <div className="mt-4">
          <p className="text-[8px] uppercase tracking-[0.18em] text-shell-muted">Next up</p>
          <ul className="mt-2 space-y-2">
            {briefing.tasks.slice(0, 4).map((task) => (
              <li key={task.title} className="flex items-start gap-2 text-[11px] leading-5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    task.priority === "high" ? "bg-rose-400" : task.priority === "low" ? "bg-slate-400" : "bg-amber-400"
                  }`}
                />
                <span className="flex-1 text-shell-text">{task.title}</span>
                <span className="shrink-0 text-[8px] uppercase tracking-[0.12em] text-shell-muted">
                  {dueLabel(task.due)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-[8px] uppercase tracking-[0.16em] text-shell-muted/60">
        <Sparkles className="h-3 w-3" /> read from the database, not guessed
      </p>
    </div>
  );
}

function ActionCard({
  action,
  onConfirm,
  onComplete,
}: {
  action: Action;
  onConfirm: () => void;
  onComplete: (title: string) => void;
}) {
  type TaskRow = { id?: string; title: string; priority?: string; due?: string | null };
  type ApprovalRow = { id?: string; title: string; kind?: string };
  const data = action.data;
  const tasks = action.tool === "list_tasks" && Array.isArray(data) ? (data as TaskRow[]) : null;
  const approvals =
    action.tool === "list_approvals" && Array.isArray(data) ? (data as ApprovalRow[]) : null;
  const compact = action.tool === "get_briefing" || action.tool === "open_page";
  const path =
    typeof (data as { path?: unknown } | undefined)?.path === "string"
      ? (data as { path: string }).path
      : "";

  return (
    <div
      className={`border px-3 py-2 text-[11px] ${
        action.needsConfirm
          ? "border-amber-800/50 bg-amber-950/20 text-amber-200"
          : action.ok
            ? "border-emerald-900/50 bg-emerald-950/15 text-emerald-200"
            : "border-rose-900/50 bg-rose-950/20 text-rose-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <CornerDownRight className="mt-0.5 h-3 w-3 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold uppercase tracking-[0.16em]">{action.tool.replace(/_/g, " ")}</span>
            <span className="text-shell-muted">
              {compact
                ? action.tool === "get_briefing"
                  ? "live state refreshed"
                  : "navigating"
                : action.result}
            </span>
          </div>

          {tasks && tasks.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {tasks.map((task) => (
                <li key={task.id || task.title} className="flex items-center gap-2 border-t border-white/5 pt-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      task.priority === "high" ? "bg-rose-400" : task.priority === "low" ? "bg-slate-400" : "bg-amber-400"
                    }`}
                  />
                  <span className="flex-1 text-shell-text">{task.title}</span>
                  <span className="text-[8px] uppercase tracking-[0.12em] text-shell-muted">{dueLabel(task.due)}</span>
                  <button
                    type="button"
                    onClick={() => onComplete(task.title)}
                    className="border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-shell-muted hover:text-emerald-300"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {approvals && approvals.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {approvals.map((item) => (
                <li key={item.id || item.title} className="border-t border-white/5 pt-1.5">
                  <span className="text-shell-text">{item.title}</span>
                  <span className="ml-2 text-[8px] uppercase tracking-[0.12em] text-shell-muted">{item.kind}</span>
                </li>
              ))}
              <li>
                <a href="/approvals" className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-amber-300 underline underline-offset-2">
                  Review approvals <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          )}

          {action.needsConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="mt-2 border border-amber-600/50 bg-amber-900/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-900/50"
            >
              Confirm
            </button>
          )}

          {action.tool === "open_page" && action.ok && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-emerald-300/80">
              navigating to {path}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
