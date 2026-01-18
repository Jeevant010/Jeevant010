"use client";

import { deleteNote } from "@/lib/actions/note.actions";
import { Trash2, Paperclip, Lock } from "lucide-react";
import { useState } from "react";

export default function EvidenceCard({ note }: { note: any }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Archive this evidence permanently?")) return;
    setLoading(true);
    await deleteNote(note._id);
    setLoading(false);
  };

  // Aesthetic: Random rotation for "scattered" look
  const rotation = Math.random() * 4 - 2; // Random rotation between -2deg and 2deg

  return (
    <div 
      className="relative group bg-[#fdfbf7] text-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:z-10"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape Effect at top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-200/40 backdrop-blur-sm rotate-1 shadow-sm"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b-2 border-slate-900/10 pb-2">
        <h3 className="font-bold text-xl font-mono tracking-tighter uppercase text-slate-900">
          {note.title}
        </h3>
        {note.isPinned && <Paperclip className="w-5 h-5 text-red-600" />}
      </div>

      {/* Content (Typewriter feel) */}
      <div className="font-mono text-sm text-slate-700 leading-relaxed min-h-[120px] whitespace-pre-wrap">
        {note.content}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-900/10">
        <div className="flex gap-1 flex-wrap">
          {note.tags.map((tag: string, i: number) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              #{tag}
            </span>
          ))}
        </div>
        <button 
          title="trash2"
          onClick={handleDelete}
          disabled={loading}
          className="text-slate-400 hover:text-red-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}