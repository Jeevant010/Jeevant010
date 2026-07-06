import { getNotes } from "@/lib/actions/note.actions";
import BrainInterface from "@/components/features/BrainInterface";

export const dynamic = "force-dynamic";

export default async function MindPlace() {
  const notes = await getNotes();

  return (
    <div className="flex flex-col h-screen bg-shell-bg text-shell-text overflow-hidden">
      {/* HEADER IS NOW INTEGRATED INTO THE INTERFACE OR MINIMALIZED */}
      <div className="pt-8 pb-4 border-b border-shell-border px-8 shrink-0">
         <h1 className="text-3xl font-black uppercase tracking-tight">System / Neural Link</h1>
         <p className="text-xs uppercase tracking-widest text-shell-muted mt-1">// Access Level: ADMIN // Status: CONNECTED</p>
      </div>

      <div className="flex-1 min-h-0">
        <BrainInterface initialNotes={notes} />
      </div>
    </div>
  );
}