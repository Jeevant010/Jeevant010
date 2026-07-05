import { getLearning, addLearning, deleteLearning, incrementLearning } from "@/lib/actions/learning.actions";
import { LearningSortableList } from "@/components/features/LearningSortableList";
import { Terminal, Code, Check, Trash2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LearningMatrix() {
  const items = await getLearning();

  return (
    <div className="min-h-screen bg-shell-bg text-green-500 p-8 font-mono relative overflow-hidden -m-8">
      
      {/* Matrix Rain Effect (Simple CSS Simulation) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-green-900 pb-4">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-shell-text flex items-center gap-3">
            <Terminal className="w-8 h-8 text-green-500 animate-pulse" />
            Knowledge Upload
          </h1>
          <p className="text-green-700 mt-2">// DOWNLOADING_SKILLSETS...</p>
        </div>

        {/* Add New Upload Form */}
        <form action={addLearning} className="bg-green-900/10 border border-green-500/30 p-6 mb-12 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-green-700 uppercase">Skill / Course Name</label>
            <input name="title" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Total Modules</label>
             <input name="totalModules" type="number" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Completed</label>
             <input name="completedModules" type="number" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <button className="bg-green-600 text-black font-bold px-6 py-2 hover:bg-green-500 transition">
            INITIATE
          </button>
        </form>

        {/* The Grid */}
        <LearningSortableList initialItems={items} />

      </div>
    </div>
  );
}