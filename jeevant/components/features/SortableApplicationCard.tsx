"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Briefcase, Trash2, Edit2, Check, X, GripVertical, Calendar, DollarSign, FileText } from "lucide-react";
import { deleteApplication, updateApplication } from "@/lib/actions/career.actions";

export function SortableApplicationCard({ app }: { app: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company: app.company || "",
    role: app.role || "",
    salary: app.salary || "",
    notes: app.notes || "",
    recruiterName: app.recruiterName || "",
    recruiterEmail: app.recruiterEmail || "",
    companyUrl: app.companyUrl || "",
    location: app.location || "",
    workModel: app.workModel || "remote",
    interviews: app.interviews || 0,
    feedback: app.feedback || "",
    offerDetails: app.offerDetails || "",
    benefits: app.benefits?.join(", ") || "",
    referral: app.referral || "",
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

          <div className="flex gap-2">
            <input value={formData.companyUrl} onChange={e => setFormData({ ...formData, companyUrl: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/2 text-sm" placeholder="Company URL" />
            <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/2 text-sm" placeholder="Location" />
          </div>
          
          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Salary, Deadline, Work Model</label>
          <div className="flex gap-2">
             <input value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Salary" />
             <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" />
             <select value={formData.workModel} onChange={e => setFormData({ ...formData, workModel: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
             </select>
          </div>

          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Recruiter & Interviews</label>
          <div className="flex gap-2">
            <input value={formData.recruiterName} onChange={e => setFormData({ ...formData, recruiterName: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Recruiter Name" />
            <input value={formData.recruiterEmail} onChange={e => setFormData({ ...formData, recruiterEmail: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Recruiter Email" />
            <input type="number" value={formData.interviews} onChange={e => setFormData({ ...formData, interviews: Number(e.target.value) })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="# Interviews" />
          </div>

          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Feedback, Referral, Benefits</label>
          <div className="flex gap-2">
             <input value={formData.feedback} onChange={e => setFormData({ ...formData, feedback: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Feedback..." />
             <input value={formData.referral} onChange={e => setFormData({ ...formData, referral: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Referral" />
             <input value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-1/3 text-sm" placeholder="Benefits CSV" />
          </div>

          <label className="text-[10px] text-shell-muted font-bold uppercase tracking-widest mt-1">Offer Details & Notes</label>
          <input value={formData.offerDetails} onChange={e => setFormData({ ...formData, offerDetails: e.target.value })} className="bg-shell-surface border border-pink-900 text-shell-text px-2 py-1 outline-none w-full text-sm mb-1" placeholder="Offer Details..." />
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
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-shell-muted hover:text-white pt-1 relative z-20">
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

        {(app.salary || app.deadline || app.notes || app.location || app.interviews > 0 || app.workModel || app.companyUrl || app.recruiterName || app.recruiterEmail || app.feedback || app.benefits || app.referral || app.offerDetails) && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            
            {/* Tags Row */}
            <div className="flex flex-wrap gap-2">
              {app.location && <span className="text-[9px] uppercase tracking-widest bg-shell-surface px-2 py-0.5 border border-pink-900 text-shell-muted">{app.location}</span>}
              {app.workModel && <span className="text-[9px] uppercase tracking-widest bg-shell-surface px-2 py-0.5 border border-pink-900 text-shell-muted">{app.workModel}</span>}
              {app.interviews > 0 && <span className="text-[9px] uppercase tracking-widest bg-yellow-900/30 text-yellow-500 px-2 py-0.5 border border-yellow-900/50">Int: {app.interviews}</span>}
              {app.referral && <span className="text-[9px] uppercase tracking-widest bg-blue-900/30 text-blue-400 px-2 py-0.5 border border-blue-900/50">Ref: {app.referral}</span>}
            </div>

            {/* Core Info Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {app.salary && <div className="text-green-400 flex items-center gap-1"><DollarSign className="w-3 h-3"/> {app.salary}</div>}
              {app.deadline && <div className="text-red-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Due: {new Date(app.deadline).toLocaleDateString()}</div>}
            </div>

            {/* Links & Recruiter */}
            <div className="flex flex-col gap-1 text-[10px] text-shell-muted">
              {app.companyUrl && (
                <div><span className="uppercase tracking-widest font-bold">URL:</span> <a href={app.companyUrl} target="_blank" rel="noopener" className="hover:text-shell-accent transition underline">{app.companyUrl}</a></div>
              )}
              {(app.recruiterName || app.recruiterEmail) && (
                <div><span className="uppercase tracking-widest font-bold">Recruiter:</span> {app.recruiterName} {app.recruiterEmail ? `(${app.recruiterEmail})` : ""}</div>
              )}
            </div>

            {/* Details Blocks */}
            {app.notes && (
              <div className="text-xs text-slate-400 bg-shell-surface/50 border border-shell-border p-2">
                <span className="text-[9px] uppercase tracking-widest font-bold block mb-1">Notes</span>
                <span className="whitespace-pre-wrap">{app.notes}</span>
              </div>
            )}
            
            {app.feedback && (
              <div className="text-xs text-slate-300 bg-shell-surface/50 border border-shell-border p-2">
                <span className="text-[9px] uppercase tracking-widest font-bold block mb-1">Feedback</span>
                <span className="whitespace-pre-wrap">{app.feedback}</span>
              </div>
            )}

            {app.benefits && (
              <div className="text-xs text-blue-300 bg-blue-900/10 border border-blue-900/50 p-2">
                <span className="text-[9px] uppercase tracking-widest font-bold block mb-1 text-blue-400">Benefits</span>
                <span>{Array.isArray(app.benefits) ? app.benefits.join(", ") : app.benefits}</span>
              </div>
            )}
            
            {app.offerDetails && (
              <div className="text-xs text-green-300 bg-green-900/20 border border-green-900/50 p-2">
                <span className="text-[9px] uppercase tracking-widest font-bold block mb-1 text-green-400">Offer Details</span>
                <span className="whitespace-pre-wrap">{app.offerDetails}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-end mt-3 pt-3 border-t border-white/5">
          <span className="text-[10px] font-mono text-shell-muted uppercase tracking-widest">{new Date(app.dateApplied).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
