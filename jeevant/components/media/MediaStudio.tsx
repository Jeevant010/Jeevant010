"use client";

import { useRef, useState } from "react";
import { Loader2, Film, Share2, Download, Upload, AlertTriangle } from "lucide-react";

export default function MediaStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [seconds, setSeconds] = useState(2);
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function createVideo() {
    if (!files.length) return;
    setBusy(true);
    setError("");
    setVideoUrl("");
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("seconds", String(seconds));

      const res = await fetch("/api/media/video", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `Failed (${res.status})`);
      setVideoUrl(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function shareVideo() {
    if (!videoUrl) return;
    try {
      const blob = await (await fetch(videoUrl)).blob();
      const file = new File([blob], "jeevant-video.mp4", { type: "video/mp4" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Jeevant OS video" });
        setNote("Share sheet opened. Pick Instagram or LinkedIn.");
      } else {
        setNote("This browser cannot share files. Use Download, then post from the app.");
      }
    } catch (err) {
      setNote((err as Error).message);
    }
  }

  async function shareImage() {
    const image = files[0];
    if (!image) return;
    try {
      const file = new File([image], image.name, { type: image.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Jeevant OS image" });
        setNote("Share sheet opened. Pick Instagram or LinkedIn.");
      } else {
        setNote("This browser cannot share files. Download the image and post it from the app.");
      }
    } catch (err) {
      setNote((err as Error).message);
    }
  }

  function download(url: string, name: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  }

  return (
    <div className="panel-cyber p-5">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Create</h2>

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 border border-dashed border-white/15 px-4 py-8 text-[11px] uppercase tracking-widest text-shell-muted hover:border-[#c8b48a]/50 hover:text-[#d8cfbe]"
        >
          <Upload className="h-4 w-4" /> Choose images (up to 10)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
          className="hidden"
        />

        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {files.slice(0, 8).map((file, index) => (
              <div key={`${file.name}-${index}`} className="aspect-square overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-shell-muted">
          Seconds per image
          <input
            type="number"
            min={1}
            max={6}
            value={seconds}
            onChange={(event) => setSeconds(Number(event.target.value))}
            className="w-20 border border-shell-border bg-black px-2 py-1 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
          />
        </label>

        <button
          type="button"
          onClick={createVideo}
          disabled={busy || files.length === 0}
          className="flex items-center justify-center gap-2 border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
          {busy ? "Rendering…" : "Create video"}
        </button>

        {files.length > 0 && (
          <button
            type="button"
            onClick={shareImage}
            className="flex items-center justify-center gap-2 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#d8cfbe]"
          >
            <Share2 className="h-3.5 w-3.5" /> Share first image to an app
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 border border-rose-800/60 bg-rose-950/20 px-3 py-2 text-[11px] text-rose-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> {error}
        </div>
      )}

      {videoUrl && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <video src={videoUrl} controls className="mx-auto max-h-[460px] w-auto border border-white/10" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shareVideo}
              className="flex items-center gap-2 border border-[#c8b48a]/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/10"
            >
              <Share2 className="h-3.5 w-3.5" /> Share video
            </button>
            <button
              type="button"
              onClick={() => download(videoUrl, "jeevant-video.mp4")}
              className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#d8cfbe]"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        </div>
      )}

      {note && <p className="mt-3 text-[10px] uppercase tracking-widest text-[#c8b48a]">{note}</p>}
    </div>
  );
}
