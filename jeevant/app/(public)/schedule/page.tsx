import Link from "next/link";
import { getDaySchedules } from "@/lib/actions/schedule.actions";
import { CalendarDays, Clock, Lock, Activity, RadioReceiver } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysSchedule = await getDaySchedules(todayISO);

  return (
    <div className="space-y-12 max-w-4xl mx-auto font-mono relative sm:-m-8 p-4 sm:p-8 transition-colors">
      
      {/* TACTICAL BACKGROUND */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* TACTICAL HERO */}
      <section className="relative overflow-hidden border border-shell-border bg-shell-surface/80 backdrop-blur p-8 sm:p-12 shadow-[0_0_40px_var(--color-cinematic-glow)] group rounded-xl">
        
        {/* Sonar Overlay FX */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-shell-accent animate-sonar" />
          <div className="w-[600px] h-[600px] rounded-full border border-shell-accent absolute animate-sonar" style={{ animationDelay: '1s' }} />
          <div className="w-[400px] h-[400px] rounded-full border border-shell-accent absolute animate-sonar" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0)_50%,rgba(15,23,42,0.8)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <RadioReceiver className="w-4 h-4 text-shell-accent animate-pulse" />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-shell-accent">
              Sonar Frequency: {todayISO}
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-shell-text uppercase drop-shadow-[0_0_15px_var(--color-shell-accent)]">
            Active Operations
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-shell-muted font-sans border-l border-shell-accent pl-4">
            Real-time tracking of current whereabouts and operations. Classified tasks are encrypted and hidden from the public frequency.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="border border-shell-border bg-shell-surface/60 backdrop-blur p-6 sm:p-12 relative overflow-hidden rounded-xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-shell-border pb-6 mb-8 gap-4 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-shell-text flex items-center gap-3 uppercase tracking-tighter">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-shell-accent" /> 
            Live Feed
          </h2>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-shell-accent px-3 py-1 border border-shell-accent bg-shell-accent/10">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-8 sm:space-y-12 relative z-10 before:absolute before:inset-0 before:left-5 sm:before:left-1/2 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-shell-accent/50 before:via-shell-border before:to-transparent">
          {todaysSchedule.length > 0 ? (
            todaysSchedule.map((item: any, index: number) => {
              const theme = getTacticalColor(index);
              const start = new Date(item.start);
              const end = item.end ? new Date(item.end) : null;
              const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}`;
              
              const isPrivate = item.visibility === "private";

              return (
                <div key={item._id} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:odd:flex-row-reverse group">
                  
                  {/* Timeline Dot */}
                  <div className={cn("absolute left-5 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-shell-surface z-10", isPrivate ? 'bg-red-900 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : cn('bg-shell-bg', theme.border))}>
                    {isPrivate ? <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : <Clock className={cn("w-3 h-3 sm:w-4 sm:h-4", theme.text)} />}
                  </div>
                  
                  {/* Content Card (Mobile: push right, Desktop: alternate) */}
                  <div className="w-full sm:w-[calc(50%-3rem)] pl-16 sm:pl-0 pt-2 sm:pt-0">
                    <div className={cn("p-4 sm:p-6 rounded-lg border bg-shell-bg shadow-2xl transition-all", isPrivate ? 'border-red-900/50 hover:border-red-500/50' : cn(theme.borderHover, theme.glow, 'border-shell-border'))}>
                      <div className="flex items-center justify-between mb-2">
                        <time className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-widest", isPrivate ? 'text-red-500' : theme.text)}>
                          {timeStr}
                        </time>
                      </div>
                      
                      {isPrivate ? (
                        <div className="mt-2 text-shell-text font-black uppercase tracking-widest flex items-center gap-2 sm:text-lg">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                          <span className="truncate">[ CLASSIFIED ]</span>
                        </div>
                      ) : (
                        <>
                          <h3 className={cn("text-lg sm:text-xl font-bold uppercase transition-colors text-shell-text", theme.textHover)}>{item.title}</h3>
                          {item.notes && <p className="text-xs sm:text-sm text-shell-muted mt-2 font-sans line-clamp-3">{item.notes}</p>}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-16 sm:py-24 rounded border border-dashed border-shell-border bg-shell-bg/50 relative z-10">
              <p className="text-shell-muted font-sans italic text-sm sm:text-base">No active sonar contacts today.</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-shell-muted mt-4 font-bold">Scanning frequencies...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
