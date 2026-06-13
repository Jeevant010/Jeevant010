"use client";

import { updateProfile } from "@/lib/actions/profile.actions";
import { Save, CreditCard, Plus, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 mt-6">
      <Save className="w-5 h-5" /> {pending ? "Updating..." : "Update Identity Matrix"}
    </button>
  );
}

export default function ProfileForm({ profile }: { profile: any }) {
  const [stats, setStats] = useState<{ label: string, value: string }[]>(profile.stats || []);

  const addStat = () => setStats([...stats, { label: "", value: "" }]);
  const removeStat = (index: number) => setStats(stats.filter((_, i) => i !== index));
  const updateStat = (index: number, field: "label" | "value", val: string) => {
    const newStats = [...stats];
    newStats[index][field] = val;
    setStats(newStats);
  };

  return (
    <form action={updateProfile} className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: PUBLIC PERSONA */}
      <div className="space-y-6 bg-[#111] p-6 border border-slate-800 rounded-xl">
        <h3 className="text-white font-bold uppercase border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" /> Core Data
        </h3>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">Display Name</label>
          <input name="name" defaultValue={profile.name} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-white outline-none focus:border-emerald-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">Tagline / Title</label>
          <textarea name="title" defaultValue={profile.title} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-white outline-none focus:border-emerald-500 h-24 resize-y" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-4">
            <label className="text-xs uppercase font-bold text-slate-500">Tactical Stats ({stats.length})</label>
            <button type="button" onClick={addStat} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase"><Plus className="w-3 h-3" /> Add</button>
          </div>
          
          <input type="hidden" name="stats" value={JSON.stringify(stats)} />
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex gap-2 items-center bg-[#0a0a0a] p-2 border border-slate-800 rounded">
                <div className="flex-1 space-y-2">
                  <input placeholder="Label (e.g. CGPA)" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className="w-full bg-transparent border-b border-slate-800 text-white text-xs p-1 outline-none focus:border-emerald-500" />
                  <input placeholder="Value (e.g. 8.89/10)" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} className="w-full bg-transparent text-emerald-400 font-mono text-sm p-1 outline-none" />
                </div>
                <button type="button" onClick={() => removeStat(i)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LINKS & ASSETS */}
      <div className="space-y-6 bg-[#111] p-6 border border-slate-800 rounded-xl">
         <h3 className="text-white font-bold uppercase border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
           <ShieldAlert className="w-4 h-4 text-emerald-500" /> Assets & Comms
        </h3>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">Status Message (Home)</label>
          <input name="status" defaultValue={profile.status} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">GitHub Username</label>
          <input name="githubUsername" defaultValue={profile.githubUsername} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-white outline-none focus:border-emerald-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">Avatar URL</label>
          <input name="avatarUrl" defaultValue={profile.avatarUrl} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-white outline-none focus:border-emerald-500 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-slate-500">Resume Link (PDF)</label>
          <input name="resumeLink" defaultValue={profile.resumeLink} className="w-full bg-[#0a0a0a] border border-slate-800 p-3 text-white outline-none focus:border-emerald-500 text-sm" />
        </div>
        
        <SubmitButton />
      </div>

    </form>
  );
}
