"use client";

import { useState } from "react";
import { Briefcase, Trash2, ArrowRight, Edit2, Check, X } from "lucide-react";
import { deleteApplication, updateStatus, updateApplication } from "@/lib/actions/career.actions";

export default function ApplicationCard({ app, nextStatus, color }: { app: any, nextStatus: string, color: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState(app.company);
  const [role, setRole] = useState(app.role);

  const handleSave = async () => {
    await updateApplication(app._id, { company, role });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`bg-shell-bg border-l-4 p-5 relative group transition ${color}`}>
        <div className="flex flex-col gap-2 mb-4">
          <input 
            value={company} 
            onChange={e => setCompany(e.target.value)} 
            className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none font-bold uppercase w-full"
            placeholder="COMPANY"
          />
          <input 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none font-bold w-full"
            placeholder="ROLE"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
          <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 p-1"><Check className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-shell-bg border-l-4 p-5 relative group transition hover:-translate-y-1 ${color}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xl font-bold text-shell-text uppercase truncate pr-2">{app.company}</h4>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(true)} className="text-slate-700 hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => deleteApplication(app._id)} className="text-slate-700 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      
      <p className="text-sm font-bold text-shell-muted mb-4 flex items-center gap-2 truncate">
        <Briefcase className="w-3 h-3 min-w-[12px]" /> {app.role}
      </p>

      <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
        <span className="text-xs font-mono text-shell-muted">{new Date(app.dateApplied).toLocaleDateString()}</span>
        
        {nextStatus !== 'archived' && (
          <button onClick={() => updateStatus(app._id, nextStatus)} className="flex items-center gap-1 text-xs font-black uppercase text-shell-text bg-shell-surface px-2 py-1 hover:bg-white hover:text-black transition">
            Advance <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
