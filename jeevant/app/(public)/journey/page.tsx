import Link from "next/link";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";
import { Skull, Map, FileText, Flashlight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const [profile, sheet, projects] = await Promise.all([getProfile(), getCharacterSheet(), getProjects()]);
  const sortedProjects = projects
    .filter((project: any) => project.startDate)
    .sort((left: any, right: any) => new Date(right.startDate).getTime() - new Date(left.startDate).getTime());

  return (
    <div className="space-y-12 sm:space-y-16 font-serif">
      {/* ALAN WAKE / RE HERO */}
      <section className="relative overflow-hidden border border-red-900/30 bg-[#050303] p-8 sm:p-16 shadow-[0_0_50px_rgba(153,27,27,0.1)] group">
        
        {/* Fog & Flashlight FX */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/10 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(153,27,27,0.15),transparent_60%)] pointer-events-none" />
        
        {/* Torn Edge Effect Top & Bottom */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBMNCA0TDggMEw4IDhMMCA4WiIgZmlsbD0iIzAyMDIwMiIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhMNCA0TDggOEw4IDBMMCAwWiIgZmlsbD0iIzAyMDIwMiIvPjwvc3ZnPg==')] opacity-50" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
             <Flashlight className="w-5 h-5 text-red-700 animate-pulse" />
             <p className="text-xs font-bold uppercase tracking-[0.5em] text-red-800/80 font-mono">Incident Report // Level {profile.level}</p>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-[#c5bba1] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            Survival Logs
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#7a6b5d] italic border-l-4 border-red-900/50 pl-4">
            Typewritten accounts of previous engagements, acquired skills, and the trails left behind in the dark.
          </p>
        </div>
      </section>

      {/* TIMELINE (TYPEWRITER LOGS) */}
      <section className="border border-[#1a1412] bg-[#0a0705] p-6 sm:p-12 relative overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-[#2a1c12] pb-6 mb-10 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black text-[#c5bba1] uppercase tracking-tighter flex items-center gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-900" />
            Field Experience
          </h2>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-[#7a6b5d]">Classified</span>
        </div>
        
        <div className="space-y-8 sm:space-y-16 relative before:absolute before:inset-0 before:left-5 sm:before:left-1/2 before:-translate-x-px before:h-full before:w-[1px] before:bg-gradient-to-b before:from-red-900/50 before:via-[#1a1412] before:to-transparent">
          {sheet.quests.length === 0 ? (
            <div className="text-sm text-[#7a6b5d] text-center py-12 relative z-10 italic">No records found. The pages are blank.</div>
          ) : (
            sheet.quests.map((quest: any, i: number) => {
              const start = new Date(quest.startDate);
              const end = quest.endDate ? new Date(quest.endDate) : null;
              const isOngoing = !end;

              return (
                <div key={quest._id} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:odd:flex-row-reverse group">
                  
                  {/* Timeline Blood Drop Node */}
                  <div className={`absolute left-5 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#0a0705] z-10 ${isOngoing ? 'bg-red-700 shadow-[0_0_20px_rgba(185,28,28,0.8)]' : 'bg-[#2a1c12]'}`}>
                    <Skull className={`w-3 h-3 sm:w-4 sm:h-4 ${isOngoing ? 'text-black' : 'text-[#7a6b5d]'}`} />
                  </div>
                  
                  {/* Typewriter Document Card */}
                  <div className="w-full sm:w-[calc(50%-3rem)] pl-12 sm:pl-0 pt-2 sm:pt-0">
                     <div className={`p-6 sm:p-8 border bg-[#110c0a] shadow-2xl transition-all relative overflow-hidden ${isOngoing ? 'border-red-900/50' : 'border-[#2a1c12] hover:border-red-900/30'}`}>
                        {/* Torn Paper Effect Top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBMNCA0TDggMEw4IDhMMCA4WiIgZmlsbD0iIzBhMDcwNSIvPjwvc3ZnPg==')] opacity-50" />
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                           <div>
                             <div className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] mb-1 ${isOngoing ? 'text-red-600' : 'text-[#7a6b5d]'}`}>
                               {isOngoing ? ">> STATUS: ACTIVE" : ">> STATUS: SURVIVED"}
                             </div>
                             <h3 className="text-xl sm:text-2xl font-black text-[#d4c5a3] uppercase">{quest.role}</h3>
                             <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#8a7045] mt-1 font-mono">ORG: {quest.company}</h4>
                           </div>
                           <div className="text-[10px] font-mono border-b border-[#2a1c12] text-[#7a6b5d]">
                             {start.getFullYear()} - {isOngoing ? 'PRESENT' : end?.getFullYear()}
                           </div>
                        </div>
                        
                        {/* Typewriter Text content */}
                        <p className="mt-6 text-sm sm:text-base text-[#a89c8a] font-mono leading-relaxed whitespace-pre-wrap">
                          {quest.description}
                        </p>
                        
                        {quest.type && (
                          <div className="mt-6 inline-block border-t border-[#2a1c12] pt-2 w-full text-right text-[10px] font-bold uppercase tracking-[0.4em] text-red-900/80 font-mono">
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

      {/* PROJECT ROUTE MAP (BLOOD TRAIL) */}
      <section className="border border-[#1a1412] bg-[#0a0705] p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-900/5 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-[#2a1c12] pb-6 mb-8 relative z-10">
          <div>
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-[#7a6b5d]">Trace Route</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-[#c5bba1] uppercase tracking-tighter">Project History</h2>
          </div>
          <Map className="h-6 w-6 sm:h-8 sm:w-8 text-red-900" />
        </div>
        
        {sortedProjects.length === 0 ? (
          <div className="mt-6 text-sm text-[#7a6b5d] italic">The trail has gone cold. No projects documented.</div>
        ) : (
          <div className="grid gap-6 sm:gap-8 relative z-10">
            {sortedProjects.map((project: any) => {
              const start = project.startDate ? new Date(project.startDate) : null;
              const end = project.endDate ? new Date(project.endDate) : null;
              return (
                <div key={project._id} className="grid gap-4 md:grid-cols-[1fr_2fr] items-center border border-[#1a1412] bg-[#0c0908] p-4 sm:p-6 transition-all hover:border-red-900/30">
                  <div>
                    <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-red-800 font-bold mb-2">
                      {start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "UNKNOWN"}
                      {end ? ` -> ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : project.isOngoing ? " -> PRESENT" : ""}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#d4c5a3] uppercase">{project.title}</div>
                    <div className="mt-2 text-xs sm:text-sm text-[#8a7045] line-clamp-3 font-mono">{project.description}</div>
                  </div>
                  
                  {/* Blood Trail Progress Bar */}
                  <div className="flex items-center w-full mt-4 md:mt-0">
                    <div className="relative h-1 w-full overflow-hidden bg-[#1a1412]">
                      <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-red-950 to-red-600 ${project.isOngoing ? "w-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "w-full opacity-30"}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
