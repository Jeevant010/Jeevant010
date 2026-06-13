"use client";

import { useState } from "react";
import { Copy, Trash2, Edit2, Check, X } from "lucide-react";
import { deleteSnippet, updateSnippet } from "@/lib/actions/snippet.actions";

export default function SnippetCard({ item }: { item: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [language, setLanguage] = useState(item.language);
  const [code, setCode] = useState(item.code);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code);
  };

  const handleSave = async () => {
    await updateSnippet(item._id, { title, language, code });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="group bg-[#221e1a] border-2 border-green-600 transition-colors p-1 relative overflow-hidden h-64 flex flex-col">
        <div className="bg-[#302822] p-2 flex justify-between items-center border-b border-[#403530] gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-[#1a1816] text-[#e0d0c0] px-1 text-sm outline-none border border-[#50453b]" />
          <input value={language} onChange={e => setLanguage(e.target.value)} className="w-16 bg-[#1a1816] text-[#8a7560] px-1 text-[10px] outline-none border border-[#50453b]" />
        </div>
        <div className="flex-1 bg-[#100e0c] p-1 overflow-hidden relative">
          <textarea value={code} onChange={e => setCode(e.target.value)} className="w-full h-full bg-[#1a1816] text-green-500/80 font-mono text-[10px] p-2 outline-none resize-none custom-scrollbar border border-[#50453b]" />
        </div>
        <div className="flex justify-end gap-2 p-2 bg-[#302822] border-t border-[#403530]">
          <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 p-1"><Check className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-[#221e1a] border-2 border-[#403530] hover:border-[#e0d0c0] transition-colors p-1 relative overflow-hidden h-64 flex flex-col">
      {/* Header */}
      <div className="bg-[#302822] p-2 flex justify-between items-center border-b border-[#403530]">
        <span className="font-bold text-[#e0d0c0] uppercase text-sm truncate">{item.title}</span>
        <span className="text-[10px] font-bold bg-[#1a1816] px-1 text-[#8a7560] border border-[#403530]">{item.language}</span>
      </div>

      {/* Code Preview */}
      <div className="flex-1 bg-[#100e0c] p-3 overflow-hidden relative">
         <pre className="text-[10px] font-mono text-green-500/80 leading-tight whitespace-pre-wrap break-all">
           {item.code.substring(0, 300)}...
         </pre>
         <div className="absolute inset-0 bg-gradient-to-t from-[#100e0c] to-transparent" />
      </div>

      {/* Hover Overlay Action */}
      <div className="absolute inset-0 bg-shell-bg/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={handleCopy} className="p-3 bg-white text-black rounded-full hover:scale-110 transition" title="Copy Code">
           <Copy className="w-6 h-6" />
         </button>
         <button onClick={() => setIsEditing(true)} className="p-3 bg-green-600 text-black rounded-full hover:scale-110 transition" title="Edit Snippet">
           <Edit2 className="w-6 h-6" />
         </button>
         <button onClick={() => deleteSnippet(item._id)} className="p-3 bg-red-600 text-black rounded-full hover:scale-110 transition" title="Delete Snippet">
           <Trash2 className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}
