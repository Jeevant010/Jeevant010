"use client";

import { toggleVisibility, deleteProject, updateProject } from "@/lib/actions/project.action";
import { FileText, Eye, EyeOff, Trash2, Edit2, Loader2, Save, X, Github, ExternalLink } from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-700 text-slate-300",
  building: "bg-amber-900/50 text-amber-400 border-amber-700",
  live: "bg-emerald-900/50 text-emerald-400 border-emerald-700",
  stopped: "bg-red-900/50 text-red-400 border-red-700",
};

export default function ProjectRow({ project }: { project: any }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleVisibility(project._id, project.visibility);
    setLoading(false);
  };

  const handleDelete = async () => {
    if(!confirm("Destroy this case file? This action cannot be undone.")) return;
    setLoading(true);
    await deleteProject(project._id);
    setLoading(false);
  };

  if (isEditing) {
    const startStr = project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "";
    const endStr = project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "";
    
    return (
      <form action={async (formData) => {
        setLoading(true);
        await updateProject(formData);
        setLoading(false);
        setIsEditing(false);
      }} className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-3 relative">
        <button type="button" onClick={() => setIsEditing(false)} className="absolute top-2 right-2 text-shell-muted hover:text-white"><X className="w-4 h-4" /></button>
        
        <input type="hidden" name="id" value={project._id} />
        
        <div className="grid grid-cols-2 gap-3">
          {/* Title */}
          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Project Title *</label>
            <input name="title" defaultValue={project.title} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" required />
          </div>
          
          {/* Description */}
          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Description</label>
            <textarea name="description" defaultValue={project.description} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text h-16 rounded resize-y" required />
          </div>
          
          {/* GitHub (Required) */}
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">GitHub URL *</label>
            <input name="repoLink" defaultValue={project.repoLink} placeholder="https://github.com/..." className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" required />
          </div>
          
          {/* Live Link (Optional) */}
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Live URL</label>
            <input name="liveLink" defaultValue={project.liveLink} placeholder="https://..." className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" />
          </div>
          
          {/* Tech Stack */}
          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Tech Stack (comma separated)</label>
            <input name="techStack" defaultValue={project.techStack?.join(", ")} placeholder="React, Node.js, MongoDB" className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" />
          </div>
          
          {/* Status */}
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Status</label>
            <select name="status" defaultValue={project.status || "planned"} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded">
              <option value="planned">Planned</option>
              <option value="building">Building</option>
              <option value="live">Live</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>
          
          {/* Visibility */}
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Visibility</label>
            <select name="visibility" defaultValue={project.visibility || "private"} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded">
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          {/* Dates */}
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Start Date</label>
            <input type="date" name="startDate" defaultValue={startStr} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">End Date</label>
            <input type="date" name="endDate" defaultValue={endStr} className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text rounded" />
          </div>
          
          {/* Ongoing checkbox */}
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" name="isOngoing" defaultChecked={project.isOngoing} className="w-4 h-4 bg-[#121212] border-slate-800 accent-blue-500" />
            <label className="text-xs font-bold uppercase text-shell-muted">Ongoing (No end date)</label>
          </div>
          
          {/* Content */}
          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-shell-muted mb-1 block">Content / Notes (Markdown)</label>
            <textarea name="content" defaultValue={project.content} placeholder="Detailed project description..." className="w-full bg-[#121212] border border-slate-800 p-2 text-sm text-shell-text h-24 rounded resize-y" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </form>
    );
  }

  const statusClass = STATUS_COLORS[project.status] || STATUS_COLORS.planned;

  return (
    <div className="grid grid-cols-12 gap-4 w-full items-center text-sm">
      
      {/* Name + Links */}
      <div className="col-span-4 font-bold text-slate-200 flex items-center gap-2">
        <FileText className="w-4 h-4 text-shell-muted shrink-0" />
        <span className="truncate">{project.title}</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-red-500" />}
        {project.repoLink && (
          <a href={project.repoLink} target="_blank" rel="noopener" className="text-shell-muted hover:text-blue-400 shrink-0">
            <Github className="w-3 h-3" />
          </a>
        )}
        {project.liveLink && (
          <a href={project.liveLink} target="_blank" rel="noopener" className="text-shell-muted hover:text-emerald-400 shrink-0">
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Tech Stack (truncated) */}
      <div className="col-span-2 text-xs text-shell-muted truncate">
        {project.techStack?.slice(0, 3).join(", ") || "—"}
        {project.techStack?.length > 3 && ` +${project.techStack.length - 3}`}
      </div>

      {/* Status */}
      <div className="col-span-2">
        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded border ${statusClass}`}>
          {project.status || "PLANNED"}
        </span>
      </div>

      {/* Visibility */}
      <div className="col-span-2">
        <button onClick={handleToggle} disabled={loading} className="hover:text-shell-text text-shell-muted transition flex items-center gap-2 text-xs uppercase font-bold">
           {project.visibility === 'public' ? (
             <><Eye className="w-4 h-4 text-green-500" /> PUBLIC</>
           ) : (
             <><EyeOff className="w-4 h-4 text-red-500" /> CLASSIFIED</>
           )}
        </button>
      </div>

      {/* Actions */}
      <div className="col-span-2 text-right flex justify-end gap-2">
        <button title="edit" onClick={() => setIsEditing(true)} disabled={loading} className="text-shell-muted hover:text-blue-400 transition p-1">
          <Edit2 className="w-4 h-4" />
        </button>
        <button title="delete" onClick={handleDelete} disabled={loading} className="text-shell-muted hover:text-red-500 transition p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}