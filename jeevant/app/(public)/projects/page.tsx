import Link from "next/link";
import { getProjects } from "@/lib/actions/project.action";
import { Github, ExternalLink, Cpu, Globe, Disc } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsHolo() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((p: any) => p.visibility === "public");

  return (
    <div className="min-h-screen bg-black text-cyan-500 p-8 font-mono relative overflow-hidden -m-8">
      
      {/* --- HOLO GRID BACKGROUND --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [perspective:1000px] [transform:rotateX(60deg)_translateY(-100px)_scale(2)] pointer-events-none opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto pt-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-16 border-b border-cyan-900/50 pb-6">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500 flex items-center justify-center animate-spin-slow shadow-[0_0_20px_cyan]">
            <Globe className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px cyan" }}>
              Sector: Projects
            </h1>
            <p className="text-cyan-600 text-sm tracking-[0.3em] mt-1">
              // DEPLOYED SYSTEMS & SCHEMATICS
            </p>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full border border-dashed border-cyan-900 p-20 text-center text-cyan-800 animate-pulse">
              NO SYSTEMS DETECTED IN THIS SECTOR.
            </div>
          ) : (
            projects.map((project: any) => (
              <div key={project._id} className="group relative">
                
                {/* Holo Card Container */}
                <div className="bg-[#050a10] border border-cyan-500/30 p-8 h-full relative overflow-hidden transition-all duration-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:translate-y-[-5px]">
                  
                  {/* Decorative Holo Corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

                  {/* Scan Line Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[200%] w-full animate-scan pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2 bg-cyan-900/20 rounded border border-cyan-500/30">
                        <Cpu className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 px-2 py-1 border border-cyan-800">
                        STATUS: ONLINE
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition uppercase tracking-wider">
                      {project.title}
                    </h3>
                    
                    <p className="text-cyan-700/80 text-sm leading-relaxed mb-8 flex-1 font-sans">
                      {project.description}
                    </p>

                    <div className="space-y-4">
                      {/* Tech Stack Bar */}
                      <div className="flex flex-wrap gap-2">
                         {project.techStack?.map((t: string, i: number) => (
                           <span key={i} className="text-[10px] uppercase font-bold text-cyan-600 border border-cyan-900/50 px-2 py-1">
                             {t}
                           </span>
                         ))}
                      </div>

                      {/* Action Links */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyan-900/30">
                        {project.repoLink && (
                          <Link href={project.repoLink} target="_blank" className="flex items-center justify-center gap-2 py-2 bg-cyan-950/30 border border-cyan-800 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition text-xs font-bold uppercase tracking-wider">
                            <Github className="w-4 h-4" /> Source
                          </Link>
                        )}
                        {project.liveLink && (
                          <Link href={project.liveLink} target="_blank" className="flex items-center justify-center gap-2 py-2 bg-cyan-950/30 border border-cyan-800 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition text-xs font-bold uppercase tracking-wider">
                            <ExternalLink className="w-4 h-4" /> Uplink
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}