"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Briefcase, Trash2, Edit2, Check, X, GripVertical, Calendar, DollarSign, FileText } from "lucide-react";
import { deleteApplication, updateApplication } from "@/lib/actions/career.actions";

export function SortableApplicationCard({ app }: { app: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company: app.company,
    role: app.role,
    salary: app.salary || "",
    notes: app.notes || "",
    deadline: app.deadline ? new Date(app.deadline).toISOString().substring(0, 10) : ""
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app._id,
    data: { type: "Task", app }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    await updateApplication(app._id, {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined
    });
    setIsEditing(false);
  };

  let color = "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]";
  if (app.status === "interview") color = "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
  if (app.status === "offer") color = "border-green-500 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]";

  if (isEditing) {
    return (
      <div className={`bg-shell-bg border-l-4 p-4 relative transition ${color}`}>
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest">Company & Role</label>
          <div className="flex gap-2">
            <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none font-bold uppercase w-1/2 text-sm" placeholder="COMPANY" />
            <input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none font-bold w-1/2 text-sm" placeholder="ROLE" />
          </div>
          
          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Salary & Deadline</label>
          <div className="flex gap-2">
             <input value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/2 text-sm" placeholder="Salary (e.g. 15 LPA)" />
             <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/2 text-sm" />
          </div>

          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Notes</label>
          <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-full text-sm min-h-[60px]" placeholder="Interview notes, links..." />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
          <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/20 text-xs font-bold uppercase"><X className="w-3 h-3 inline mr-1" /> Cancel</button>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 px-3 py-1 bg-green-900/20 text-xs font-bold uppercase"><Check className="w-3 h-3 inline mr-1" /> Save</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-shell-bg border-l-4 p-4 relative group transition flex gap-2 ${color}`}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-shell-muted hover:text-white pt-1">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-lg font-bold text-shell-text uppercase truncate pr-2">{app.company}</h4>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => deleteApplication(app._id)} className="text-slate-500 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        
        <p className="text-sm font-bold text-shell-muted mb-2 flex items-center gap-2 truncate">
          <Briefcase className="w-3 h-3 min-w-[12px]" /> {app.role}
        </p>

        {(app.salary || app.deadline || app.notes) && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
            {app.salary && <p className="text-xs text-green-400 flex items-center gap-1"><DollarSign className="w-3 h-3"/> {app.salary}</p>}
            {app.deadline && <p className="text-xs text-red-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Due: {new Date(app.deadline).toLocaleDateString()}</p>}
            {app.notes && <p className="text-xs text-slate-400 flex items-start gap-1 mt-1"><FileText className="w-3 h-3 min-w-[12px] mt-[2px]"/> <span className="line-clamp-2">{app.notes}</span></p>}
          </div>
        )}

        <div className="flex justify-between items-end mt-3 pt-3 border-t border-white/5">
          <span className="text-[10px] font-mono text-shell-muted uppercase tracking-widest">{new Date(app.dateApplied).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
