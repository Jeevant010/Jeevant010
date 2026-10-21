import { getVoiceCaptures, getMorningDigest } from "@/lib/actions/voice.actions";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import VoiceHub from "@/components/voice/VoiceHub";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const captures = await getVoiceCaptures();
  const digest = await getMorningDigest();

  return (
    <div className="-m-8 min-h-screen bg-[#08080a] p-6 font-mono text-shell-text sm:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-shell-border pb-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-[color:var(--accent)] shadow-[0_0_15px_var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--accent)]">
              COMM_CENTER // VOICE_OPS
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter sm:text-5xl">Voice Inbox</h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-shell-muted">
            // Speak once. Get the email, the post, the outline, and the schedule.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <VoiceRecorder />
          </div>
          <VoiceHub initialCaptures={captures as any} digest={digest as any} />
        </div>
      </div>
    </div>
  );
}
