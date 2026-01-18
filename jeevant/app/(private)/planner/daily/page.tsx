import { getDailyTasks, createTask } from "@/lib/actions/task.actions";
import TaskItem from "@/components/features/TaskItem"; // We will reuse this, but it will need styling updates
import { Calendar, Plus, Crosshair, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DailyPlanner() {
  const tasks = await getDailyTasks();
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const completedTasks = tasks.filter((t: any) => t.isCompleted);

  return (
    <div className="min-h-screen bg-[#111] text-slate-300 p-8 font-mono -m-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Crosshair className="w-8 h-8 text-red-600" />
            Tactical Log
          </h1>
          <p className="text-slate-500 mt-2 text-sm tracking-widest">
            // OPERATION: DAILY_GRIND // STATUS: ACTIVE
          </p>
        </div>
        <div className="px-4 py-2 bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-bold uppercase tracking-widest rounded animate-pulse">
          Live Ops
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT: MISSION INPUT & LIST */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Input Field */}
          <form action={createTask} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-red-500" />
            </div>
            <input 
              name="title"
              required
              autoComplete="off"
              placeholder="ENTER NEW OBJECTIVE..." 
              className="w-full bg-[#0a0a0a] border-b-2 border-slate-800 text-white pl-12 pr-16 py-6 text-lg focus:border-red-600 focus:outline-none placeholder-slate-700 font-bold transition-colors"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
              <span className="text-xs font-bold uppercase border border-slate-700 px-2 py-1">Execute</span>
            </button>
          </form>

          {/* Pending Objectives */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Pending Objectives ({pendingTasks.length})
            </h3>
            
            <div className="space-y-0 border border-slate-800 bg-[#0a0a0a]">
              {pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-600 italic">NO ACTIVE THREATS. ADD OBJECTIVE.</div>
              ) : (
                pendingTasks.map((t: any) => (
                  <div key={t._id} className="border-b border-slate-800 last:border-0">
                     {/* Reusing TaskItem logic but we need to ensure it renders cleanly on dark mode */}
                     <TaskItem task={t} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Log */}
          {completedTasks.length > 0 && (
            <div className="opacity-60 hover:opacity-100 transition duration-500">
               <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-900 rounded-full" /> Mission History
              </h3>
               <div className="space-y-0 border border-slate-800 bg-[#0a0a0a]">
                {completedTasks.map((t: any) => (
                  <div key={t._id} className="border-b border-slate-800 last:border-0">
                     <TaskItem task={t} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: STRATEGY SIDEBAR */}
        <div className="border-l border-white/5 pl-8 hidden lg:block">
          <div className="sticky top-8 space-y-8">
            <div className="bg-[#151515] p-6 border border-white/5">
              <h3 className="text-white font-bold uppercase mb-4 border-b border-white/10 pb-2">Protocol</h3>
              <ul className="space-y-3 text-sm text-slate-400 font-mono">
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">0900</span>
                  <span>Deep Work Block A</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">1300</span>
                  <span>System Sync / Comms</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">1500</span>
                  <span>Dev Sprints</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-dashed border-slate-700 text-center">
              <div className="text-4xl font-black text-white mb-1">{Math.round((completedTasks.length / (tasks.length || 1)) * 100)}%</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">Completion Rate</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}