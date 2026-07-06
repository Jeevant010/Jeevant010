"use client";

import { addExperience } from "@/lib/actions/rpg.actions";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="bg-blue-600 hover:bg-blue-500 text-shell-text px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50 text-sm"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Adding..." : "Add Quest"}
    </button>
  );
}

export function AddQuestForm() {
  return (
    <form action={addExperience} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
      <h3 className="text-sm font-bold text-shell-muted uppercase tracking-widest">Add New Quest (Experience)</h3>
      
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Company / Organization *</label>
          <input name="company" required placeholder="e.g. Google" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Role / Title *</label>
          <input name="role" required placeholder="e.g. Software Engineer" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Location</label>
          <input name="location" placeholder="e.g. Remote" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Type</label>
          <select name="type" defaultValue="internship" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition">
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Website URL</label>
          <input name="website" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Start Date *</label>
          <input name="startDate" type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">End Date</label>
          <input name="endDate" type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Logo URL</label>
          <input name="logoUrl" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Tags (CSV)</label>
          <input name="tags" placeholder="frontend, leadership" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-5">
         <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Salary</label>
          <input name="salary" placeholder="$100k" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Rating (1-10)</label>
          <input name="rating" type="number" min="1" max="10" placeholder="8" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Manager</label>
          <input name="manager" placeholder="John Doe" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Reason for Leaving</label>
          <input name="reasonForLeaving" placeholder="Found better opportunity..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-shell-muted ml-1">Description (Markdown)</label>
        <textarea name="description" placeholder="What did you do there?" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition h-20 resize-y" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Achievements (Markdown list)</label>
          <textarea name="achievements" placeholder="- Increased performance by 20%..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition h-20 resize-y" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Skills Used (comma separated)</label>
          <textarea name="skillsUsed" placeholder="React, Node.js, AWS..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-blue-500 outline-none transition h-20 resize-y" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-shell-muted">Order</label>
            <input name="order" type="number" defaultValue="0" className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-shell-text text-sm focus:border-blue-500 outline-none transition" />
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-shell-muted">
            <input name="isCurrent" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-500" />
            Currently Working Here
          </label>
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
