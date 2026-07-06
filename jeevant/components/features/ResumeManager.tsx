"use client";

import { useState } from "react";
import { createResume, updateResume, deleteResume } from "@/lib/actions/resume.actions";
import { FileText, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";

export default function ResumeManager({ resumes }: { resumes: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    content: "",
    pdfUrl: "",
    skills: "",
    layoutTheme: "tactical",
    isPrimary: false
  });

  const handleEdit = (r: any) => {
    setEditingId(r._id);
    setFormData({
      title: r.title,
      domain: r.domain,
      content: r.content || "",
      pdfUrl: r.pdfUrl || "",
      skills: r.skills?.join(", ") || "",
      layoutTheme: r.layoutTheme || "tactical",
      isPrimary: r.isPrimary || false
    });
    setIsAdding(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      title: "",
      domain: "",
      content: "",
      pdfUrl: "",
      skills: "",
      layoutTheme: "tactical",
      isPrimary: false
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, typeof value === "boolean" ? (value ? "on" : "") : value);
    });

    if (editingId) {
      data.append("id", editingId);
      await updateResume(data);
    } else {
      await createResume(data);
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this resume version?")) {
      const data = new FormData();
      data.append("id", id);
      await deleteResume(data);
    }
  };

  return (
    <div className="space-y-8">
      {/* List of Resumes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map(r => (
          <div key={r._id} className={`border p-6 rounded-xl relative ${r.isPrimary ? 'border-sky-500 bg-sky-950/20' : 'border-shell-border bg-black/40'}`}>
            {r.isPrimary && (
              <div className="absolute top-0 right-0 m-4 text-sky-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-xl font-bold text-shell-text uppercase tracking-tight">{r.domain}</h3>
            <p className="text-sm text-shell-muted mt-1">{r.title}</p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-mono border border-shell-border px-2 py-1 rounded-sm text-shell-muted">
                {r.layoutTheme.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-shell-border flex gap-4">
              <button onClick={() => handleEdit(r)} className="text-sky-500 hover:text-sky-400 flex items-center gap-1 text-xs uppercase font-bold tracking-widest">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-400 flex items-center gap-1 text-xs uppercase font-bold tracking-widest">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add New Button */}
        <button 
          onClick={handleAddNew}
          className="border border-dashed border-shell-border hover:border-sky-500 bg-black/20 hover:bg-sky-950/20 transition-colors p-6 rounded-xl flex flex-col items-center justify-center text-shell-muted hover:text-sky-500 min-h-[200px]"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold uppercase tracking-widest">Create New Version</span>
        </button>
      </div>

      {/* Editor Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-shell-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <h2 className="text-2xl font-black text-shell-text uppercase tracking-tighter mb-6">
              {editingId ? "Edit Resume Version" : "Create Resume Version"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-shell-muted">Domain / Target (e.g., AI, Full Stack)</label>
                  <input required value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-shell-muted">Headline Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-shell-muted">PDF URL</label>
                <input value={formData.pdfUrl} onChange={e => setFormData({...formData, pdfUrl: e.target.value})} placeholder="https://..." className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-shell-muted">Skills (comma separated)</label>
                <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-shell-muted">Content Overview</label>
                <textarea rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-shell-muted">Layout Theme</label>
                  <select value={formData.layoutTheme} onChange={e => setFormData({...formData, layoutTheme: e.target.value})} className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500">
                    <option value="tactical">Tactical (Cyberpunk)</option>
                    <option value="minimal">Minimalist</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="isPrimary" checked={formData.isPrimary} onChange={e => setFormData({...formData, isPrimary: e.target.checked})} className="w-5 h-5 accent-sky-500" />
                  <label htmlFor="isPrimary" className="text-sm font-bold text-shell-text uppercase tracking-widest">Set as Primary Default</label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-shell-border">
                <button type="submit" className="flex-1 py-4 bg-sky-600 hover:bg-sky-500 text-shell-text font-bold uppercase tracking-widest transition">
                  Save Version
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 border border-shell-border hover:bg-shell-surface text-shell-text font-bold uppercase tracking-widest transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
