import { getLearning } from "@/lib/actions/learning.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { LibraryBig, BookMarked, FileSearch2, BookOpenText, Target, Crosshair } from "lucide-react";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [learning, notes] = await Promise.all([getLearning(), getNotes()]);
  const progressWidths = ["w-[0%]", "w-[20%]", "w-[40%]", "w-[60%]", "w-[80%]", "w-full"];

  return (
    <div className="space-y-12 sm:space-y-16 font-mono relative sm:-m-8 p-4 sm:p-8 transition-colors">
      
      {/* TACTICAL BACKGROUND */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <section className="relative overflow-hidden border border-shell-border bg-shell-surface/80 backdrop-blur p-8 sm:p-16 shadow-[0_0_50px_var(--color-cinematic-glow)] group rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell-accent/10 to-transparent h-[200%] w-full animate-scan pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex items-center gap-3">
             <Target className="w-5 h-5 text-shell-accent animate-pulse" />
             <p className="text-xs font-bold uppercase tracking-[0.5em] text-shell-muted">Data Core // Library</p>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-shell-text uppercase drop-shadow-[0_2px_10px_var(--color-shell-accent)]">
            Intelligence Archives
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-shell-muted border-l-4 border-shell-accent pl-4 font-sans">
            Classified reading materials, acquired operational knowledge, and the manuals that dictate combat strategies.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: LibraryBig, title: "Reading List", desc: "Long-form intelligence briefs and classified texts.", color: getTacticalColor(0) },
          { icon: BookMarked, title: "Tracked Training", desc: "Combat courses, VR simulations, and tactical drills.", color: getTacticalColor(1) },
          { icon: BookOpenText, title: "Field Notes", desc: "Scribbled takeaways and essential intel drops.", color: getTacticalColor(2) },
        ].map((item, i) => (
          <div key={i} className={cn("rounded-sm border bg-shell-surface/60 backdrop-blur p-6 group transition-colors", item.color.borderHover)}>
            <div className={cn("w-12 h-12 flex items-center justify-center border bg-shell-bg mb-4 transition-colors", item.color.textHover, item.color.border)}>
               <item.icon className={cn("w-6 h-6", item.color.text)} />
            </div>
            <h2 className="text-xl font-bold text-shell-text uppercase tracking-wider">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-shell-muted font-sans">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-shell-border bg-shell-surface/60 backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-shell-border pb-4 mb-8">
            <h2 className="text-2xl font-black text-shell-text uppercase tracking-tighter flex items-center gap-2">
               <Crosshair className="w-6 h-6 text-shell-accent" /> Training Catalog
            </h2>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-shell-accent border border-shell-accent bg-shell-accent/10 px-2 py-1">Backend DB</span>
          </div>
          
          <div className="space-y-4">
            {learning.length === 0 ? (
              <div className="text-sm text-shell-muted italic text-center py-8">No training data found in the server.</div>
            ) : (
              learning.map((item: any, index: number) => {
                const theme = getTacticalColor(index + 3);
                const pct = Math.min(progressWidths.length - 1, Math.floor(((item.totalModules ? (item.completedModules / item.totalModules) * 100 : 0)) / 20));
                
                return (
                  <div key={item._id} className={cn("border bg-shell-bg p-5 relative overflow-hidden group transition-all", theme.borderHover, theme.border)}>
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r to-transparent", theme.text.replace("text-", "from-").replace("500", "500/5"))} />
                    
                    <div className="flex flex-wrap items-start justify-between gap-2 relative z-10">
                      <div>
                        <div className={cn("text-sm sm:text-base font-bold uppercase transition-colors text-shell-text", theme.textHover)}>{item.title}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-shell-muted">{item.platform || "Reference"}</div>
                      </div>
                      <span className={cn("border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] bg-shell-surface", theme.text, theme.border)}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-6 h-1.5 w-full bg-shell-surface border border-shell-border relative z-10 overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-1000", theme.bg, progressWidths[pct], theme.glow)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-shell-border bg-shell-surface/60 backdrop-blur p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-shell-border pb-4 mb-8">
            <FileSearch2 className="h-6 w-6 text-shell-accent" />
            <h2 className="text-2xl font-black text-shell-text uppercase tracking-tighter">Decrypted Notes</h2>
          </div>
          
          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-sm text-shell-muted italic text-center py-8">Awaiting decrypted inputs.</div>
            ) : (
              notes.slice(0, 6).map((note: any, index: number) => {
                const theme = getTacticalColor(index + 5);
                return (
                  <div key={note._id} className={cn("border bg-shell-bg p-4 relative group transition-all", theme.borderHover, theme.border)}>
                     <div className={cn("absolute top-0 right-0 w-2 h-2 border-b border-l", theme.border)} />
                     <div className={cn("text-sm sm:text-base font-bold text-shell-text uppercase tracking-wider mb-2 transition-colors", theme.textHover)}>
                       {note.title}
                     </div>
                     <p className="text-sm leading-relaxed text-shell-muted font-sans">
                       {note.content || "Classified contents. Access level insufficient."}
                     </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
