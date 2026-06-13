import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import { 
  Shield, 
  Map, 
  Target,
  Terminal,
  Activity,
  Crosshair,
  Database,
  Lock
} from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AboutRPG() {
  const [profile, { quests, loot }] = await Promise.all([
    getProfile(),
    getCharacterSheet()
  ]);

  return (
    <div className="min-h-screen text-shell-text p-4 sm:p-8 font-mono relative sm:-m-8 transition-colors">
      
      {/* --- TACTICAL BACKGROUND (Matches Home) --- */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 sm:pt-12">
        
        {/* --- LEFT: OPERATOR CARD --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-shell-bg/60 backdrop-blur-md border border-shell-border rounded-xl p-4 shadow-[0_20px_50px_var(--color-cinematic-glow)] relative group transition-colors">
            {/* Corner Ornaments */}
            <div className="absolute -top-1 -left-1 w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-l-2 border-shell-accent/50" />
            <div className="absolute -bottom-1 -right-1 w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-r-2 border-shell-accent/50" />
            
            {/* Avatar */}
            <div className="aspect-[3/4] w-full max-w-[320px] sm:max-w-full mx-auto bg-shell-surface rounded border border-shell-border flex items-center justify-center relative overflow-hidden transition-colors">
               <div 
                 className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-[50%]" 
                 style={{ backgroundImage: `url('${profile.avatarUrl}')` }}
               />
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-shell-bg via-shell-bg/80 to-transparent h-40" />
               <div className="absolute bottom-6 left-6 right-6">
                 <h2 className="text-2xl sm:text-3xl font-black text-shell-text uppercase tracking-widest flex items-center gap-2">
                   {profile.name} <Lock className="w-4 h-4 text-shell-accent" />
                 </h2>
                 <p className="text-shell-accent text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                   <Target className="w-3 h-3" /> HEROCOMING_ID: {profile._id.slice(-6).toUpperCase()}
                 </p>
               </div>
            </div>
            
            {/* Stats HUD */}
            <div className="mt-6 space-y-3 px-2 pb-4">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-shell-muted font-bold mb-4 flex items-center gap-2 border-b border-shell-border pb-2">
                <Activity className="w-3 h-3 text-shell-accent" /> Performance Metrics
              </h3>
              
              {profile.stats?.map((stat: any, i: number) => (
                <div key={i} className="flex justify-between items-end border-b border-shell-border pb-2 hover:border-shell-accent/50 transition-colors group/stat">
                  <span className="text-[10px] font-bold text-shell-muted uppercase tracking-widest group-hover/stat:text-shell-text">{stat.label}</span>
                  <span className="text-sm font-mono text-shell-accent">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: OPERATIONS & INTEL --- */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header */}
          <div className="border-b border-shell-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative">
            <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-shell-accent/50 shadow-[0_0_10px_var(--color-shell-accent)]" />
            <div>
               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-shell-text uppercase tracking-tighter">
                 Operational Dossier
               </h1>
               <p className="text-shell-accent font-bold mt-2 font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase">
                 // SYS.RECORD.ACTIVE // SECURITY_CLEARANCE: AUTHORIZED
               </p>
            </div>
            <div className="hidden md:block">
              <Database className="w-12 h-12 text-shell-accent opacity-20" />
            </div>
          </div>

          {/* DYNAMIC LOOT (Achievements/Intel) */}
          <div className="bg-shell-surface/80 backdrop-blur p-6 sm:p-8 rounded-xl border border-shell-border relative group transition-colors">
             <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-[30px] group-hover:bg-cyan-500/10 transition-colors" />
             <h3 className="text-lg sm:text-xl font-bold text-shell-text mb-6 flex items-center gap-3 uppercase tracking-widest">
               <div className="w-8 h-8 bg-shell-bg rounded flex items-center justify-center border border-shell-border">
                 <Shield className="w-4 h-4 text-cyan-500" />
               </div>
               Acquired Intel
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {loot.length === 0 ? (
                 <div className="col-span-full text-center py-8 text-shell-muted italic font-mono text-xs">No intel acquired yet.</div>
               ) : (
                 loot.map((item: any, index: number) => {
                   const theme = getTacticalColor(index);
                   return (
                     <div key={item._id} className={cn("bg-shell-bg/50 p-4 sm:p-5 rounded border flex items-start gap-4 transition group/item relative overflow-hidden", theme.border, theme.borderHover)}>
                       <div className={cn("absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity bg-gradient-to-r to-transparent", theme.text.replace("text-", "from-").replace("500", "500/5"))} />
                       <div className={cn("w-10 h-10 rounded bg-shell-surface border flex items-center justify-center transition shrink-0 relative z-10 text-shell-muted", theme.border, theme.textHover, theme.borderHover)}>
                         <Database className="w-4 h-4" />
                       </div>
                       <div className="relative z-10">
                         <div className={cn("text-[10px] uppercase font-bold mb-1 tracking-widest flex items-center gap-1", theme.text)}>
                           {item.visibility === "private" && <Lock className="w-3 h-3 text-red-500" />} {item.platform}
                         </div>
                         <div className={cn("text-sm sm:text-base font-bold text-shell-text transition-colors", theme.textHover)}>{item.title}</div>
                         <p className="text-xs text-shell-muted mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>

          {/* DYNAMIC QUESTS (Operations) */}
          <div className="space-y-6">
             <h3 className="text-lg sm:text-xl font-bold text-shell-text flex items-center gap-3 uppercase tracking-widest">
               <div className="w-8 h-8 bg-shell-bg rounded flex items-center justify-center border border-shell-border">
                 <Terminal className="w-4 h-4 text-shell-accent" />
               </div>
               Field Operations
             </h3>

             <div className="relative pl-6 sm:pl-10 space-y-8 sm:space-y-12 before:absolute before:inset-0 before:left-3 sm:before:left-5 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-shell-accent/50 before:via-shell-border before:to-transparent">
               {quests.length === 0 ? (
                 <div className="py-8 text-shell-muted italic font-mono text-xs text-center">No operations recorded in the archives.</div>
               ) : (
                 quests.map((quest: any, index: number) => {
                   const theme = getTacticalColor(index + 2); // offset
                   return (
                     <div key={quest._id} className="relative group">
                       {/* Timeline Node */}
                       <div className={cn("absolute -left-[30px] sm:-left-[46px] top-4 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-shell-bg border flex items-center justify-center z-10 transition-colors", theme.borderHover, theme.border, theme.glow)}>
                         <div className={cn("w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full", theme.bg)} />
                       </div>
                       
                       {/* Card */}
                       <div className={cn("bg-shell-surface/80 backdrop-blur p-6 sm:p-8 rounded-xl border transition relative overflow-hidden", theme.border, theme.borderHover)}>
                          <div className={cn("absolute top-0 right-0 p-4 opacity-5 pointer-events-none", theme.text)}>
                             <Crosshair className="w-16 h-16" />
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 relative z-10">
                            <div>
                               <h4 className="text-xl sm:text-2xl font-black text-shell-text">{quest.role}</h4>
                               <p className={cn("text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-widest", theme.text)}>Command: {quest.company}</p>
                            </div>
                            <span className={cn("text-[10px] font-bold border px-3 py-1 uppercase tracking-widest shadow-inner", quest.endDate ? 'text-shell-muted border-shell-border bg-shell-bg' : cn('bg-shell-bg', theme.text, theme.borderHover))}>
                               {quest.endDate ? 'CONCLUDED' : 'ACTIVE'}
                            </span>
                          </div>
                          <p className="text-shell-muted text-sm leading-relaxed relative z-10">
                            {quest.description}
                          </p>
                          
                          {quest.skillsUsed?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                              {quest.skillsUsed.map((skill: string, idx: number) => (
                                <span key={idx} className={cn("text-[10px] font-mono border px-2 py-1 rounded-sm", theme.text, theme.border, theme.bgMuted)}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}