"use client";

import { updateProfile } from "@/lib/actions/profile.actions";
import { Save, CreditCard, Plus, Trash2, ShieldAlert, Cpu } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 mt-6 rounded">
      <Save className="w-5 h-5" /> {pending ? "Updating..." : "Update Identity Matrix"}
    </button>
  );
}

export default function ProfileForm({ profile }: { profile: any }) {
  const [stats, setStats] = useState<{ label: string, value: string }[]>(profile.stats || []);
  const [skills, setSkills] = useState<{ skill: string, years: number, category: string }[]>(profile.skillsExperience || []);

  const addStat = () => setStats([...stats, { label: "", value: "" }]);
  const removeStat = (index: number) => setStats(stats.filter((_, i) => i !== index));
  const updateStat = (index: number, field: "label" | "value", val: string) => {
    const newStats = [...stats];
    newStats[index][field] = val;
    setStats(newStats);
  };

  const addSkill = () => setSkills([...skills, { skill: "", years: 1, category: "Web Dev" }]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  const updateSkill = (index: number, field: "skill" | "years" | "category", val: string | number) => {
    const newSkills = [...skills];
    (newSkills[index] as any)[field] = val;
    setSkills(newSkills);
  };

  return (
    <form action={updateProfile} className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: PUBLIC PERSONA */}
      <div className="space-y-6 bg-[#111] p-6 border border-slate-800 rounded-xl">
        <h3 className="text-white font-bold uppercase border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" /> Core Data
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-xs uppercase font-bold text-slate-500">Display Name</label>
            <input name="name" defaultValue={profile.name} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500" />
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs uppercase font-bold text-slate-500">Tagline / Title</label>
            <textarea name="title" defaultValue={profile.title} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 h-20 resize-y" />
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs uppercase font-bold text-slate-500">Bio</label>
            <textarea name="bio" defaultValue={profile.bio} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 h-28 resize-y" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Current Focus</label>
            <input name="currentFocus" defaultValue={profile.currentFocus} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Availability</label>
            <input name="availability" defaultValue={profile.availability} placeholder="Open to work..." className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="space-y-1 mt-8">
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
      <div className="space-y-6 bg-[#111] p-6 border border-slate-800 rounded-xl flex flex-col">
         <h3 className="text-white font-bold uppercase border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
           <ShieldAlert className="w-4 h-4 text-emerald-500" /> Assets & Comms
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-xs uppercase font-bold text-slate-500">Status Message (Home)</label>
            <input name="status" defaultValue={profile.status} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Avatar URL</label>
            <input name="avatarUrl" defaultValue={profile.avatarUrl} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Resume Link (PDF)</label>
            <input name="resumeLink" defaultValue={profile.resumeLink} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Email</label>
            <input name="email" type="email" defaultValue={profile.email} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Phone</label>
            <input name="phone" defaultValue={profile.phone} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Location</label>
            <input name="location" defaultValue={profile.location} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">GitHub Username</label>
            <input name="githubUsername" defaultValue={profile.githubUsername} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">LinkedIn URL</label>
            <input name="linkedinUrl" defaultValue={profile.linkedinUrl} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Twitter URL</label>
            <input name="twitterUrl" defaultValue={profile.twitterUrl} className="w-full bg-[#0a0a0a] border border-slate-800 rounded p-3 text-white outline-none focus:border-emerald-500 text-sm" />
          </div>
        </div>

        <div className="space-y-1 mt-8 flex-1">
          <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-4">
            <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2"><Cpu className="w-4 h-4"/> Skills & Experience ({skills.length})</label>
            <button type="button" onClick={addSkill} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase"><Plus className="w-3 h-3" /> Add Skill</button>
          </div>
          
          <input type="hidden" name="skillsExperience" value={JSON.stringify(skills)} />
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {skills.map((skill, i) => (
              <div key={i} className="flex gap-2 items-center bg-[#0a0a0a] p-2 border border-slate-800 rounded">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input placeholder="Skill (e.g. React)" value={skill.skill} onChange={(e) => updateSkill(i, "skill", e.target.value)} className="w-full bg-transparent border-b border-slate-800 text-white text-xs p-1 outline-none focus:border-emerald-500 col-span-1" />
                  <input placeholder="Category (e.g. AI, Web Dev)" value={skill.category} onChange={(e) => updateSkill(i, "category", e.target.value)} className="w-full bg-transparent border-b border-slate-800 text-white text-xs p-1 outline-none focus:border-emerald-500 col-span-1" />
                  <div className="flex items-center gap-2 col-span-1 border-b border-slate-800 px-1">
                    <input type="number" placeholder="Years" value={skill.years} onChange={(e) => updateSkill(i, "years", Number(e.target.value))} className="w-full bg-transparent text-emerald-400 font-mono text-sm p-1 outline-none" />
                    <span className="text-[10px] text-slate-600 uppercase">YRS</span>
                  </div>
                </div>
                <button type="button" onClick={() => removeSkill(i)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
        
        <SubmitButton />
      </div>

    </form>
  );
}
