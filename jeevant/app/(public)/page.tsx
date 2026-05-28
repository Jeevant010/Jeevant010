import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, Code2, MapPinned, Cpu, Shield, Sword, Award, Crosshair, Fingerprint, Terminal } from "lucide-react";
import { getProfile } from "@/lib/actions/profile.actions";
import { getPublicProjects } from "@/lib/actions/project.action";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, sheet] = await Promise.all([
    getProfile(), 
    getPublicProjects(),
    getCharacterSheet()
  ]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* JOHN WICK / CYBERPUNK HERO SECTION */}
      <section className="relative overflow-hidden cut-corners border border-amber-500/20 bg-[#050505] px-6 py-16 sm:py-20 shadow-[0_0_50px_rgba(245,158,11,0.05)] sm:px-10 lg:px-14 min-h-[70vh] flex flex-col justify-center group">
        
        {/* Background FX (Continental / Matrix) */}
        <div className="absolute inset-0 bg-mindplace-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_40%)] pointer-events-none" />
        <div className="absolute top-0 right-10 w-[2px] h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center max-w-6xl mx-auto w-full">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-3 cut-corners border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Crosshair className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
              STATUS: {profile.status}
            </div>

            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.4em] text-cyan-400 font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4" /> {profile.title}
              </p>
              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-400 font-serif italic mt-4 border-l-2 border-amber-500/50 pl-4">
                "Whoever comes, whoever it is... I'll build it. I'll build it all." 
                <br /><span className="text-xs text-slate-500 font-sans mt-2 block">— The Architect's Continental Database.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/projects" className="cut-corners flex items-center justify-center gap-2 bg-amber-500 px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                Access Archives <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="cut-corners flex items-center justify-center gap-2 border border-slate-700 bg-slate-900/50 px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400">
                View Dossier <Fingerprint className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Stats / Continental Dossier */}
          <div className="cut-corners-reverse border border-slate-800 bg-black/80 p-6 sm:p-8 relative overflow-hidden group-hover:border-amber-500/30 transition-colors">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000">
              <Cpu className="w-48 h-48 text-cyan-500" />
            </div>
            
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-6 font-bold flex items-center gap-2">
               <Shield className="w-3 h-3 text-cyan-500" /> Executive Summary
            </h3>
            
            <div className="space-y-4 sm:space-y-6 relative z-10 font-mono">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Threat Level</div>
                <div className="text-xl sm:text-2xl font-black text-amber-500">{profile.level}</div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Logic (LC)</div>
                <div className="text-xl sm:text-2xl font-black text-white">{profile.leetcodeRating}</div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Acquired Assets</div>
                <div className="text-xl sm:text-2xl font-black text-white">{sheet.loot.length}</div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Public Deploys</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400">{projects.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATRIX / CYBERPUNK GRIDS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FEATURED PROJECTS */}
        <section className="cut-corners border border-slate-800 bg-[#0a0a0a] p-6 sm:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 relative z-10 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-500">Selected Work</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Recent Archives</h2>
            </div>
            <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-500 opacity-50" />
          </div>
          
          <div className="grid gap-4 sm:gap-6 relative z-10">
            {projects.slice(0, 3).map((project: any) => (
              <Link key={project._id} href="/projects" className="group/item block rounded border border-slate-800 bg-[#111] p-4 sm:p-6 transition-all hover:border-cyan-500 hover:bg-[#151515]">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600 mb-2 group-hover/item:text-cyan-500 transition-colors">sys.file.{project.slug}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover/item:text-cyan-400 transition-colors">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-400 font-serif italic">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* LATEST ACHIEVEMENTS (LOOT) */}
        <section className="cut-corners-reverse border border-slate-800 bg-[#0a0a0a] p-6 sm:p-10 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 relative z-10 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">Recent Honors</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Acquired Loot</h2>
            </div>
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 opacity-50" />
          </div>
          
          <div className="grid gap-4 sm:gap-6 relative z-10">
            {sheet.loot.slice(0, 3).map((item: any) => (
              <div key={item._id} className="group/item rounded border border-slate-800 bg-[#111] p-4 sm:p-6 transition-all hover:border-amber-500 hover:bg-[#151515]">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600 mb-2 flex items-center gap-2 group-hover/item:text-amber-500 transition-colors">
                  <Award className="w-3 h-3" /> {item.platform}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover/item:text-amber-400 transition-colors">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-400 font-serif italic">{item.description}</p>
              </div>
            ))}
            {sheet.loot.length === 0 && (
               <div className="text-slate-500 text-sm font-serif italic text-center py-12">No loot acquired yet.</div>
            )}
          </div>
        </section>
      </div>

      {/* EXPLORATION NAV (MODERN SLEEK) */}
      <section className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {[
          { href: "/journey", label: "Journey", desc: "Experience & Quests.", icon: MapPinned },
          { href: "/schedule", label: "Schedule", desc: "Public Operations.", icon: CalendarDays },
          { href: "/library", label: "Library", desc: "Archives & Lore.", icon: BookOpen },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="cut-corners group border border-slate-800 bg-[#0a0a0a] p-6 text-center transition hover:border-white hover:bg-[#111]">
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-slate-700 bg-black group-hover:border-white group-hover:bg-white transition-colors">
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-black transition-colors" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-black uppercase tracking-widest text-white">{item.label}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 font-serif italic">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}