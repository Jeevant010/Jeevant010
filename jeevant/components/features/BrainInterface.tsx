"use client";

import { useState, useRef, useEffect } from "react";
import { createNote, deleteNote, updateNote, toggleNoteVisibility } from "@/lib/actions/note.actions";
import { Send, Hash, Search, Trash2, Edit2, Globe, Lock, Save, X } from "lucide-react";

export default function BrainInterface({ initialNotes }: { initialNotes: any[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract unique tags for sidebar
  const allTags = Array.from(new Set(initialNotes.flatMap(n => n.tags)));

  // Filter notes
  const filteredNotes = initialNotes.filter(n => {
    const matchesTag = activeTag ? n.tags.includes(activeTag) : true;
    const matchesSearch = search ? (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())) : true;
    return matchesTag && matchesSearch;
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current && !editingId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredNotes.length, editingId]);

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-8 bg-shell-bg overflow-hidden border-t border-shell-border font-mono">
      
      {/* SIDEBAR: Tags / Chat History */}
      <div className="w-64 border-r border-shell-border bg-shell-surface/50 hidden md:flex flex-col">
        <div className="p-4 border-b border-shell-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-shell-muted" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brain..." 
              className="w-full bg-shell-bg border border-shell-border text-shell-text px-9 py-2 text-xs focus:outline-none focus:border-shell-accent transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-shell-muted mb-4">Neural Pathways (Tags)</h3>
          <button 
            onClick={() => setActiveTag(null)}
            className={`w-full text-left px-3 py-2 text-xs mb-1 transition-colors ${!activeTag ? 'bg-shell-accent/10 text-shell-accent border-l-2 border-shell-accent' : 'text-shell-muted hover:bg-shell-text/5 hover:text-shell-text'}`}
          >
            # All Logs
          </button>
          {allTags.map((tag: any) => (
            <button 
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`w-full text-left px-3 py-2 text-xs mb-1 flex items-center gap-2 transition-colors ${activeTag === tag ? 'bg-shell-accent/10 text-shell-accent border-l-2 border-shell-accent' : 'text-shell-muted hover:bg-shell-text/5 hover:text-shell-text'}`}
            >
              <Hash className="w-3 h-3 opacity-50" /> {tag}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_100%)]">
        
        <div className="p-4 border-b border-shell-border bg-shell-surface/80 backdrop-blur flex justify-between items-center z-10">
           <h2 className="text-sm font-bold tracking-widest uppercase text-shell-text">
             {activeTag ? `CHANNEL: #${activeTag}` : "CHANNEL: #GLOBAL_LOG"}
           </h2>
           <span className="text-[10px] text-shell-muted uppercase tracking-widest">{filteredNotes.length} Entries</span>
        </div>

        {/* MESSAGES FEED */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-shell-muted text-sm uppercase tracking-widest opacity-50">
               No data found in this pathway.
            </div>
          ) : (
            filteredNotes.slice().reverse().map((note) => (
              <ChatBubble 
                key={note._id} 
                note={note} 
                isEditing={editingId === note._id}
                onEditStart={() => setEditingId(note._id)}
                onEditCancel={() => setEditingId(null)}
              />
            ))
          )}
        </div>

        {/* INPUT DOCK */}
        <div className="p-4 bg-shell-surface border-t border-shell-border">
          <form action={createNote} className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 bg-shell-bg border border-shell-border focus-within:border-shell-accent transition-colors p-2 flex flex-col">
               <input 
                 name="title" 
                 placeholder="Log Title..." 
                 required 
                 className="bg-transparent border-b border-shell-border/50 text-shell-text text-sm font-bold px-2 py-1 mb-2 outline-none w-full"
               />
               <textarea 
                 name="content" 
                 placeholder="Type your thoughts, code, or research here..." 
                 required 
                 className="bg-transparent text-sm text-shell-text placeholder-shell-muted px-2 py-1 outline-none resize-none h-16 custom-scrollbar w-full"
               />
               <div className="flex justify-between items-center px-2 mt-2">
                 <input 
                   name="tags" 
                   placeholder="tags, comma, separated" 
                   defaultValue={activeTag ? activeTag : ""}
                   className="bg-transparent text-xs text-shell-accent outline-none w-1/2"
                 />
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-shell-muted uppercase tracking-widest">Visibility:</span>
                    <select name="visibility" className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-1">
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                 </div>
               </div>
            </div>
            <button type="submit" className="bg-shell-text text-shell-bg h-12 px-6 font-bold hover:bg-shell-accent transition-colors flex items-center justify-center">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual messages
function ChatBubble({ note, isEditing, onEditStart, onEditCancel }: { note: any, isEditing: boolean, onEditStart: () => void, onEditCancel: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if(!confirm("Permanently delete this log?")) return;
    setLoading(true);
    await deleteNote(note._id);
    setLoading(false);
  };

  const handleToggleVis = async () => {
    setLoading(true);
    await toggleNoteVisibility(note._id, note.visibility);
    setLoading(false);
  };

  if (isEditing) {
    return (
      <div className="w-full max-w-3xl ml-auto bg-shell-surface border border-shell-accent p-4 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative">
        <div className="text-[10px] uppercase text-shell-accent font-bold tracking-widest mb-3 flex items-center gap-2">
          <Edit2 className="w-3 h-3" /> EDITING LOG
        </div>
        <form action={async (formData) => {
          setLoading(true);
          await updateNote(note._id, formData);
          setLoading(false);
          onEditCancel();
        }}>
          <input name="title" defaultValue={note.title} className="w-full bg-shell-bg text-shell-text p-2 mb-2 border border-shell-border outline-none focus:border-shell-accent font-bold text-sm" />
          <textarea name="content" defaultValue={note.content} className="w-full bg-shell-bg text-shell-text p-2 mb-2 border border-shell-border outline-none focus:border-shell-accent text-sm h-32 custom-scrollbar resize-none" />
          <div className="flex justify-between items-center">
            <input name="tags" defaultValue={note.tags.join(", ")} className="w-1/2 bg-shell-bg text-shell-accent text-xs p-2 border border-shell-border outline-none focus:border-shell-accent" />
            <select name="visibility" defaultValue={note.visibility} className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-2">
               <option value="private">Private</option>
               <option value="public">Public</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
             <button type="button" onClick={onEditCancel} className="px-4 py-2 text-xs uppercase tracking-widest text-shell-muted hover:text-shell-text transition-colors">Cancel</button>
             <button type="submit" disabled={loading} className="bg-shell-accent text-shell-bg px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90">
                <Save className="w-3 h-3" /> Save Changes
             </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl ml-auto bg-shell-surface/80 border border-shell-border p-5 group hover:border-shell-accent/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-bold text-shell-text uppercase tracking-wider">{note.title}</h3>
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={handleToggleVis} disabled={loading} title={note.visibility === 'public' ? "Make Private" : "Make Public"} className={`text-xs flex items-center gap-1 uppercase tracking-widest ${note.visibility === 'public' ? 'text-green-400' : 'text-amber-500'}`}>
             {note.visibility === 'public' ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
           </button>
           <div className="w-px h-3 bg-shell-border"></div>
           <button onClick={onEditStart} className="text-shell-muted hover:text-shell-accent transition-colors">
             <Edit2 className="w-4 h-4" />
           </button>
           <button onClick={handleDelete} disabled={loading} className="text-shell-muted hover:text-red-500 transition-colors">
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
      
      <div className="text-sm text-shell-muted leading-relaxed whitespace-pre-wrap mb-4 font-sans">
        {note.content}
      </div>
      
      <div className="flex justify-between items-center border-t border-shell-border/50 pt-3">
        <div className="flex gap-2 text-[10px] uppercase tracking-widest text-shell-accent">
          {note.tags.map((t: string) => <span key={t}>#{t}</span>)}
        </div>
        <div className="text-[10px] text-shell-muted uppercase tracking-widest">
           {new Date(note.updatedAt || note.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
