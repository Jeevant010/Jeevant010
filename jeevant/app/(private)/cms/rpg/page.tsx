import { addExperience, addAchievement } from "@/lib/actions/rpg.actions";
import { Sword, Shield, Scroll, Save } from "lucide-react";

export default function GameMasterConsole() {
  return (
    <div className="min-h-screen bg-[#1a1510] text-[#a89c8a] p-8 font-serif relative overflow-hidden -m-8">
      
      {/* HEADER */}
      <div className="mb-12 border-b border-[#4a3c30] pb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#2a2420] border-2 border-yellow-600 rounded flex items-center justify-center">
           <Scroll className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
           <h1 className="text-4xl font-black text-[#e8dcc5] uppercase tracking-tighter">Game Master Console</h1>
           <p className="text-[#8a7045] font-bold mt-1">Modify Character Stats & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* FORM 1: ADD QUEST (Experience) */}
        <div className="bg-[#231f1b] border-2 border-[#4a3c30] p-8 rounded-xl shadow-2xl relative">
          <div className="absolute -top-4 left-8 bg-[#1a1510] px-4 text-xl font-bold text-yellow-500 flex items-center gap-2 border border-[#4a3c30]">
             <Sword className="w-5 h-5" /> New Quest Log
          </div>

          <form action={addExperience} className="space-y-6 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Role Class</label>
              <input name="role" placeholder="e.g. Frontend Wizard" required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-yellow-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Guild / Company</label>
              <input name="company" placeholder="e.g. Google" required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-yellow-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Quest Description</label>
              <textarea name="description" placeholder="Describe your feats..." required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 h-32 focus:border-yellow-600 outline-none resize-none" />
            </div>
            <button className="w-full bg-yellow-900/20 border border-yellow-600 text-yellow-500 font-bold py-3 hover:bg-yellow-600 hover:text-black transition uppercase tracking-widest flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Quest
            </button>
          </form>
        </div>

        {/* FORM 2: ADD LOOT (Achievement) */}
        <div className="bg-[#231f1b] border-2 border-[#4a3c30] p-8 rounded-xl shadow-2xl relative">
          <div className="absolute -top-4 left-8 bg-[#1a1510] px-4 text-xl font-bold text-blue-400 flex items-center gap-2 border border-[#4a3c30]">
             <Shield className="w-5 h-5" /> Add Loot / Achievement
          </div>

          <form action={addAchievement} className="space-y-6 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Achievement Name</label>
              <input name="title" placeholder="e.g. Hackathon Winner" required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Platform / Source</label>
              <input name="platform" placeholder="e.g. Devfolio" required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Details</label>
              <textarea name="description" placeholder="Details of the loot..." required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 h-32 focus:border-blue-500 outline-none resize-none" />
            </div>
            <button className="w-full bg-blue-900/20 border border-blue-500 text-blue-400 font-bold py-3 hover:bg-blue-500 hover:text-black transition uppercase tracking-widest flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Stash Loot
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}