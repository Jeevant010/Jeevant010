"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Radio, AlertTriangle, CheckCircle2 } from "lucide-react";

type Stage = "idle" | "recording" | "uploading" | "done" | "error";

const FOCUS = [
  { value: "", label: "Auto-detect" },
  { value: "email", label: "Email reply" },
  { value: "content", label: "Content (LinkedIn/YouTube)" },
  { value: "schedule", label: "Plan my day" },
];

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function extensionFor(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export default function VoiceRecorder({ onCaptured }: { onCaptured?: (capture: unknown) => void }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [focus, setFocus] = useState("");
  const [message, setMessage] = useState("Hold the mic and speak. Release to process.");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const startedAt = useRef(0);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => stopTracks(), [stopTracks]);

  const submit = useCallback(
    async (blob: Blob) => {
      setStage("uploading");
      setMessage("Transcribing and drafting…");
      try {
        const formData = new FormData();
        const file = new File([blob], `voice-note.${extensionFor(mimeRef.current)}`, {
          type: blob.type || "audio/webm",
        });
        formData.append("audio", file);
        formData.append("durationSec", String(secondsRef.current));
        if (focus) formData.append("hint", focus);

        const res = await fetch("/api/voice", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || `Request failed (${res.status})`);

        setStage("done");
        setMessage(json?.capture?.simulated ? "Draft ready (simulated — add API keys for real AI)." : "Draft ready.");
        onCaptured?.(json.capture);
        router.refresh();
      } catch (error) {
        setStage("error");
        setMessage((error as Error).message);
      }
    },
    [focus, onCaptured, router]
  );

  const start = useCallback(async () => {
    if (stage === "recording" || stage === "uploading") return;
    setStage("idle");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      mimeRef.current = mime;
      chunksRef.current = [];

      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        stopTracks();
        if (blob.size === 0) {
          setStage("error");
          setMessage("No audio captured. Try holding the mic a little longer.");
          return;
        }
        void submit(blob);
      };

      recorder.start();
      startedAt.current = Date.now();
      secondsRef.current = 0;
      setSeconds(0);
      timerRef.current = setInterval(() => {
        const value = Math.round((Date.now() - startedAt.current) / 1000);
        secondsRef.current = value;
        setSeconds(value);
      }, 250);
      setStage("recording");
      setMessage("Recording… release to process.");
    } catch {
      setStage("error");
      setMessage("Microphone access denied. Allow the mic in your browser settings.");
    }
  }, [stage, stopTracks, submit]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const recording = stage === "recording";

  return (
    <div className="cut-corners border border-shell-border bg-[#0a0a0f]/80 p-6 flex flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--accent)]">
          <Radio className="h-3 w-3 animate-pulse" /> Voice Input
        </div>
        <select
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          className="bg-black border border-shell-border px-2 py-1 text-[10px] uppercase tracking-widest text-shell-muted outline-none focus:border-[color:var(--accent)]"
        >
          {FOCUS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        disabled={stage === "uploading"}
        aria-label="Hold to record"
        className={`relative flex h-40 w-40 select-none items-center justify-center rounded-full border transition-all duration-300 ${
          recording
            ? "border-rose-500 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.4)] scale-105"
            : "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/5 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]"
        } ${stage === "uploading" ? "opacity-60" : ""}`}
      >
        {recording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full border border-rose-500/50" />
            <span className="absolute inset-[-10px] rounded-full border border-rose-500/20" />
          </>
        )}
        {stage === "uploading" ? (
          <Loader2 className="h-12 w-12 animate-spin text-[color:var(--accent)]" />
        ) : recording ? (
          <Square className="h-12 w-12 text-rose-400" />
        ) : (
          <Mic className="h-12 w-12 text-[color:var(--accent)]" />
        )}
      </button>

      <div className="flex h-8 items-end gap-1">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className={`w-1 rounded-full ${recording ? "bg-rose-500" : "bg-shell-border"}`}
            style={{
              height: recording ? `${20 + Math.abs(Math.sin((index + seconds) * 0.9)) * 60}%` : "12%",
              transition: "height 180ms ease",
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <div className="font-mono text-2xl text-shell-text">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </div>
        <div
          className={`mt-2 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest ${
            stage === "error" ? "text-rose-400" : stage === "done" ? "text-emerald-400" : "text-shell-muted"
          }`}
        >
          {stage === "error" && <AlertTriangle className="h-3 w-3" />}
          {stage === "done" && <CheckCircle2 className="h-3 w-3" />}
          {message}
        </div>
      </div>
    </div>
  );
}
