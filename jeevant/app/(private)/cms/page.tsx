import { 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  PlusCircle,
  FileText
} from "lucide-react";

export default function ProjectCMS() {
  // This mimics fetching 'Project' collection from DB
  const projects = [
    { id: 1, title: "EcoSort AI", status: "In Progress", visibility: "public", views: 1204 },
    { id: 2, title: "Personal OS", status: "In Progress", visibility: "private", views: 0 },
    { id: 3, title: "Old Portfolio", status: "Archived", visibility: "public", views: 450 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Manager</h1>
          <p className="text-slate-400 text-sm">Create, edit, and control visibility of your portfolio items.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
          <PlusCircle className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-500">
            <tr>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  {p.title}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs border ${
                    p.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    p.status === 'Archived' ? 'bg-slate-800 text-slate-500 border-slate-700' : 
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 hover:text-white transition group">
                    {p.visibility === 'public' ? (
                      <><Eye className="w-4 h-4 text-green-400" /> Public</>
                    ) : (
                      <><EyeOff className="w-4 h-4 text-slate-500 group-hover:text-red-400" /> Private</>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition" title="Edit Content">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}