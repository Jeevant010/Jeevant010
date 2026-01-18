import Link from "next/link";
import { getProjects } from "@/lib/actions/project.action";
import { Github, ExternalLink, Layers, Cpu } from "lucide-react";

// Force dynamic rendering so new projects show up instantly
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // 1. Fetch all projects
  const allProjects = await getProjects();
  
  // 2. Filter for only "public" ones
  const projects = allProjects.filter((p: any) => p.visibility === "public");

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold text-white mb-8">
        <span className="text-blue-500">/</span>projects
      </h1>

      {projects.length === 0 ? (
        <div className="text-slate-500 italic">
          No public projects yet. Head to the Dashboard CMS to add one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project: any) => (
            <div key={project._id} className="glass-card rounded-xl p-6 hover:border-blue-500/30 transition group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition">
                  {/* Simple logic to choose icon based on title/tags */}
                  {project.title.toLowerCase().includes("ai") ? <Cpu size={20} /> : <Layers size={20} />}
                </div>
                <div className="flex gap-3">
                  {project.repoLink && (
                    <Link href={project.repoLink} target="_blank" className="text-slate-400 hover:text-white transition">
                      <Github size={20} />
                    </Link>
                  )}
                  {project.liveLink && (
                    <Link href={project.liveLink} target="_blank" className="text-slate-400 hover:text-white transition">
                      <ExternalLink size={20} />
                    </Link>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                {project.description}
              </p>

              {/* Only show tags if they exist */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.techStack.map((tag: string, tIdx: number) => (
                    <span key={tIdx} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}