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
      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Saving..." : "Create Project"}
    </button>
  );
}

export default function AddProjectForm() {
  return (
    <form action={createProject} className="flex gap-2 items-end bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
      <div className="flex-1 space-y-1">
        <label className="text-xs text-slate-400 ml-1">Project Name</label>
        <input 
          name="title" 
          required 
          placeholder="e.g. EcoSort AI" 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition"
        />
      </div>
      <div className="flex-1 space-y-1 hidden md:block">
        <label className="text-xs text-slate-400 ml-1">Short Description</label>
        <input 
          name="description" 
          required 
          placeholder="What does it do?" 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition"
        />
      </div>
      <SubmitButton />
    </form>
  );
}