import { getNotes } from "@/lib/actions/note.actions";
import BrainInterface from "@/components/features/BrainInterface";

export const dynamic = "force-dynamic";

export default async function MindPlace() {
  const notes = await getNotes();

  return (
    <div className="flex flex-col h-screen bg-shell-bg text-shell-text overflow-hidden">
      {/* HEADER IS NOW INTEGRATED INTO THE INTERFACE OR MINIMALIZED */}
      <div className="relative shrink-0 overflow-hidden border-b border-white/5 px-8 pb-5 pt-8">
        <div className="page-atmosphere-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Access level admin · status connected
          </p>
          <h1 className="private-title mt-2">System / Neural Link</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <BrainInterface initialNotes={notes} />
      </div>
    </div>
  );
}