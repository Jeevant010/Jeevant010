import { getLearning, addLearning } from "@/lib/actions/learning.actions";
import { Terminal, Code, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LearningMatrix() {
  const items = await getLearning();

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono relative overflow-hidden -m-8">
      
      {/* Matrix Rain Effect (Simple CSS Simulation) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-green-900 pb-4">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-green-500 animate-pulse" />
            Knowledge Upload
          </h1>
          <p className="text-green-700 mt-2">// DOWNLOADING_SKILLSETS...</p>
        </div>

        {/* Add New Upload Form */}
        <form action={addLearning} className="bg-green-900/10 border border-green-500/30 p-6 mb-12 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-green-700 uppercase">Skill / Course Name</label>
            <input name="title" required className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Total Modules</label>
             <input name="totalModules" type="number" required className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Completed</label>
             <input name="completedModules" type="number" required className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <button className="bg-green-600 text-black font-bold px-6 py-2 hover:bg-green-500 transition">
            INITIATE
          </button>
        </form>

        {/* The Grid */}
        <div className="grid gap-4">
          {items.map((item: any) => {
             const progress = Math.round((item.completedModules / item.totalModules) * 100);
             return (
               <div key={item._id} className="bg-black border border-green-900 p-4 flex items-center gap-6 hover:border-green-500 transition group">
                 <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 group-hover:text-white">
                   <Code className="w-6 h-6" />
                 </div>
                 
                 <div className="flex-1">
                   <div className="flex justify-between mb-1">
                     <h3 className="font-bold text-lg text-white group-hover:text-green-300">{item.title}</h3>
                     <span className="font-mono text-green-600">{progress}%</span>
                   </div>
                   {/* Progress Bar */}
                   <div className="h-2 bg-green-900/30 w-full">
                     <div className="h-full bg-green-500 shadow-[0_0_10px_lime]" style={{ width: `${progress}%` }} />
                   </div>
                 </div>

                 <div className="text-right hidden md:block">
                    <div className="text-xs text-green-800 uppercase">Status</div>
                    <div className="font-bold text-green-400 uppercase tracking-widest">
                      {progress === 100 ? "UPLOAD COMPLETE" : "DOWNLOADING..."}
                    </div>
                 </div>
               </div>
             )
          })}
        </div>

      </div>
    </div>
  );
}