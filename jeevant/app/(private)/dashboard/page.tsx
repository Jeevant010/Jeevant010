import { getProjects } from "@/lib/actions/project.action";
import { getDailyTasks } from "@/lib/actions/task.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { Activity, Target, FileText, Clock, ShieldAlert, Database, Terminal } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // 1. FETCH REAL INTEL FROM DATABASE
  const projects = await getProjects();
  const tasks = await getDailyTasks();
  const notes = await getNotes();

  // 2. CALCULATE METRICS
  const activeCases = projects.filter((p: any) => p.status !== "Archived").length;
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const evidenceCount = notes.length;
  
  // High Priority item (first pending task)
  const currentObjective = pendingTasks[0]?.title || "NO ACTIVE OBJECTIVES";

  return (
    <div className="min-h-screen bg-[#111] text-slate-300 p-8 font-mono relative overflow-hidden -m-8">
      
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.6)] z-20" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        
        {/* --- HEADER: TERMINAL STYLE --- */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" />
              <span className="text-red-500 font-bold tracking-widest text-xs">SYSTEM_ONLINE // JEEVANT_OS_V2</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
              Command Center
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Date</div>
            <div className="text-xl font-bold text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* --- PRIMARY METRICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Cases", val: activeCases, icon: Target, color: "text-blue-500" },
            { label: "Pending Objectives", val: pendingTasks.length, icon: Clock, color: "text-yellow-500" },
            { label: "Evidence Collected", val: evidenceCount, icon: FileText, color: "text-slate-400" },
            { label: "Sys Load", val: "NOMINAL", icon: Activity, color: "text-green-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/5 p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-16 h-16" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
              </div>
              <div className="text-4xl font-bold text-white tracking-tighter">{stat.val}</div>
              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-700" />
            </div>
          ))}
        </div>

        {/* --- MAIN INTELLIGENCE DISPLAY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          
          {/* LEFT: CURRENT OBJECTIVE (The 'Mission') */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-red-900/20 p-8 relative">
            <div className="absolute top-4 right-4 flex gap-1">
               <div className="w-12 h-1 bg-red-600/20" />
               <div className="w-2 h-1 bg-red-600/20" />
            </div>
            
            <h3 className="text-red-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Priority Objective
            </h3>
            
            <div className="text-2xl md:text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-6 py-2 bg-gradient-to-r from-red-900/10 to-transparent">
              {currentObjective}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Recent Intel (Notes)</h4>
                <div className="space-y-2">
                  {notes.slice(0, 3).map((note: any) => (
                    <Link key={note._id} href="/brain" className="block p-3 bg-[#151515] border border-white/5 hover:border-white/20 transition group">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white truncate max-w-[200px]">{note.title}</span>
                        <span className="text-[10px] text-slate-600">{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">System Logs</h4>
                <div className="font-mono text-xs text-slate-500 space-y-1 p-4 bg-[#050505] border border-white/5 h-full">
                  <p> SYSTEM_BOOT_SEQUENCE_INIT</p>
                  <p> DATABASE_CONN_ESTABLISHED... <span className="text-green-500">OK</span></p>
                  <p> NEXT_JS_SERVER_READY... <span className="text-green-500">OK</span></p>
                  <p> USER_JEEVANT_AUTHENTICATED</p>
                  <p className="animate-pulse"> WAITING_FOR_INPUT_</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS (Terminal Buttons) */}
          <div className="flex flex-col gap-4">
            <Link href="/planner/daily" className="flex-1 bg-[#151515] border border-white/5 p-6 hover:bg-[#202020] hover:border-white/20 transition group flex flex-col justify-center items-center text-center gap-4">
              <Clock className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider">Open War Room</div>
                <div className="text-xs text-slate-500 mt-1">Manage Daily Objectives</div>
              </div>
            </Link>
            
            <Link href="/cms/projects" className="flex-1 bg-[#151515] border border-white/5 p-6 hover:bg-[#202020] hover:border-white/20 transition group flex flex-col justify-center items-center text-center gap-4">
              <Database className="w-8 h-8 text-blue-500 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider">Access Case Files</div>
                <div className="text-xs text-slate-500 mt-1">Manage Projects (CMS)</div>
              </div>
            </Link>
            
            <Link href="/brain" className="flex-1 bg-[#151515] border border-white/5 p-6 hover:bg-[#202020] hover:border-white/20 transition group flex flex-col justify-center items-center text-center gap-4">
              <Terminal className="w-8 h-8 text-slate-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider">The Mind Place</div>
                <div className="text-xs text-slate-500 mt-1">Log New Evidence</div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}