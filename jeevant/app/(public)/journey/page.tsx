import Link from "next/link";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";
import { ShieldAlert, Map, FileText, Flashlight, Target } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const [profile, sheet, projects] = await Promise.all([getProfile(), getCharacterSheet(), getProjects()]);
  const sortedProjects = projects
    .filter((project: any) => project.startDate)
    .sort((left: any, right: any) => new Date(right.startDate).getTime() - new Date(left.startDate).getTime());

  return (
    <div className="space-y-12 sm:space-y-16 font-mono relative sm:-m-8 p-4 sm:p-8 transition-colors">
      {/* TACTICAL BACKGROUND */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* TACTICAL HERO */}
      <section className="relative overflow-hidden border border-shell-border bg-shell-surface/80 backdrop-blur p-8 sm:p-16 shadow-[0_0_50px_var(--color-cinematic-glow)] group rounded-xl">
        
        {/* Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell-accent/10 to-transparent h-[200%] w-full animate-scan pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
             <Target className="w-5 h-5 text-shell-accent animate-pulse" />
             <p className="text-xs font-bold uppercase tracking-[0.5em] text-shell-muted">Field Report // HEROCOMING {profile.level}</p>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-shell-text uppercase drop-shadow-[0_2px_10px_var(--color-shell-accent)]">
            Operations Log
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-shell-muted border-l-4 border-shell-accent pl-4 font-sans">
            Detailed accounts of previous engagements, acquired skills, and chronological trace routes of all deployments.
          </p>
        </div>
      </section>

      {/* TIMELINE (FIELD EXPERIENCE) */}
      <section className="border border-shell-border bg-shell-surface/60 backdrop-blur p-6 sm:p-12 relative overflow-hidden rounded-xl">
        
        <div className="flex items-center justify-between border-b border-shell-border pb-6 mb-10 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black text-shell-text uppercase tracking-tighter flex items-center gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-shell-accent" />
            Field Experience
          </h2>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-shell-muted">Classified</span>
        </div>
        
        <div className="space-y-8 sm:space-y-16 relative before:absolute before:inset-0 before:left-5 sm:before:left-1/2 before:-translate-x-px before:h-full before:w-[1px] before:bg-gradient-to-b before:from-shell-accent/50 before:via-shell-border before:to-transparent">
          {sheet.quests.length === 0 ? (
            <div className="text-sm text-shell-muted text-center py-12 relative z-10 italic">No records found. The archives are empty.</div>
          ) : (
            sheet.quests.map((quest: any, index: number) => {
              const theme = getTacticalColor(index);
              const start = new Date(quest.startDate);
              const end = quest.endDate ? new Date(quest.endDate) : null;
              const isOngoing = !end;

              return (
                <div key={quest._id} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:odd:flex-row-reverse group">
                  
                  {/* Timeline Node */}
                  <div className={cn("absolute left-5 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 z-10 bg-shell-bg transition-colors", theme.borderHover, theme.border)}>
                    <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors", isOngoing ? cn(theme.bg, theme.glow, 'animate-pulse') : 'bg-shell-muted')} />
                  </div>
                  
                  {/* Document Card */}
                  <div className="w-full sm:w-[calc(50%-3rem)] pl-12 sm:pl-0 pt-2 sm:pt-0">
                     <div className={cn("p-6 sm:p-8 border bg-shell-bg shadow-2xl transition-all relative overflow-hidden", theme.borderHover, isOngoing ? theme.border : "border-shell-border")}>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                           <div>
                             <div className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-1", isOngoing ? theme.text : "text-shell-muted")}>
                               {isOngoing ? ">> STATUS: ACTIVE" : ">> STATUS: CONCLUDED"}
                             </div>
                             <h3 className="text-xl sm:text-2xl font-black text-shell-text uppercase">{quest.role}</h3>
                             <h4 className={cn("text-xs sm:text-sm font-bold uppercase tracking-widest mt-1", theme.text)}>ORG: {quest.company}</h4>
                           </div>
                           <div className="text-[10px] border-b border-shell-border text-shell-muted">
                             {start.getFullYear()} - {isOngoing ? 'PRESENT' : end?.getFullYear()}
                           </div>
                        </div>
                        
                        <p className="mt-6 text-sm sm:text-base text-shell-muted/90 font-sans leading-relaxed whitespace-pre-wrap">
                          {quest.description}
                        </p>
                        
                        {quest.type && (
                          <div className={cn("mt-6 inline-block border-t border-shell-border pt-2 w-full text-right text-[10px] font-bold uppercase tracking-[0.4em]", theme.text)}>
                            ATTACHMENT: {quest.type}
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* PROJECT ROUTE MAP */}
      <section className="border border-shell-border bg-shell-surface/60 backdrop-blur p-6 sm:p-12 relative overflow-hidden rounded-xl">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-shell-accent/5 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-shell-border pb-6 mb-8 relative z-10">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-shell-muted">Trace Route</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-shell-text uppercase tracking-tighter">Project History</h2>
          </div>
          <Map className="h-6 w-6 sm:h-8 sm:w-8 text-shell-accent" />
        </div>
        
        {sortedProjects.length === 0 ? (
          <div className="mt-6 text-sm text-shell-muted italic text-center">The trail has gone cold. No projects documented.</div>
        ) : (
          <div className="grid gap-6 sm:gap-8 relative z-10">
            {sortedProjects.map((project: any, index: number) => {
              const theme = getTacticalColor(index + 3);
              const start = project.startDate ? new Date(project.startDate) : null;
              const end = project.endDate ? new Date(project.endDate) : null;
              return (
                <Link href={`/projects/${project.slug || project._id}`} key={project._id} className={cn("group grid gap-4 md:grid-cols-[1fr_2fr] items-center border bg-shell-bg p-4 sm:p-6 transition-all", theme.borderHover, theme.border)}>
                  <div>
                    <div className={cn("text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold mb-2", theme.text)}>
                      {start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "UNKNOWN"}
                      {end ? ` -> ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : project.isOngoing ? " -> PRESENT" : ""}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-shell-text uppercase group-hover:text-shell-text transition-colors">{project.title}</div>
                    <div className="mt-2 text-xs sm:text-sm text-shell-muted line-clamp-3 font-sans">{project.description}</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center w-full mt-4 md:mt-0">
                    <div className="relative h-1 w-full overflow-hidden bg-shell-surface">
                      <div className={cn("absolute inset-y-0 left-0", theme.bg, project.isOngoing ? cn("w-full animate-pulse", theme.glow) : "w-full opacity-30")} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
