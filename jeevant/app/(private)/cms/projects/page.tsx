import { getProjects } from "@/lib/actions/project.action";
import AddProjectForm from "@/components/features/AddProjectForm";
import ProjectRow from "@/components/features/ProjectRow";

export const dynamic = "force-dynamic"; // Ensure we always fetch fresh data

export default async function ProjectCMS() {
  // FETCH REAL DATA FROM MONGODB
  const projects = await getProjects();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Manager</h1>
          <p className="text-slate-400 text-sm">Create, edit, and control visibility of your portfolio items.</p>
        </div>
      </div>

      {/* 1. The Form to Add Data */}
      <AddProjectForm />

      {/* 2. The Table Displaying Real Data */}
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
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No projects found. Add one above!
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <ProjectRow key={p._id} project={p} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}