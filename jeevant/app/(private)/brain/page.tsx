import { getNotes } from "@/lib/actions/note.actions";
import BrainInterface from "@/components/features/BrainInterface";

export const dynamic = "force-dynamic";

export default async function MindPlace() {
  const notes = await getNotes();

  return (
    <div className="min-h-screen bg-shell-bg text-shell-text">
      {/* HEADER IS NOW INTEGRATED INTO THE INTERFACE OR MINIMALIZED */}
      <div className="pt-8 pb-4 border-b border-shell-border px-8">
         <h1 className="text-3xl font-black uppercase tracking-tight">System / Neural Link</h1>
         <p className="text-xs uppercase tracking-widest text-shell-muted mt-1">// Access Level: ADMIN // Status: CONNECTED</p>
      </div>

      <BrainInterface initialNotes={notes} />
    </div>
  );
}