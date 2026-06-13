import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Code2, MapPinned, Cpu, Shield, Award, Crosshair, Fingerprint, Terminal, Activity, Zap } from "lucide-react";
import { getProfile } from "@/lib/actions/profile.actions";
import { getPublicProjects } from "@/lib/actions/project.action";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getTacticalColor, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, sheet] = await Promise.all([
    getProfile(), 
    getPublicProjects(),
    getCharacterSheet()
  ]);

  return (
    <div className="space-y-12 sm:space-y-16 relative">
      
      {/* TACTICAL BACKGROUND WRAPPER (Fixes the "black sides" issue) */}
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* MODERN WARFARE HERO SECTION */}
      <section className="relative overflow-hidden border border-shell-border bg-shell-bg/60 backdrop-blur-md px-6 py-16 sm:py-24 shadow-[0_0_50px_var(--color-cinematic-glow)] sm:px-10 lg:px-14 min-h-[70vh] flex flex-col justify-center group rounded-xl transition-colors">
        
        {/* Tactical scanning line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-shell-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
        <div className="absolute bottom-0 right-10 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-50" />
        
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center max-w-7xl mx-auto w-full">
          
          {/* Left: Identity HUD */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-3 border border-shell-accent/30 bg-shell-accent/5 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-shell-accent shadow-[0_0_15px_var(--color-cinematic-glow)] rounded-sm">
              <Crosshair className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
              STATUS: {profile.status}
            </div>

            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-shell-text uppercase">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-shell-muted font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-shell-accent" /> {profile.title}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/projects" className="flex items-center justify-center gap-2 bg-shell-text px-6 py-4 text-sm font-black uppercase tracking-widest text-shell-bg transition hover:opacity-80 hover:shadow-[0_0_20px_var(--color-cinematic-glow)] rounded-sm">
                View Archives <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="flex items-center justify-center gap-2 border border-shell-muted/30 bg-shell-bg/50 px-6 py-4 text-sm font-bold uppercase tracking-widest text-shell-muted transition hover:border-shell-accent hover:text-shell-accent rounded-sm">
                Access Dossier <Fingerprint className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Tactical Stats Grid */}
          <div className="border border-shell-border bg-shell-surface/80 backdrop-blur p-6 sm:p-8 relative overflow-hidden group-hover:border-shell-accent/30 transition-colors rounded-xl">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
              <Activity className="w-48 h-48 text-shell-accent" />
            </div>
            
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-shell-muted mb-6 font-bold flex items-center gap-2">
               <Shield className="w-3 h-3 text-shell-accent" /> Metrics Overview
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 font-mono">
              {profile.stats?.map((stat: any, i: number) => (
                <div key={i} className="bg-shell-bg/50 border border-shell-border p-3 rounded-sm hover:border-shell-accent/50 transition-colors">
                  <div className="text-[10px] uppercase text-shell-muted font-bold tracking-widest mb-1">{stat.label}</div>
                  <div className="text-sm sm:text-base font-bold text-shell-text">{stat.value}</div>
                </div>
              ))}
              {(!profile.stats || profile.stats.length === 0) && (
                 <div className="col-span-full text-shell-muted text-xs italic">No tactical data logged.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY GRIDS */}
      <div className="grid gap-6 lg:grid-cols-2 relative z-10">
        
        {/* RECENT DEPLOYS */}
        <section className="border border-shell-border bg-shell-surface/90 backdrop-blur p-6 sm:p-10 relative overflow-hidden group rounded-xl transition-colors">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-shell-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between border-b border-shell-border pb-6 relative z-10 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-shell-accent">Selected Work</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-shell-text tracking-tight uppercase">Recent Deploys</h2>
            </div>
            <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-shell-accent opacity-50" />
          </div>
          
          <div className="grid gap-4 sm:gap-6 relative z-10">
            {projects.slice(0, 3).map((project: any, index: number) => {
              const theme = getTacticalColor(index);
              return (
                <Link key={project._id} href={`/projects/${project.slug || project._id}`} className={cn("group/item block rounded-sm border bg-shell-bg p-4 sm:p-6 transition-all hover:bg-shell-surface", theme.border, theme.borderHover)}>
                  <div className={cn("text-[10px] font-mono uppercase tracking-[0.3em] mb-2 transition-colors text-shell-muted", theme.textHover)}>sys.file.{project.slug || project._id.slice(-6)}</div>
                  <h3 className={cn("text-lg sm:text-xl font-bold text-shell-text transition-colors", theme.textHover)}>{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-shell-muted/80">{project.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RECENT HONORS */}
        <section className="border border-shell-border bg-shell-surface/90 backdrop-blur p-6 sm:p-10 relative overflow-hidden group rounded-xl transition-colors">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between border-b border-shell-border pb-6 relative z-10 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-500">Recent Honors</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-shell-text tracking-tight uppercase">Acquired Intel</h2>
            </div>
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-500 opacity-50" />
          </div>
          
          <div className="grid gap-4 sm:gap-6 relative z-10">
            {sheet.loot.slice(0, 3).map((item: any, index: number) => {
              const theme = getTacticalColor(index + 3); // offset to mix colors
              return (
                <div key={item._id} className={cn("group/item rounded-sm border bg-shell-bg p-4 sm:p-6 transition-all hover:bg-shell-surface", theme.border, theme.borderHover)}>
                  <div className={cn("text-[10px] font-mono uppercase tracking-[0.3em] text-shell-muted mb-2 flex items-center gap-2 transition-colors", theme.textHover)}>
                    <Award className="w-3 h-3" /> {item.platform}
                  </div>
                  <h3 className={cn("text-lg sm:text-xl font-bold text-shell-text transition-colors", theme.textHover)}>{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-shell-muted/80">{item.description}</p>
                </div>
              );
            })}
            {sheet.loot.length === 0 && (
               <div className="text-shell-muted text-sm font-mono italic text-center py-12">No intel acquired yet.</div>
            )}
          </div>
        </section>
      </div>

      {/* EXPLORATION NAV (MODERN TACTICAL) */}
      <section className="grid gap-4 sm:gap-6 md:grid-cols-3 relative z-10">
        {[
          { href: "/journey", label: "Operations", desc: "Experience & Deployments.", icon: MapPinned },
          { href: "/schedule", label: "Schedule", desc: "Public Operations.", icon: CalendarDays },
          { href: "/library", label: "Archives", desc: "Logs & Research.", icon: BookOpen },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="group rounded-xl border border-shell-border bg-shell-surface/90 backdrop-blur p-6 text-center transition hover:border-shell-accent hover:bg-shell-bg">
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-shell-muted/30 bg-shell-bg group-hover:border-shell-accent group-hover:bg-shell-accent/10 transition-colors rounded-full">
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-shell-muted group-hover:text-shell-accent transition-colors" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-black uppercase tracking-widest text-shell-text">{item.label}</h3>
            <p className="mt-2 text-xs sm:text-sm text-shell-muted font-mono">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}