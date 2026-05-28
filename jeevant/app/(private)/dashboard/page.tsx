import { getProjects } from "@/lib/actions/project.action";
import { getDailyTasks } from "@/lib/actions/task.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { 
  Activity, Target, FileText, Clock, ShieldAlert, Database, Terminal, Briefcase 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const projects = await getProjects();
  const tasks = await getDailyTasks();
  const notes = await getNotes();

  const activeCases = projects.filter((p: any) => p.status !== "Archived").length;
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const evidenceCount = notes.length;
  const currentObjective = pendingTasks[0]?.title || "NO ACTIVE OBJECTIVES";

  return (
    <div className="min-h-full bg-transparent p-4 sm:p-6 md:p-10 font-mono relative">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-shell-border pb-6 relative gap-4">
          <div className="absolute bottom-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-[color:var(--accent)] to-transparent" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-[color:var(--accent)] rounded-full animate-pulse shadow-[0_0_15px_var(--accent)]" />
              <span className="text-[color:var(--accent)] font-bold tracking-[0.3em] text-[10px] sm:text-xs uppercase">SYSTEM_ONLINE // THE_CONTINENTAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-shell-text uppercase tracking-tighter drop-shadow-md">
              Operations Board
            </h1>
          </div>
        </div>

        {/* Metrics / Case Files */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Active Directives", val: activeCases, icon: Target },
            { label: "Open Threads", val: pendingTasks.length, icon: Clock },
            { label: "Evidence Files", val: evidenceCount, icon: FileText },
            { label: "System Status", val: "NOMINAL", icon: Activity },
          ].map((stat, i) => (
            <div key={i} className="cut-corners bg-[#0a0a0f]/80 backdrop-blur-xl border border-shell-border p-6 relative group overflow-hidden transition-all hover:border-[color:var(--accent)] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-24 h-24 text-[color:var(--accent)] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <stat.icon className="w-4 h-4 text-[color:var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-shell-muted group-hover:text-[color:var(--accent)] transition-colors">{stat.label}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-shell-text tracking-tighter relative z-10 drop-shadow-md">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 h-full">
          {/* Mission Monitor */}
          <div className="lg:col-span-2 cut-corners-reverse bg-[#0a0a0f]/80 backdrop-blur-xl border border-shell-border p-6 sm:p-8 relative flex flex-col h-full shadow-2xl group hover:border-blue-500/50 transition-colors">
            
            <h3 className="text-blue-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> Current Primary Objective
            </h3>
            
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-shell-text mb-8 border-l-2 border-blue-500 pl-4 sm:pl-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent tracking-tight leading-snug">
              {currentObjective}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-shell-muted uppercase tracking-[0.3em] border-b border-shell-border pb-2">Recent Intel (Notes)</h4>
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note: any) => (
                    <Link key={note._id} href="/brain" className="block p-3 sm:p-4 bg-black/40 border border-shell-border hover:border-blue-500/50 transition group/note">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs sm:text-sm font-bold text-shell-text group-hover/note:text-blue-400 transition-colors line-clamp-1">{note.title}</span>
                        <span className="text-[9px] text-shell-muted shrink-0 uppercase tracking-wider font-sans">{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                  {notes.length === 0 && <p className="text-xs text-shell-muted italic font-sans">No recent intel.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid (On-Screen Nav) */}
          <div className="grid grid-cols-2 gap-4 h-full content-start">
             <DashboardLink href="/planner/daily" title="Schedule" sub="Agenda" icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />} />
             <DashboardLink href="/brain" title="Notes" sub="Intel" icon={<Terminal className="w-5 h-5 sm:w-6 sm:h-6" />} />
             <DashboardLink href="/cms/rpg" title="Quests" sub="RPG Hub" icon={<Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />} />
             <DashboardLink href="/cms/projects" title="Admin" sub="Manage" icon={<Database className="w-5 h-5 sm:w-6 sm:h-6" />} isSpecial />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLink({ href, title, sub, icon, isSpecial }: any) {
  return (
    <Link href={href} className={`cut-corners p-4 sm:p-5 border ${isSpecial ? 'border-amber-500/50 bg-amber-500/10' : 'border-shell-border bg-black/60'} hover:border-[color:var(--accent)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all group flex flex-col justify-between h-32 sm:h-36 backdrop-blur-sm`}>
      <div className="flex justify-between items-start text-shell-muted group-hover:text-[color:var(--accent)] transition-colors">
        {icon} 
        {isSpecial && <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.5)]">ROOT</span>}
      </div>
      <div>
        <div className={`font-black uppercase tracking-widest mt-4 text-xs sm:text-sm ${isSpecial ? 'text-amber-500' : 'text-shell-text'}`}>
          {title}
        </div>
        <div className="text-[9px] sm:text-[10px] uppercase text-shell-muted mt-1 tracking-[0.2em]">
          {sub}
        </div>
      </div>
    </Link>
  )
}