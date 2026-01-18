import { getNotes, createNote } from "@/lib/actions/note.actions";
import EvidenceCard from "@/components/features/EvidenceCard";
import { Search, Save } from "lucide-react";

export const dynamic = "force-dynamic";

// 1. Update the type definition to wrap searchParams in Promise<>
export default async function MindPlace({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  
  // 2. Await the params before using them
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || "";
  
  const notes = await getNotes(query);

  return (
    <div className="min-h-screen bg-[#1a1a1a] -m-8 p-8 relative overflow-hidden">
      
      {/* --- ATMOSPHERE BACKGROUND --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(60,60,60,1),rgba(10,10,10,1))] pointer-events-none" />
      
      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter" style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
            The Mind Place
          </h1>
          <p className="text-slate-400 font-mono mt-2">
            // CASE: JEEVANT_OS // EVIDENCE_LOG
          </p>
        </div>

        {/* Search Bar */}
        <form className="w-full md:w-96 mt-6 md:mt-0 relative">
          <input 
            name="q"
            defaultValue={query}
            placeholder="SEARCH EVIDENCE..." 
            className="w-full bg-black/30 border-b-2 border-slate-600 text-white px-4 py-3 focus:outline-none focus:border-white font-mono placeholder:text-slate-600 transition-colors"
          />
          <button type="submit" className="absolute right-0 top-3 text-slate-500 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="relative z-10 mb-16">
        <form action={createNote} className="bg-[#2a2a2a] border border-white/5 rounded-lg p-1 shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex flex-col p-2">
            <input 
              name="title" 
              required 
              placeholder="SUBJECT..." 
              className="bg-transparent text-lg font-bold text-white placeholder-slate-600 outline-none mb-2"
            />
            <textarea 
              name="content" 
              required 
              placeholder="Type your observations here..." 
              className="bg-transparent text-sm text-slate-300 placeholder-slate-700 outline-none resize-none h-20 font-mono custom-scrollbar"
            />
            <input 
              name="tags" 
              placeholder="TAGS (comma separated)..." 
              className="bg-transparent text-xs text-blue-400 placeholder-slate-700 outline-none mt-2 font-mono"
            />
          </div>
          <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded md:w-32 hover:bg-slate-200 transition flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-xs">
            <Save className="w-5 h-5" />
            Log Clue
          </button>
        </form>
      </div>

      {/* --- EVIDENCE BOARD --- */}
      {notes.length === 0 ? (
        <div className="relative z-10 text-center py-20 opacity-50">
          <p className="text-slate-600 font-mono text-xl">NO EVIDENCE FOUND ON DESK.</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {notes.map((note: any) => (
            <EvidenceCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}