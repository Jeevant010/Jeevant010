import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  MoreVertical 
} from "lucide-react";

export default function DailyPlanner() {
  // This mimics your MongoDB 'Task' Schema structure
  const timeBlocks = [
    { time: "09:00", task: "Review PRs for EcoSort", type: "deep-work", color: "border-l-purple-500 bg-purple-500/10" },
    { time: "10:00", task: "Review PRs for EcoSort", type: "deep-work", color: "border-l-purple-500 bg-purple-500/10" },
    { time: "11:00", task: "Team Sync (Google Meet)", type: "meeting", color: "border-l-blue-500 bg-blue-500/10" },
    { time: "12:00", task: "Lunch / Break", type: "break", color: "border-l-slate-600 bg-slate-800/50" },
    { time: "13:00", task: "Integrate Stripe API", type: "dev", color: "border-l-green-500 bg-green-500/10" },
    { time: "14:00", task: "Integrate Stripe API", type: "dev", color: "border-l-green-500 bg-green-500/10" },
    { time: "15:00", task: null, type: "empty", color: "" },
    { time: "16:00", task: "LeetCode Grind (Graph DP)", type: "study", color: "border-l-yellow-500 bg-yellow-500/10" },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* --- HEADER (Date Navigation) --- */}
      <div className="flex items-center justify-between glass-card p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" /> 
            Today's Plan
          </h1>
          <span className="text-slate-500 text-sm border-l border-slate-700 pl-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button title="chevron" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition"><ChevronLeft className="w-5 h-5" /></button>
          <button className="px-3 py-1 bg-slate-800 text-sm text-white rounded-md">Today</button>
          <button title="chevron2" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* --- TIME BLOCKING GRID --- */}
      <div className="flex-1 glass-card rounded-xl p-6 overflow-hidden flex gap-6">
        
        {/* Time Slots Column */}
        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {timeBlocks.map((block, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-16 text-xs text-slate-500 pt-3 text-right font-mono">
                {block.time}
              </div>
              
              <div className={`flex-1 rounded-lg border-l-4 p-3 min-h-[60px] relative hover:brightness-110 transition cursor-pointer ${block.task ? block.color : 'border-l-slate-800 bg-slate-900/50 border-dashed border border-t-0 border-r-0 border-b-0'}`}>
                {block.task ? (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-slate-200">{block.task}</span>
                    <button title="verticle" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 h-full flex items-center justify-center">
                    <button className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full hover:text-white">
                      <Plus className="w-3 h-3" /> Book Slot
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Todo Sidebar */}
        <div className="w-80 border-l border-slate-800 pl-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Backlog</h3>
            <button className="text-blue-400 text-xs hover:underline">+ Add Task</button>
          </div>
          <div className="space-y-3">
            {["Fix Navbar Mobile View", "Email Professor about Thesis", "Renew Domain Name"].map((todo, i) => (
              <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:border-slate-600 cursor-grab active:cursor-grabbing">
                {todo}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}