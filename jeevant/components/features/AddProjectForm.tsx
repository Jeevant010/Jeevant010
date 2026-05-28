"use client";

import { createProject } from "@/lib/actions/project.action";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// Helper to show loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="bg-blue-600 hover:bg-blue-500 text-shell-text px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Saving..." : "Create Project"}
    </button>
  );
}

export default function AddProjectForm() {
  return (
    <form action={createProject} className="grid gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 md:grid-cols-6">
      <div className="md:col-span-2 space-y-1">
        <label className="text-xs text-shell-muted ml-1">Project Name</label>
        <input 
          name="title" 
          required 
          placeholder="e.g. EcoSort AI" 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text focus:border-blue-500 outline-none transition"
        />
      </div>
      <div className="md:col-span-2 space-y-1">
        <label className="text-xs text-shell-muted ml-1">Short Description</label>
        <input 
          name="description" 
          required 
          placeholder="What does it do?" 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text focus:border-blue-500 outline-none transition"
        />
      </div>
      <div className="md:col-span-1 space-y-1">
        <label className="text-xs text-shell-muted ml-1">Start Date</label>
        <input name="startDate" type="date" placeholder="YYYY-MM-DD" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text focus:border-blue-500 outline-none transition" />
      </div>
      <div className="md:col-span-1 space-y-1">
        <label className="text-xs text-shell-muted ml-1">End Date</label>
        <input name="endDate" type="date" placeholder="YYYY-MM-DD" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text focus:border-blue-500 outline-none transition" />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-xs uppercase tracking-wider text-shell-muted mt-1">
        <input name="isOngoing" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500" />
        Ongoing project
      </label>
      <SubmitButton />
    </form>
  );
}