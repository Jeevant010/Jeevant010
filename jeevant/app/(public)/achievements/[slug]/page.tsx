import { getAchievementBySlug } from "@/lib/actions/rpg.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ExternalLink, Shield, Calendar, Trophy, Medal, Star, Github } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AchievementDossier({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const achievement = await getAchievementBySlug(resolvedParams.slug);
  
  if (!achievement) {
    notFound();
  }

  // Derive a stable color based on string length to keep it consistent
  const colorIndex = achievement.title.length;
  const theme = getTacticalColor(colorIndex);

  const date = achievement.date ? new Date(achievement.date).toLocaleDateString() : "UNKNOWN";
  const expiryDate = achievement.expiryDate ? new Date(achievement.expiryDate).toLocaleDateString() : "LIFETIME";

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
          <Link href="/about" className={cn("inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors", theme.text, theme.textHover)}>
            <ArrowLeft className="w-4 h-4" /> Return to Dossier
          </Link>
        </div>

        {/* Header HUD */}
        <div className={cn("border bg-shell-surface/80 backdrop-blur p-6 sm:p-10 relative overflow-hidden mb-8", theme.border)}>
          <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 pointer-events-none", theme.bg)} />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <div className={cn("inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 border bg-shell-bg", theme.border, theme.text)}>
                 <Shield className="w-3 h-3" /> 
                 CATEGORY: {achievement.category || "GENERAL INTELLIGENCE"}
               </div>
               <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-shell-text">
                 {achievement.title}
               </h1>
               <p className="text-shell-muted mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
                 {achievement.impact || achievement.description}
               </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px] border border-shell-border p-4 bg-shell-bg/50">
               <div className="text-[10px] uppercase font-bold text-shell-muted tracking-widest border-b border-shell-border pb-2 flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> Timeline
               </div>
               <div className="font-mono text-sm font-bold text-shell-text">
                 ACQUIRED: {date}
               </div>
               <div className="font-mono text-sm font-bold text-shell-text">
                 VALIDITY: {expiryDate}
               </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-8 border-t border-shell-border grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              {achievement.issuer && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-shell-muted tracking-widest mb-1 flex items-center gap-2">
                    <Trophy className="w-3 h-3" /> ISSUER / ORGANIZATION
                  </div>
                  <div className="text-sm font-bold">{achievement.issuer}</div>
                </div>
              )}
              {achievement.score && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-shell-muted tracking-widest mb-1 flex items-center gap-2">
                    <Star className="w-3 h-3" /> PERFORMANCE SCORE
                  </div>
                  <div className="text-sm font-bold">{achievement.score}</div>
                </div>
              )}
              {achievement.credentialId && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-shell-muted tracking-widest mb-1 flex items-center gap-2">
                    <Medal className="w-3 h-3" /> CREDENTIAL ID
                  </div>
                  <div className="text-sm font-mono">{achievement.credentialId}</div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {(achievement.skills?.length > 0 || achievement.techStack?.length > 0) && (
                <div>
                  <div className="w-full text-[10px] uppercase font-bold text-shell-muted tracking-widest mb-1 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> SKILLS / TECHNOLOGIES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...(achievement.skills || []), ...(achievement.techStack || [])].map((t: string, i: number) => (
                      <span key={i} className={cn("text-[10px] font-mono font-bold px-2 py-1 border", theme.border, theme.bgMuted, theme.text)}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                {achievement.proofLink && (
                  <Link href={achievement.proofLink} target="_blank" className={cn("flex items-center justify-center gap-2 px-6 py-3 border transition text-xs font-bold uppercase tracking-wider text-black h-fit min-w-[140px]", theme.bg, theme.borderHover, "hover:opacity-80")}>
                    <ExternalLink className="w-4 h-4" /> Verify Proof
                  </Link>
                )}
                {achievement.githubLink && (
                  <Link href={achievement.githubLink} target="_blank" className="flex items-center justify-center gap-2 px-6 py-3 bg-shell-bg border border-shell-border hover:bg-shell-surface hover:border-shell-text transition text-xs font-bold uppercase tracking-wider text-shell-text h-fit min-w-[140px]">
                    <Github className="w-4 h-4" /> Source
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {(achievement.architectureDiagram || achievement.gallery?.length > 0 || achievement.description || achievement.lessonsLearned) && (
          <div className="bg-shell-surface/50 border border-shell-border p-6 sm:p-12 relative">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-shell-border" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-shell-border" />
             
             {achievement.architectureDiagram && (
                <div className="mb-12">
                   <h2 className={cn("text-lg font-black uppercase tracking-widest mb-4", theme.text)}>System Architecture</h2>
                   <div className="border border-shell-border rounded bg-shell-bg p-4 flex items-center justify-center overflow-hidden">
                     <img src={achievement.architectureDiagram} alt="Architecture Diagram" className="max-w-full h-auto object-contain rounded" />
                   </div>
                </div>
             )}

             {achievement.gallery?.length > 0 && (
                <div className="mb-12">
                   <h2 className={cn("text-lg font-black uppercase tracking-widest mb-4", theme.text)}>Gallery</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {achievement.gallery.map((url: string, index: number) => (
                        <div key={index} className="border border-shell-border rounded bg-shell-bg overflow-hidden aspect-video relative group">
                          <img src={url} alt={`Gallery Image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                     ))}
                   </div>
                </div>
             )}
             
             {achievement.description && (
               <div className="mb-12">
                 <h2 className={cn("text-lg font-black uppercase tracking-widest mb-4", theme.text)}>Detailed Overview</h2>
                 <article className={cn("prose prose-invert prose-slate max-w-none font-sans", 
                   "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight",
                   "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                   "prose-a:text-shell-accent hover:prose-a:text-shell-text prose-a:transition-colors",
                   "prose-strong:text-shell-text prose-code:text-shell-text prose-code:bg-shell-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-shell-border prose-code:before:content-[''] prose-code:after:content-['']",
                   "prose-pre:bg-shell-bg prose-pre:border prose-pre:border-shell-border",
                   theme.text.replace('text-', 'prose-a:text-')
                 )}>
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {achievement.description}
                   </ReactMarkdown>
                 </article>
               </div>
             )}

             {achievement.lessonsLearned && (
               <div>
                 <h2 className={cn("text-lg font-black uppercase tracking-widest mb-4", theme.text)}>Lessons Learned</h2>
                 <article className={cn("prose prose-invert prose-slate max-w-none font-sans", 
                   "prose-strong:text-shell-text prose-code:text-shell-text prose-code:bg-shell-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-shell-border prose-code:before:content-[''] prose-code:after:content-['']",
                   "prose-pre:bg-shell-bg prose-pre:border prose-pre:border-shell-border",
                   theme.text.replace('text-', 'prose-a:text-')
                 )}>
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {achievement.lessonsLearned}
                   </ReactMarkdown>
                 </article>
               </div>
             )}
          </div>
        )}
        
      </div>
    </div>
  );
}
