import { clearPastScheduleEntries, getSchedules } from "@/lib/actions/schedule.actions";
import { getDailyTasks } from "@/lib/actions/task.actions";
import AddScheduleForm from "@/components/features/AddScheduleForm";
import AdminCalendar from "@/components/features/AdminCalendar";
import { PlannerSortableList } from "@/components/features/PlannerSortableList";
import { Calendar, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScheduleCMS() {
  const items = await getSchedules();
  const tasks = await getDailyTasks();
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const completedTasks = tasks.filter((t: any) => t.isCompleted);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-shell-text uppercase tracking-tight flex items-center gap-3"><Calendar className="w-8 h-8 text-green-500" /> Schedule</h1>
          <p className="text-shell-muted text-xs tracking-widest mt-1">// ACCESS LEVEL: ADMIN // Database: SCHEDULE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Calendar / Schedule Side */}
        <div className="xl:col-span-2">
          <div className="mb-8">
            <AddScheduleForm />
          </div>

          <div className="mb-4 flex justify-end">
            <form action={clearPastScheduleEntries}>
              <button className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-shell-muted hover:border-amber-500 hover:text-amber-300">
                Clear past events
              </button>
            </form>
          </div>

          <AdminCalendar schedules={items as any[]} />
        </div>

        {/* Daily Agenda Side */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-[#151515] p-6 border border-white/5">
            <h3 className="text-xl font-bold text-red-500 uppercase flex items-center gap-2 border-b border-shell-border pb-4 mb-4">
              <CheckSquare className="w-5 h-5" /> Active Deadlines
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-shell-muted uppercase tracking-[0.2em] mb-2">Pending ({pendingTasks.length})</h4>
                <PlannerSortableList initialItems={pendingTasks} />
              </div>
              
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-[0.2em] mb-2">Completed</h4>
                  <div className="opacity-50">
                    <PlannerSortableList initialItems={completedTasks} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
