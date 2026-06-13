"use client";

import { createProject } from "@/lib/actions/project.action";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="bg-blue-600 hover:bg-blue-500 text-shell-text px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50 text-sm"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Saving..." : "Create Project"}
    </button>
  );
}

export default function AddProjectForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form action={createProject} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-shell-muted uppercase tracking-widest">New Project</h3>
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className="text-xs text-blue-400 hover:text-blue-300 transition"
        >
          {showAdvanced ? "▲ Less fields" : "▼ More fields"}
        </button>
      </div>

      {/* Row 1: Essential fields */}
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Project Name *</label>
          <input 
            name="title" 
            required 
            placeholder="e.g. EcoSort AI" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Short Description *</label>
          <input 
            name="description" 
            required 
            placeholder="What does it do?" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">GitHub URL *</label>
          <input 
            name="repoLink" 
            required
            placeholder="https://github.com/..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Live URL</label>
          <input 
            name="liveLink" 
            placeholder="https://..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      {/* Row 2: Tech Stack, Status, Visibility */}
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Tech Stack (comma separated)</label>
          <input 
            name="techStack" 
            placeholder="React, Node.js, MongoDB" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Status</label>
          <select name="status" defaultValue="planned" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition">
            <option value="planned">Planned</option>
            <option value="building">Building</option>
            <option value="live">Live</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Visibility</label>
          <select name="visibility" defaultValue="private" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition">
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Start Date</label>
          <input name="startDate" type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">End Date</label>
          <input name="endDate" type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="space-y-3 border-t border-slate-800 pt-3 mt-3">
          <div className="space-y-1">
            <label className="text-xs text-shell-muted ml-1">Content / Detailed Notes (Markdown)</label>
            <textarea 
              name="content" 
              placeholder="Write detailed project description in markdown..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition h-24 resize-y"
            />
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-shell-muted">
            <input name="isOngoing" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-500" />
            Ongoing project (no end date)
          </label>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}