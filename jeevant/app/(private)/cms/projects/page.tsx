import { getProjects } from "@/lib/actions/project.action";
import AddProjectForm from "@/components/features/AddProjectForm";
import ProjectRow from "@/components/features/ProjectRow";
import { FolderOpen, Archive } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectCMS() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-[#0f0f0f] -m-8 p-8 font-mono">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-yellow-600" /> Case Files
          </h1>
          <p className="text-slate-500 text-xs tracking-widest mt-1">// ACCESS LEVEL: ADMIN // DATABASE: PROJECTS</p>
        </div>
      </div>

      {/* ADD FORM */}
      <div className="mb-12">
        <AddProjectForm />
      </div>

      {/* FILE SYSTEM (Table) */}
      <div className="border border-slate-800 bg-[#121212]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-[#1a1a1a] text-xs font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-5">File Name</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Visibility</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800">
          {projects.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-4 text-slate-600">
              <Archive className="w-12 h-12 opacity-20" />
              <p>ARCHIVES ARE EMPTY.</p>
            </div>
          ) : (
             // You need to update ProjectRow styling to match this grid layout, 
             // or wrap the existing row in a div that matches the grid above.
             // For now, let's keep it simple and just map them.
            projects.map((p) => (
              <div key={p._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#1a1a1a] transition group">
                 {/* Note: To make ProjectRow work perfectly inside this Grid, 
                    we usually refactor ProjectRow to accept className or be a flex container.
                    Since ProjectRow is a <tr> currently, we need to Change ProjectRow to be a <div> based component.
                 */}
                 {/* TEMP FIX: We will just render the components raw here or you refactor ProjectRow to not be a <tr> */}
                 <div className="col-span-12">
                    {/* Render simplified row content here if you don't want to refactor ProjectRow immediately */}
                    <ProjectRow project={p} /> 
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}