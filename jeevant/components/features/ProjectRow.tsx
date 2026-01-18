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
    if(!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    await deleteProject(project._id);
    setLoading(false);
  };

  return (
    <tr className="hover:bg-slate-800/30 transition group">
      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        {project.title}
        {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs border bg-slate-900 border-slate-700 text-slate-400`}>
          {project.status || "Planned"}
        </span>
      </td>
      <td className="px-6 py-4">
        <button 
          onClick={handleToggle}
          disabled={loading}
          className="flex items-center gap-2 hover:text-white transition"
        >
          {project.visibility === 'public' ? (
            <><Eye className="w-4 h-4 text-green-400" /> Public</>
          ) : (
            <><EyeOff className="w-4 h-4 text-slate-500" /> Private</>
          )}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition" 
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}