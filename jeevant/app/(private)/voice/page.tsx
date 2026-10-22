import { getVoiceCaptures, getMorningDigest } from "@/lib/actions/voice.actions";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import VoiceHub from "@/components/voice/VoiceHub";
import PrivateShell from "@/components/layout/PrivateShell";
import { Mic } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const captures = await getVoiceCaptures();
  const digest = await getMorningDigest();

  return (
    <PrivateShell
      eyebrow="Comm center · voice ops"
      title="Voice Inbox"
      description="Speak once. Get the email, the post, the outline, and the schedule."
      accent="emerald"
      icon={<Mic className="h-6 w-6 text-emerald-400" />}
    >
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <VoiceRecorder />
        </div>
        <VoiceHub initialCaptures={captures as any} digest={digest as any} />
      </div>
    </PrivateShell>
  );
}
