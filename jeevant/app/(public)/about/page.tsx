import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { 
  Sword, 
  Shield, 
  Scroll, 
  Crown, 
  Map, 
  Star,
  Zap,
  Gem 
} from "lucide-react";

// Ensure page updates when data changes
export const dynamic = "force-dynamic";

export default async function AboutRPG() {
  // FETCH REAL DATA
  const { quests, loot } = await getCharacterSheet();

  return (
    <div className="min-h-screen bg-[#1e1b18] text-[#d4c5a3] p-8 font-serif relative overflow-hidden -m-8">
      
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,50,20,0.5),rgba(20,10,5,1))] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_20px_gold]" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
        
        {/* --- LEFT: HERO CARD --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#2a2420] border-4 border-[#8a7045] rounded-xl p-2 shadow-2xl relative group">
            {/* Corner Ornaments */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-500" />
            
            {/* Avatar */}
            <div className="aspect-[3/4] bg-[#151210] rounded-lg border border-[#4a3c30] flex items-center justify-center relative overflow-hidden">
               {/* Replace this URL with your actual photo URL later */}
               <div className="absolute inset-0 bg-[url('https://github.com/Jeevant010.png')] bg-cover bg-center opacity-90 group-hover:scale-105 transition duration-700" />
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent h-24" />
               <div className="absolute bottom-4 left-4">
                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest text-shadow-sm">Jeevant</h2>
                 <p className="text-yellow-500 text-xs font-bold uppercase">Lvl 21 Technomancer</p>
               </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 space-y-3 px-2">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Sword className="w-4 h-4" /> ATK (Code)</span>
                <span className="text-yellow-400">1525 (LeetCode)</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Shield className="w-4 h-4" /> DEF (Debug)</span>
                <span className="text-green-400">MAX</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Zap className="w-4 h-4" /> MANA (Creativity)</span>
                <span className="text-blue-400">Infinite</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: QUESTS & LOOT --- */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Header */}
          <div className="border-b-2 border-[#4a3c30] pb-4 flex justify-between items-end">
            <div>
               <h1 className="text-5xl font-black text-[#e8dcc5] uppercase tracking-tighter" style={{ textShadow: "2px 2px 0px #000" }}>
                 Character Sheet
               </h1>
               <p className="text-[#8a7045] font-bold mt-2 font-mono">// CLASS: MERN_ARCHMAGE // SPECIALTY: AI_SUMMONING</p>
            </div>
            <div className="hidden md:block">
              <Crown className="w-12 h-12 text-yellow-600 opacity-50" />
            </div>
          </div>

          {/* DYNAMIC LOOT (Achievements) */}
          <div className="bg-[#231f1b] p-6 rounded-xl border border-[#4a3c30] shadow-inner">
             <h3 className="text-xl font-bold text-[#d4c5a3] mb-6 flex items-center gap-3">
               <div className="w-8 h-8 bg-[#3a3028] rounded flex items-center justify-center border border-[#5a4a3a]">
                 <Star className="w-4 h-4 text-yellow-500" />
               </div>
               Rare Loot (Achievements)
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {loot.length === 0 ? (
                 <div className="col-span-full text-center py-4 text-[#5a4a3a] italic">No loot collected yet.</div>
               ) : (
                 loot.map((item: any) => (
                   <div key={item._id} className="bg-[#1a1816] p-4 rounded border border-[#3a3028] flex items-start gap-4 hover:border-yellow-600 transition group">
                     <div className="w-10 h-10 rounded bg-[#0f0e0d] flex items-center justify-center text-yellow-400 group-hover:scale-110 transition shrink-0">
                       <Gem className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="text-sm font-bold text-[#e8dcc5]">{item.title}</div>
                       <div className="text-[10px] uppercase font-bold text-[#5a4a3a] mb-1">{item.platform}</div>
                       <p className="text-xs text-[#8a7045] leading-tight">{item.description}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* DYNAMIC QUESTS (Experience) */}
          <div className="space-y-4">
             <h3 className="text-xl font-bold text-[#d4c5a3] mb-2 flex items-center gap-3">
               <div className="w-8 h-8 bg-[#3a3028] rounded flex items-center justify-center border border-[#5a4a3a]">
                 <Map className="w-4 h-4 text-green-600" />
               </div>
               Quest History (Experience)
             </h3>

             <div className="relative pl-8 border-l-2 border-[#4a3c30] space-y-8">
               {quests.length === 0 ? (
                 <div className="py-4 text-[#5a4a3a] italic">No quests recorded in the archives.</div>
               ) : (
                 quests.map((quest: any) => (
                   <div key={quest._id} className="relative group">
                     {/* Timeline Node */}
                     <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-[#1e1b18] border-2 border-yellow-600 flex items-center justify-center">
                       <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                     </div>
                     
                     {/* Card */}
                     <div className="bg-[#2a2420] p-6 rounded-lg border border-[#4a3c30] hover:border-yellow-600/50 transition">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-white">{quest.role}</h4>
                          <span className="text-xs font-bold bg-[#3a3028] px-2 py-1 rounded text-yellow-500">
                             {/* You can add logic here: if endDate is null then 'Active' else 'Complete' */}
                             Completed
                          </span>
                        </div>
                        <p className="text-[#8a7045] text-sm font-bold mb-2 uppercase tracking-wide">{quest.company}</p>
                        <p className="text-[#a89c8a] text-sm leading-relaxed font-serif italic">
                          "{quest.description}"
                        </p>
                     </div>
                   </div>
                 ))
               )}
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}