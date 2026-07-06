"use client";

import { useState, useRef, useEffect } from "react";
import { createNote, deleteNote, updateNote, toggleNoteVisibility } from "@/lib/actions/note.actions";
import { Send, Hash, Search, Trash2, Edit2, Globe, Lock, Save, X, ChevronDown, ChevronUp } from "lucide-react";

export default function BrainInterface({ initialNotes }: { initialNotes: any[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
    <div className="flex h-full w-full bg-shell-bg overflow-hidden font-mono">
      
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
      <div className="flex-1 flex flex-col relative min-h-0 min-w-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_100%)]">
        
        <div className="p-4 border-b shrink-0 border-shell-border bg-shell-surface/80 backdrop-blur flex justify-between items-center z-10">
           <h2 className="text-sm font-bold tracking-widest uppercase text-shell-text">
             {activeTag ? `CHANNEL: #${activeTag}` : "CHANNEL: #GLOBAL_LOG"}
           </h2>
           <span className="text-[10px] text-shell-muted uppercase tracking-widest">{filteredNotes.length} Entries</span>
        </div>

        {/* MESSAGES FEED */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
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
        <div className="p-4 shrink-0 bg-shell-surface border-t border-shell-border">
          <form action={createNote} className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex-1 bg-shell-bg border border-shell-border focus-within:border-shell-accent transition-colors p-3 flex flex-col gap-3">
               
               <div className="flex justify-between items-center mb-1">
                 <input name="title" placeholder="Log Title..." required className="flex-1 bg-transparent border-b border-shell-border/50 text-shell-text text-lg font-bold px-2 py-1 outline-none focus:border-shell-accent" />
                 <button 
                   type="button" 
                   onClick={() => setShowAdvanced(!showAdvanced)}
                   className="text-[10px] uppercase tracking-widest text-shell-muted hover:text-shell-text ml-4 flex items-center gap-1"
                 >
                   {showAdvanced ? <><ChevronUp className="w-3 h-3"/> Simple</> : <><ChevronDown className="w-3 h-3"/> Advanced</>}
                 </button>
               </div>

               <textarea name="content" placeholder="Type your thoughts, code, or research here (Markdown)..." required className="bg-transparent text-sm text-shell-text placeholder-shell-muted px-2 py-2 outline-none resize-none h-32 custom-scrollbar w-full border-b border-shell-border/50 focus:border-shell-accent" />
               
               {showAdvanced && (
                 <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                   <div className="grid grid-cols-2 gap-2">
                     <input name="category" placeholder="Category" className="bg-transparent border-b border-shell-border/50 text-shell-text text-sm px-2 py-1 outline-none" />
                     <input name="author" placeholder="Author/Source" className="bg-transparent text-xs text-shell-muted outline-none border-b border-shell-border/30 px-2 py-1" />
                   </div>
                   
                   <textarea name="summary" placeholder="Summary..." className="bg-transparent text-sm text-shell-text placeholder-shell-muted px-2 py-1 outline-none resize-none h-16 custom-scrollbar w-full border-b border-shell-border/50" />
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-2">
                     <input name="sourceUrl" placeholder="Source URL" className="bg-transparent text-xs text-shell-muted outline-none border-b border-shell-border/30 py-1" />
                     <input name="rating" type="number" min="1" max="10" placeholder="Rating (1-10)" className="bg-transparent text-xs text-shell-muted outline-none border-b border-shell-border/30 py-1" />
                     <input name="coverImage" placeholder="Cover Image URL" className="bg-transparent text-xs text-shell-muted outline-none border-b border-shell-border/30 py-1" />
                   </div>
                 </div>
               )}

               <div className="flex flex-col md:flex-row justify-between items-end md:items-center px-2 mt-2 gap-4">
                 <div className="flex flex-col gap-2 w-full md:w-1/2">
                   <input name="tags" placeholder="tags, comma, separated" defaultValue={activeTag ? activeTag : ""} className="bg-transparent text-xs text-shell-accent outline-none w-full border-b border-shell-border/50 py-1 focus:border-shell-accent" />
                   {showAdvanced && <input name="references" placeholder="References (CSV)" className="bg-transparent text-xs text-shell-muted outline-none w-full border-b border-shell-border/50 py-1" />}
                 </div>
                 <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
                   <select name="status" className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-1.5 focus:border-shell-accent">
                     <option value="draft">Draft</option>
                     <option value="review">Review</option>
                     <option value="published">Published</option>
                   </select>
                   <select name="visibility" className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-1.5 focus:border-shell-accent">
                     <option value="private">Private</option>
                     <option value="public">Public</option>
                   </select>
                   <button type="submit" className="bg-shell-text text-shell-bg px-6 py-1.5 font-bold hover:bg-shell-accent transition-colors flex items-center justify-center text-sm w-full md:w-auto mt-2 md:mt-0">
                     <Send className="w-4 h-4 mr-2" /> SUBMIT LOG
                   </button>
                 </div>
               </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual messages
function ChatBubble({ note, isEditing, onEditStart, onEditCancel }: { note: any, isEditing: boolean, onEditStart: () => void, onEditCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: note.title,
    content: note.content,
    tags: note.tags.join(", "),
    visibility: note.visibility || "private",
    author: note.author || "",
    sourceUrl: note.sourceUrl || "",
    rating: note.rating ? String(note.rating) : "",
    summary: note.summary || "",
    references: note.references ? note.references.join(", ") : "",
    category: note.category || "",
    status: note.status || "draft",
    coverImage: note.coverImage || "",
    isPublished: note.isPublished || false,
    wordCount: note.wordCount ? String(note.wordCount) : ""
  });

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
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input name="title" defaultValue={note.title} className="w-full bg-shell-bg text-shell-text p-2 border border-shell-border outline-none focus:border-shell-accent font-bold text-sm" />
            <input name="category" defaultValue={note.category} placeholder="Category" className="w-full bg-shell-bg text-shell-text p-2 border border-shell-border outline-none focus:border-shell-accent text-sm" />
          </div>
          <textarea name="summary" defaultValue={note.summary} placeholder="Summary..." className="w-full bg-shell-bg text-shell-text p-2 mb-2 border border-shell-border outline-none focus:border-shell-accent text-sm h-12 custom-scrollbar resize-none" />
          <textarea name="content" defaultValue={note.content} placeholder="Markdown content..." className="w-full bg-shell-bg text-shell-text p-2 mb-2 border border-shell-border outline-none focus:border-shell-accent text-sm h-32 custom-scrollbar resize-none" />
          
          <div className="grid grid-cols-4 gap-2 mb-2">
            <input name="author" defaultValue={note.author} placeholder="Author" className="w-full bg-shell-bg text-shell-muted p-2 border border-shell-border text-xs outline-none focus:border-shell-accent" />
            <input name="sourceUrl" defaultValue={note.sourceUrl} placeholder="Source URL" className="w-full bg-shell-bg text-shell-muted p-2 border border-shell-border text-xs outline-none focus:border-shell-accent" />
            <input name="rating" type="number" min="1" max="10" defaultValue={note.rating} placeholder="Rating 1-10" className="w-full bg-shell-bg text-shell-muted p-2 border border-shell-border text-xs outline-none focus:border-shell-accent" />
            <input name="coverImage" defaultValue={note.coverImage} placeholder="Cover Image URL" className="w-full bg-shell-bg text-shell-muted p-2 border border-shell-border text-xs outline-none focus:border-shell-accent" />
          </div>

          <div className="flex flex-col gap-2">
            <input name="tags" defaultValue={note.tags.join(", ")} placeholder="Tags CSV" className="w-full bg-shell-bg text-shell-accent text-xs p-2 border border-shell-border outline-none focus:border-shell-accent" />
            <input name="references" defaultValue={note.references?.join(", ")} placeholder="References CSV" className="w-full bg-shell-bg text-shell-muted text-xs p-2 border border-shell-border outline-none focus:border-shell-accent" />
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <select name="status" defaultValue={note.status} className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-2">
                 <option value="draft">Draft</option>
                 <option value="review">Review</option>
                 <option value="published">Published</option>
              </select>
              <select name="visibility" defaultValue={note.visibility} className="bg-shell-bg text-xs text-shell-muted border border-shell-border outline-none p-2">
                 <option value="private">Private</option>
                 <option value="public">Public</option>
              </select>
            </div>
            <div className="flex gap-2">
               <button type="button" onClick={onEditCancel} className="px-4 py-2 text-xs uppercase tracking-widest text-shell-muted hover:text-shell-text transition-colors">Cancel</button>
               <button type="submit" disabled={loading} className="bg-shell-accent text-shell-bg px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90">
                  <Save className="w-3 h-3" /> Save
               </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl ml-auto bg-shell-surface/80 border border-shell-border p-5 group hover:border-shell-accent/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-bold text-shell-text uppercase tracking-wider">{note.title}</h3>
        <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
