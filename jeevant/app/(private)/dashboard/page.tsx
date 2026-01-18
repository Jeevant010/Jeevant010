import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search,
  Zap,
  Cpu,
  Database,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      
      {/* --- TOP BAR (Welcome & Quick Actions) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card rounded-2xl border-l-4 border-blue-500">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Good Morning, Jeevant <span className="animate-pulse text-blue-500">●</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">System operational. 4 tasks pending for today.</p>
        </div>
        <div className="flex gap-3">
          <button title="search" className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition border border-slate-700">
            <Search className="w-5 h-5" />
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition hover:scale-105">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* --- SYSTEM METRICS (The "OS" Feel) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Brain Load", val: "12%", icon: Cpu, color: "text-blue-400" },
          { label: "Goals Active", val: "3", icon: Zap, color: "text-yellow-400" },
          { label: "Memory Used", val: "1.2GB", icon: Database, color: "text-purple-400" },
          { label: "Streak", val: "12 Days", icon: Activity, color: "text-green-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
              <stat.icon className="w-12 h-12" />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <stat.icon className={`w-3 h-3 ${stat.color}`} /> {stat.label}
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Priority Tasks */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" /> Today's Priority
            </h3>
            <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">Daily Sprint</span>
          </div>
          
          <div className="space-y-3">
            {[
              { task: "Finish 'Projects' Page UI", tag: "Dev", time: "2h left", done: true },
              { task: "Review EcoSort API Logic", tag: "AI Agent", time: "4h left", done: false },
              { task: "LeetCode Daily Challenge", tag: "Growth", time: "8:00 PM", done: false },
            ].map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition group cursor-pointer ${t.done ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${t.done ? 'border-green-500 bg-green-500/20' : 'border-slate-500 group-hover:border-blue-500'}`}>
                    {t.done && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  </div>
                  <div>
                    <p className={`font-medium ${t.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{t.task}</p>
                    <span className="text-xs text-slate-500">{t.tag}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs bg-slate-950 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" /> {t.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Links / Status */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Active Stacks</h3>
          
          <div className="space-y-4">
            <div className="group cursor-pointer">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 group-hover:text-blue-400 transition">EcoSort AI</span>
                <span className="text-slate-500">85%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-blue-600 to-cyan-400"></div>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 group-hover:text-purple-400 transition">Portfolio OS</span>
                <span className="text-slate-500">40%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[40%] bg-gradient-to-r from-purple-600 to-pink-400"></div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="text-sm font-bold text-blue-300 mb-1">Idea Capture</h4>
            <p className="text-xs text-blue-200/60 mb-3">Found a new bug or feature idea?</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
              Log to Brain
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}