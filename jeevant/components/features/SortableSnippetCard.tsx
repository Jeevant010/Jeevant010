"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Trash2, Edit2, Check, X, GripHorizontal } from "lucide-react";
import { deleteSnippet, updateSnippet } from "@/lib/actions/snippet.actions";

export function SortableSnippetCard({ item }: { item: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title || "",
    language: item.language || "",
    code: item.code || "",
    description: item.description || "",
    tags: item.tags?.join(", ") || "",
    category: item.category || "",
    complexity: item.complexity || "beginner",
    estimatedTimeSaved: item.estimatedTimeSaved || "",
    dependencies: item.dependencies?.join(", ") || "",
    author: item.author || "",
    sourceUrl: item.sourceUrl || "",
    rating: item.rating || ""
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code);
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append("id", item._id);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value as string);
    });
    await updateSnippet(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="group bg-[#221e1a] border-2 border-green-600 transition-colors p-1 relative overflow-hidden h-[450px] flex flex-col z-50 overflow-y-auto custom-scrollbar">
        <div className="bg-[#302822] p-2 flex flex-col gap-2 border-b border-[#403530]">
          <div className="flex gap-2">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex-1 bg-[#1a1816] text-[#e0d0c0] px-1 py-1 text-sm outline-none border border-[#50453b]" placeholder="Title" />
            <input value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-20 bg-[#1a1816] text-[#8a7560] px-1 py-1 text-xs outline-none border border-[#50453b]" placeholder="Lang" />
          </div>
          <div className="flex gap-2">
            <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="flex-1 bg-[#1a1816] text-[#8a7560] px-1 py-1 text-xs outline-none border border-[#50453b]" placeholder="Category" />
            <select value={formData.complexity} onChange={e => setFormData({...formData, complexity: e.target.value})} className="w-24 bg-[#1a1816] text-[#8a7560] px-1 py-1 text-xs outline-none border border-[#50453b]">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Interm.</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex-1 bg-[#100e0c] p-1 overflow-hidden relative flex flex-col gap-2 p-2">
          <textarea value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full h-32 bg-[#1a1816] text-green-500/80 font-mono text-[10px] p-2 outline-none resize-none custom-scrollbar border border-[#50453b]" placeholder="Code..." />
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-12 bg-[#1a1816] text-[#8a7560] text-[10px] p-2 outline-none resize-none custom-scrollbar border border-[#50453b]" placeholder="Description..." />
          
          <div className="grid grid-cols-2 gap-2">
            <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Tags (CSV)" />
            <input value={formData.dependencies} onChange={e => setFormData({...formData, dependencies: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Dependencies (CSV)" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={formData.estimatedTimeSaved} onChange={e => setFormData({...formData, estimatedTimeSaved: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Time Saved (mins)" />
            <input type="number" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Rating (1-10)" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Author" />
            <input value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} className="bg-[#1a1816] text-[#8a7560] px-1 py-1 text-[10px] outline-none border border-[#50453b]" placeholder="Source URL" />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-2 bg-[#302822] border-t border-[#403530] mt-auto">
          <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 p-1"><Check className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group bg-[#221e1a] border-2 border-[#403530] hover:border-[#e0d0c0] transition-colors p-1 relative overflow-hidden h-64 flex flex-col">
      {/* Header */}
      <div className="bg-[#302822] p-2 flex justify-between items-center border-b border-[#403530] relative z-20">
        <div className="flex items-center gap-2 max-w-[80%]">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#8a7560] hover:text-[#e0d0c0]">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#e0d0c0] uppercase text-sm truncate">{item.title}</span>
        </div>
        <span className="text-[10px] font-bold bg-[#1a1816] px-1 text-[#8a7560] border border-[#403530]">{item.language}</span>
      </div>

      {/* Code Preview */}
      <div className="flex-1 bg-[#100e0c] p-3 overflow-hidden relative">
         <pre className="text-[10px] font-mono text-green-500/80 leading-tight whitespace-pre-wrap break-all">
           {item.code.substring(0, 300)}...
         </pre>
         <div className="absolute inset-0 bg-gradient-to-t from-[#100e0c] via-transparent to-transparent" />
         
         <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10">
           {item.complexity && <span className="text-[8px] uppercase tracking-widest bg-[#221e1a] border border-[#403530] text-[#8a7560] px-1">{item.complexity}</span>}
           {item.estimatedTimeSaved && <span className="text-[8px] uppercase tracking-widest bg-green-900/30 border border-green-900/50 text-green-400 px-1">-{item.estimatedTimeSaved}m saved</span>}
           {item.rating && <span className="text-[8px] uppercase tracking-widest bg-yellow-900/30 border border-yellow-900/50 text-yellow-500 px-1">★ {item.rating}</span>}
         </div>
      </div>

      {/* Hover Overlay Action */}
      <div className="absolute top-10 bottom-0 left-0 right-0 z-10 bg-shell-bg/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
