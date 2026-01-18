import { Search, Filter, Hash, Lock, Pin } from "lucide-react";

export default function SecondBrain() {
  const notes = [
    { title: "Project EcoSort Architecture", tag: "Dev", date: "2h ago", pinned: true, content: "Use RabbitMQ for the python worker queues...", secure: false },
    { title: "AWS Credentials (Dev)", tag: "Secrets", date: "1d ago", pinned: true, content: "***************", secure: true },
    { title: "Thesis Research Links", tag: "Uni", date: "3d ago", pinned: false, content: "1. Transformer Attention Papers\n2. LoRA Fine-tuning guide...", secure: false },
    { title: "React 19 Server Actions", tag: "Learning", date: "1w ago", pinned: false, content: "Notes on the new useFormStatus hook...", secure: false },
  ];

  return (
    <div className="space-y-8">
      
      {/* --- SEARCH BAR --- */}
      <div className="glass-card p-2 rounded-xl flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-500 ml-4" />
        <input 
          type="text" 
          placeholder="Search your second brain..." 
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 h-12"
        />
        <button className="p-2 mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* --- TAGS CLOUD --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {["All Notes", "Dev", "Uni", "Ideas", "Secrets", "Journal"].map((tag, i) => (
          <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {tag}
          </button>
        ))}
      </div>

      {/* --- NOTES GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Note Card */}
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-slate-900/50 transition cursor-pointer min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Create Note</span>
        </div>

        {notes.map((note, i) => (
          <div key={i} className="glass-card p-6 rounded-xl hover:translate-y-[-2px] transition group relative flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs px-2 py-1 rounded border ${note.tag === 'Secrets' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                #{note.tag}
              </span>
              {note.pinned && <Pin className="w-4 h-4 text-yellow-500 rotate-45" />}
            </div>
            
            <h3 className="font-bold text-lg text-white mb-2">{note.title}</h3>
            
            <div className="text-slate-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-4 font-mono">
              {note.secure ? (
                <div className="flex items-center gap-2 text-red-400/60 mt-4">
                  <Lock className="w-4 h-4" /> Encrypted Content
                </div>
              ) : note.content}
            </div>

            <div className="mt-auto text-xs text-slate-600 flex justify-between items-center">
              <span>{note.date}</span>
              <button className="opacity-0 group-hover:opacity-100 text-blue-400 hover:underline">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper icon
import { Plus } from "lucide-react";