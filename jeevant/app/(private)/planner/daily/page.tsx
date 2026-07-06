import { getDailyTasks, createTask } from "@/lib/actions/task.actions";
import { PlannerSortableList } from "@/components/features/PlannerSortableList";
import { AddTaskForm } from "@/components/features/AddTaskForm";
import { Calendar, Plus, Crosshair, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DailyPlanner() {
  const tasks = await getDailyTasks();
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const completedTasks = tasks.filter((t: any) => t.isCompleted);

  return (
    <div className="min-h-screen bg-[#111] text-shell-muted p-8 font-mono -m-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-shell-border pb-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-shell-text uppercase tracking-tighter flex items-center gap-4">
            <Crosshair className="w-8 h-8 text-red-600" />
            Tactical Log
          </h1>
          <p className="text-shell-muted mt-2 text-sm tracking-widest">
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
          <AddTaskForm />

          {/* Pending Objectives */}
          <div>
            <h3 className="text-xs font-bold text-shell-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Pending Objectives ({pendingTasks.length})
            </h3>
            
            <PlannerSortableList initialItems={pendingTasks} />
          </div>

          {/* Completed Log */}
          {completedTasks.length > 0 && (
            <div className="opacity-60 hover:opacity-100 transition duration-500">
               <h3 className="text-xs font-bold text-shell-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-900 rounded-full" /> Mission History
              </h3>
               <div className="space-y-0 border border-slate-800 bg-[#0a0a0a]">
                <PlannerSortableList initialItems={completedTasks} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: STRATEGY SIDEBAR */}
        <div className="border-l border-white/5 pl-8 hidden lg:block">
          <div className="sticky top-8 space-y-8">
            <div className="bg-[#151515] p-6 border border-white/5">
              <h3 className="text-shell-text font-bold uppercase mb-4 border-b border-shell-border pb-2">Protocol</h3>
              <ul className="space-y-3 text-sm text-shell-muted font-mono">
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
              <div className="text-4xl font-black text-shell-text mb-1">{Math.round((completedTasks.length / (tasks.length || 1)) * 100)}%</div>
              <div className="text-xs text-shell-muted uppercase tracking-widest">Completion Rate</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}