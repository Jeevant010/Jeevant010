import { getProjectBySlug } from "@/lib/actions/project.action";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ExternalLink, Github, Calendar, Cpu, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDossier({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    notFound();
  }

  // Derive a stable color based on string length to keep it consistent for the same project
  const colorIndex = project.title.length;
  const theme = getTacticalColor(colorIndex);

  const isLive = project.status === "live";
  const start = project.startDate ? new Date(project.startDate).toLocaleDateString() : "UNKNOWN";
  const end = project.endDate ? new Date(project.endDate).toLocaleDateString() : project.isOngoing ? "PRESENT" : "UNKNOWN";

  return (
    <div className="min-h-screen text-shell-text p-4 sm:p-8 font-mono relative sm:-m-8 transition-colors pb-24">
      
      {/* --- TACTICAL BACKGROUND --- */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className={cn("absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)]", theme.text.replace('text-', 'from-'))} />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-5xl mx-auto pt-8">
        
        {/* Top Nav / Back Button */}
        <div className="mb-8">
          <Link href="/projects" className={cn("inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors", theme.text, theme.textHover)}>
            <ArrowLeft className="w-4 h-4" /> Return to Archives
          </Link>
        </div>

        {/* Header HUD */}
        <div className={cn("border bg-shell-surface/80 backdrop-blur p-6 sm:p-10 relative overflow-hidden mb-8", theme.border)}>
          <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 pointer-events-none", theme.bg)} />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <div className={cn("inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 border bg-shell-bg", theme.border, theme.text)}>
                 {isLive ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />} 
                 STATUS: {project.status}
               </div>
               <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-shell-text">
                 {project.title}
               </h1>
               <p className="text-shell-muted mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
                 {project.description}
               </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px] border border-shell-border p-4 bg-shell-bg/50">
               <div className="text-[10px] uppercase font-bold text-shell-muted tracking-widest border-b border-shell-border pb-2 flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> Mission Duration
               </div>
               <div className="font-mono text-sm font-bold text-shell-text">
                 START: {start}
               </div>
               <div className="font-mono text-sm font-bold text-shell-text">
                 END: {end}
               </div>
            </div>
          </div>

          {/* Links & Tech Stack */}
          <div className="relative z-10 mt-8 pt-8 border-t border-shell-border flex flex-col sm:flex-row justify-between gap-6">
             <div className="flex flex-wrap gap-2 flex-1">
               <div className="w-full text-[10px] uppercase font-bold text-shell-muted tracking-widest mb-1 flex items-center gap-2">
                 <Cpu className="w-3 h-3" /> Equipment
               </div>
               {project.techStack?.map((t: string, i: number) => (
                 <span key={i} className={cn("text-[10px] font-mono font-bold px-2 py-1 border", theme.border, theme.bgMuted, theme.text)}>
                   {t}
                 </span>
               ))}
             </div>
             
             <div className="flex flex-col sm:flex-row gap-3">
               {project.repoLink && (
                 <Link href={project.repoLink} target="_blank" className="flex items-center justify-center gap-2 px-6 py-3 bg-shell-bg border border-shell-border hover:bg-shell-surface hover:border-shell-text transition text-xs font-bold uppercase tracking-wider text-shell-text h-fit min-w-[140px]">
                   <Github className="w-4 h-4" /> Source
                 </Link>
               )}
               {project.liveLink && (
                 <Link href={project.liveLink} target="_blank" className={cn("flex items-center justify-center gap-2 px-6 py-3 border transition text-xs font-bold uppercase tracking-wider text-black h-fit min-w-[140px]", theme.bg, theme.borderHover, "hover:opacity-80")}>
                   <ExternalLink className="w-4 h-4" /> Uplink
                 </Link>
               )}
             </div>
          </div>
        </div>

        {/* Content Render (Markdown) */}
        <div className="bg-shell-surface/50 border border-shell-border p-6 sm:p-12 relative">
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-shell-border" />
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-shell-border" />
           
           {!project.content ? (
             <div className="text-center py-20 text-shell-muted italic text-sm font-mono uppercase tracking-widest">
               No extended intel available for this operation.
             </div>
           ) : (
             <article className={cn("prose prose-invert prose-slate max-w-none font-sans", 
               "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight",
               "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
               "prose-a:text-shell-accent hover:prose-a:text-shell-text prose-a:transition-colors",
               "prose-strong:text-shell-text prose-code:text-shell-text prose-code:bg-shell-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-shell-border prose-code:before:content-[''] prose-code:after:content-['']",
               "prose-pre:bg-shell-bg prose-pre:border prose-pre:border-shell-border",
               theme.text.replace('text-', 'prose-a:text-')
             )}>
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {project.content}
               </ReactMarkdown>
             </article>
           )}
        </div>
        
      </div>
    </div>
  );
}
