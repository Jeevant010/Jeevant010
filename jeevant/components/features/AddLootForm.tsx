"use client";

import { addAchievement } from "@/lib/actions/rpg.actions";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="bg-amber-600 hover:bg-amber-500 text-shell-text px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50 text-sm"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Adding..." : "Add Loot"}
    </button>
  );
}

export function AddLootForm() {
  return (
    <form action={addAchievement} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
      <h3 className="text-sm font-bold text-shell-muted uppercase tracking-widest">Add New Loot (Achievement/Certificate)</h3>
      
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Title *</label>
          <input name="title" required placeholder="e.g. AWS Solutions Architect" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Platform / Category</label>
          <input name="platform" placeholder="e.g. Hackathon, Certification" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Issuer / Organization</label>
          <input name="issuer" placeholder="e.g. Amazon Web Services" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-5">
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Category</label>
          <input name="category" placeholder="certification" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Score</label>
          <input name="score" type="number" placeholder="100" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Credential ID</label>
          <input name="credentialId" placeholder="ABC-12345" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Importance</label>
          <select name="importance" defaultValue="medium" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Proof Link / Certificate URL</label>
          <input name="proofLink" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Date</label>
          <input name="date" type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Visibility</label>
          <select name="visibility" defaultValue="public" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-xs text-shell-muted ml-1">Expiry Date</label>
          <input name="expiryDate" type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Description (Markdown)</label>
          <textarea name="description" placeholder="Short description of the achievement..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition h-20 resize-y" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-shell-muted ml-1">Tags (comma separated)</label>
          <textarea name="tags" placeholder="Cloud Computing, Architecture..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-shell-text text-sm focus:border-amber-500 outline-none transition h-20 resize-y" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-shell-muted">Order</label>
            <input name="order" type="number" defaultValue="0" className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-shell-text text-sm focus:border-amber-500 outline-none transition" />
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-shell-muted">
            <input name="isFeatured" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-500" />
            Featured Achievement
          </label>
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
