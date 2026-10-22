import { getProjects } from "@/lib/actions/project.action";
import AddProjectForm from "@/components/features/AddProjectForm";
import SortableProjectList from "@/components/features/SortableProjectList";
import { FolderOpen, Archive } from "lucide-react";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function ProjectCMS() {
  const projects = await getProjects();

  return (
    <PrivateShell
      eyebrow="Access level admin · database projects"
      title="Projects"
      description="Add, order, and publish the repositories that appear publicly."
      accent="amber"
      icon={<FolderOpen className="h-6 w-6 text-yellow-500" />}
    >
      <div className="mb-10">
        <AddProjectForm />
      </div>

      <div className="panel-cyber overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-white/5 bg-white/[0.02] p-4 text-xs font-bold uppercase tracking-widest text-shell-muted">
          <div className="col-span-5">Project</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Visibility</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 p-12 text-center text-shell-muted">
              <Archive className="h-12 w-12 opacity-20" />
              <p>NO PROJECTS FOUND.</p>
            </div>
          ) : (
            <SortableProjectList projects={projects} />
          )}
        </div>
      </div>
    </PrivateShell>
  );
}