import Link from "next/link";
import { getPublicProjects } from "@/lib/actions/project.action";
import { Github, ExternalLink, Cpu, Globe, Disc } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsHolo() {
  const projects = await getPublicProjects();

  return (
    <div className="min-h-screen bg-shell-bg text-shell-text p-8 font-mono relative overflow-hidden sm:-m-8 transition-colors">
      
      {/* --- HOLO GRID BACKGROUND --- */}
      <div className="absolute inset-0 bg-mindplace-grid bg-[size:40px_40px] [perspective:1000px] [transform:rotateX(60deg)_translateY(-100px)_scale(2)] pointer-events-none opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto pt-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-16 border-b border-shell-border pb-6">
          <div className="w-16 h-16 rounded-full border-2 border-shell-accent flex items-center justify-center animate-spin-slow shadow-[0_0_20px_var(--color-shell-accent)] bg-shell-surface">
            <Globe className="w-8 h-8 text-shell-accent" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-shell-text uppercase tracking-widest drop-shadow-[0_0_10px_var(--color-shell-accent)]">
              Archives
            </h1>
            <p className="text-shell-muted text-sm tracking-[0.3em] mt-1">
              // SELECTED WORK & BUILDS
            </p>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full border border-dashed border-shell-border p-20 text-center text-shell-muted animate-pulse">
              NO PUBLIC PROJECTS YET.
            </div>
          ) : (
            projects.map((project: any, index: number) => {
              const theme = getTacticalColor(index);
              
              return (
                <div key={project._id} className="group relative block">
                  
                  {/* Holo Card Container */}
                  <div className={cn("bg-shell-surface/80 backdrop-blur-sm border p-8 h-full relative overflow-hidden transition-all duration-500 group-hover:-translate-y-1", theme.border, theme.borderHover, theme.glow)}>
                    
                    {/* Invisible Link Overlay */}
                    <Link href={`/projects/${project.slug || project._id}`} className="absolute inset-0 z-0" />

                    {/* Decorative Holo Corners */}
                    <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2", theme.border)} />
                    <div className={cn("absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2", theme.border)} />
                    <div className={cn("absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2", theme.border)} />
                    <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2", theme.border)} />

                    {/* Scan Line Effect */}
                    <div className={cn("absolute inset-0 bg-gradient-to-b from-transparent to-transparent h-[200%] w-full animate-scan pointer-events-none opacity-50", theme.text.replace("text-", "via-").replace("500", "500/10"))} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full pointer-events-none">
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn("p-2 rounded border", theme.bgMuted, theme.border)}>
                          <Cpu className={cn("w-6 h-6", theme.text)} />
                        </div>
                        <span className={cn("text-[10px] font-bold bg-shell-bg px-2 py-1 border uppercase", theme.text, theme.border)}>
                          STATUS: {project.status}
                        </span>
                      </div>

                      <h3 className={cn("text-2xl font-bold mb-2 transition uppercase tracking-wider text-shell-text pointer-events-auto", theme.textHover)}>
                        <Link href={`/projects/${project.slug || project._id}`}>{project.title}</Link>
                      </h3>
                      
                      <p className="text-shell-muted text-sm leading-relaxed mb-8 flex-1 font-sans pointer-events-auto">
                        {project.description}
                      </p>

                      <div className="space-y-4 pointer-events-auto">
                        {/* Tech Stack Bar */}
                        <div className="flex flex-wrap gap-2">
                           {project.techStack?.map((t: string, i: number) => (
                             <span key={i} className="text-[10px] uppercase font-bold text-shell-muted border border-shell-border px-2 py-1 bg-shell-bg">
                               {t}
                             </span>
                           ))}
                        </div>

                        {/* Action Links & Micro-Previews */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-shell-border relative z-20">
                          {project.repoLink && (
                            <div className="relative group/preview h-24 sm:h-32 rounded border border-shell-border overflow-hidden bg-shell-bg flex items-center justify-center">
                              <object data={project.repoLink} className="absolute inset-0 w-[400%] h-[400%] origin-top-left scale-25 opacity-40 group-hover/preview:opacity-100 transition-opacity pointer-events-none" />
                              <a href={project.repoLink} target="_blank" className="relative z-10 flex items-center justify-center gap-2 py-2 px-4 bg-shell-surface/80 backdrop-blur border border-shell-border hover:bg-shell-surface hover:text-shell-text transition text-xs font-bold uppercase tracking-wider text-shell-muted shadow-xl">
                                <Github className="w-4 h-4" /> Source
                              </a>
                            </div>
                          )}
                          {project.liveLink && (
                            <div className={cn("relative group/preview h-24 sm:h-32 rounded border overflow-hidden bg-shell-bg flex items-center justify-center", theme.border)}>
                              <object data={project.liveLink} className="absolute inset-0 w-[400%] h-[400%] origin-top-left scale-25 opacity-40 group-hover/preview:opacity-100 transition-opacity pointer-events-none" />
                              <a href={project.liveLink} target="_blank" className={cn("relative z-10 flex items-center justify-center gap-2 py-2 px-4 bg-shell-surface/80 backdrop-blur border transition text-xs font-bold uppercase tracking-wider shadow-xl", theme.text, theme.border, theme.borderHover)}>
                                <ExternalLink className="w-4 h-4" /> Uplink
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}