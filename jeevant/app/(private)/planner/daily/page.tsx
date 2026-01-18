import { getDailyTasks, createTask } from "@/lib/actions/task.actions";
import TaskItem from "@/components/features/TaskItem";
import { Calendar, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DailyPlanner() {
  const tasks = await getDailyTasks();
  
  // Separate tasks for the UI
  const pendingTasks = tasks.filter((t: any) => !t.isCompleted);
  const completedTasks = tasks.filter((t: any) => t.isCompleted);

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between glass-card p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" /> 
            War Room
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* LEFT: Task Input & List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Form */}
          <form action={createTask} className="flex gap-2">
            <input 
              name="title"
              required
              placeholder="What needs to be done today?" 
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
            <button title="plus" type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold transition">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Task Lists */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tasks ({pendingTasks.length})</h3>
            {pendingTasks.length === 0 && <p className="text-slate-600 text-sm italic">All caught up!</p>}
            {pendingTasks.map((t: any) => (
              <TaskItem key={t._id} task={t} />
            ))}
          </div>

          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</h3>
              {completedTasks.map((t: any) => (
                <TaskItem key={t._id} task={t} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Time Blocking (Visual Only for now) */}
        <div className="glass-card rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Time Blocks</h3>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="p-3 bg-purple-500/10 border-l-2 border-purple-500 rounded">
              <span className="block font-bold text-purple-400">09:00 - 11:00</span>
              Deep Work (Coding)
            </div>
            <div className="p-3 bg-blue-500/10 border-l-2 border-blue-500 rounded">
              <span className="block font-bold text-blue-400">14:00 - 15:00</span>
              Meetings / Sync
            </div>
            <p className="text-xs italic text-slate-600 mt-4">
              * This section will be connected to the task list in the next update.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}