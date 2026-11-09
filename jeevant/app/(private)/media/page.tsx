import PrivateShell from "@/components/layout/PrivateShell";
import MediaStudio from "@/components/media/MediaStudio";
import { Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default function MediaPage() {
  return (
    <PrivateShell
      eyebrow="Comm center · media"
      title="Media Studio"
      description="Turn images into a 1080×1920 video, then share it to the app you want."
      accent="violet"
      icon={<Film className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <MediaStudio />

        <aside className="panel-cyber h-fit p-5 text-[11px] leading-5 text-shell-muted">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">How sharing works</div>
          <ul className="mt-3 space-y-2">
            <li>• **Video** is rendered locally with ffmpeg: images → 1080×1920 MP4.</li>
            <li>• **Share** opens your phone’s share sheet. Pick Instagram or LinkedIn there.</li>
            <li>• Instagram and LinkedIn do not allow free silent posting from a website — the share sheet is the legitimate path.</li>
            <li>• On desktop, file sharing is often unavailable; use Download.</li>
            <li>• Rendering requires the app to run on your own server (filesystem write access).</li>
          </ul>
        </aside>
      </div>
    </PrivateShell>
  );
}
