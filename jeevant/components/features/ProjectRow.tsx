"use client";

import { toggleVisibility, deleteProject } from "@/lib/actions/project.action";
import { FileText, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProjectRow({ project }: { project: any }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleVisibility(project._id, project.visibility);
    setLoading(false);
  };

  const handleDelete = async () => {
    if(!confirm("Destroy this case file?")) return;
    setLoading(true);
    await deleteProject(project._id);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full items-center text-sm">
      
      {/* Name */}
      <div className="col-span-5 font-bold text-slate-200 flex items-center gap-3">
        <FileText className="w-4 h-4 text-slate-600" />
        {project.title}
        {loading && <Loader2 className="w-3 h-3 animate-spin text-red-500" />}
      </div>

      {/* Status */}
      <div className="col-span-3">
        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs uppercase tracking-wider rounded border border-slate-700">
          {project.status || "PLANNED"}
        </span>
      </div>

      {/* Visibility */}
      <div className="col-span-2">
        <button onClick={handleToggle} disabled={loading} className="hover:text-white text-slate-500 transition flex items-center gap-2 text-xs uppercase font-bold">
           {project.visibility === 'public' ? (
             <><Eye className="w-4 h-4 text-green-500" /> PUBLIC</>
           ) : (
             <><EyeOff className="w-4 h-4 text-red-500" /> CLASSIFIED</>
           )}
        </button>
      </div>

      {/* Actions */}
      <div className="col-span-2 text-right">
        <button onClick={handleDelete} disabled={loading} className="text-slate-600 hover:text-red-500 transition p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}