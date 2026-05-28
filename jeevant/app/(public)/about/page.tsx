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
    <div className="min-h-screen bg-[#070504] text-[#d4c5a3] p-4 sm:p-8 font-serif relative overflow-hidden sm:-m-8">
      
      {/* --- ATMOSPHERIC FX (Alan Wake / Elden Ring) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,100,20,0.15),rgba(10,5,5,1))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent shadow-[0_0_30px_rgba(217,119,6,0.8)]" />

      {/* Fog Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 sm:pt-12">
        
        {/* --- LEFT: HERO CARD --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#110e0c]/80 backdrop-blur-md border border-[#3a2c1f] rounded p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group">
            {/* Corner Ornaments */}
            <div className="absolute -top-1 -left-1 w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-l-2 border-yellow-600/50" />
            <div className="absolute -bottom-1 -right-1 w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-r-2 border-yellow-600/50" />
            
            {/* Avatar */}
            <div className="aspect-[3/4] w-full max-w-[280px] sm:max-w-full mx-auto bg-[#0a0807] rounded-sm border border-[#2a1c12] flex items-center justify-center relative overflow-hidden">
               {/* Replace this URL with your actual photo URL later */}
               <div className="absolute inset-0 bg-[url('https://github.com/Jeevant010.png')] bg-cover bg-center opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0" />
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#070504] via-[#070504]/80 to-transparent h-32" />
               <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
                 <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,1)]">Jeevant</h2>
                 <p className="text-yellow-600 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mt-1">Lvl 21 Technomancer</p>
               </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 space-y-4 px-4 pb-4">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-[#2a1c12] pb-2">
                <span className="flex items-center gap-2 text-[#8a7045] uppercase tracking-widest"><Sword className="w-4 h-4 text-red-900" /> ATK</span>
                <span className="text-red-500 font-mono drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">1525 (LC)</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-[#2a1c12] pb-2">
                <span className="flex items-center gap-2 text-[#8a7045] uppercase tracking-widest"><Shield className="w-4 h-4 text-emerald-900" /> DEF</span>
                <span className="text-emerald-500 font-mono drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">MAX</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-[#2a1c12] pb-2">
                <span className="flex items-center gap-2 text-[#8a7045] uppercase tracking-widest"><Zap className="w-4 h-4 text-blue-900" /> MANA</span>
                <span className="text-blue-500 font-mono drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Infinite</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: QUESTS & LOOT --- */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header */}
          <div className="border-b border-[#2a1c12] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative">
            <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-yellow-600/50 shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
            <div>
               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#e8dcc5] uppercase tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
                 Character Sheet
               </h1>
               <p className="text-[#8a7045] font-bold mt-2 font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase">
                 // CLASS: MERN_ARCHMAGE // SPECIALTY: AI_SUMMONING
               </p>
            </div>
            <div className="hidden md:block">
              <Crown className="w-12 h-12 text-yellow-600/20 drop-shadow-[0_0_15px_rgba(217,119,6,0.2)]" />
            </div>
          </div>

          {/* DYNAMIC LOOT (Achievements) */}
          <div className="bg-[#0a0807]/80 backdrop-blur-sm p-6 sm:p-8 rounded border border-[#2a1c12] relative group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-600/5 blur-[30px] group-hover:bg-yellow-600/10 transition-colors" />
             <h3 className="text-lg sm:text-xl font-bold text-[#d4c5a3] mb-6 flex items-center gap-3 uppercase tracking-widest">
               <div className="w-8 h-8 bg-[#110e0c] rounded flex items-center justify-center border border-[#3a2c1f]">
                 <Star className="w-4 h-4 text-yellow-600" />
               </div>
               Acquired Relics
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {loot.length === 0 ? (
                 <div className="col-span-full text-center py-8 text-[#5a4a3a] italic font-serif">No relics acquired yet.</div>
               ) : (
                 loot.map((item: any) => (
                   <div key={item._id} className="bg-[#110e0c] p-4 sm:p-5 rounded border border-[#2a1c12] flex items-start gap-4 hover:border-yellow-600/30 transition group/item relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                     <div className="w-10 h-10 rounded bg-[#070504] border border-[#2a1c12] flex items-center justify-center text-yellow-600/50 group-hover/item:text-yellow-600 group-hover/item:border-yellow-600/30 transition shrink-0 relative z-10">
                       <Gem className="w-5 h-5" />
                     </div>
                     <div className="relative z-10">
                       <div className="text-[10px] uppercase font-bold text-[#8a7045] mb-1 tracking-widest">{item.platform}</div>
                       <div className="text-sm sm:text-base font-bold text-[#e8dcc5]">{item.title}</div>
                       <p className="text-xs text-[#5a4a3a] mt-2 leading-relaxed font-serif italic line-clamp-3 group-hover/item:text-[#8a7045] transition-colors">{item.description}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* DYNAMIC QUESTS (Experience) */}
          <div className="space-y-6">
             <h3 className="text-lg sm:text-xl font-bold text-[#d4c5a3] flex items-center gap-3 uppercase tracking-widest">
               <div className="w-8 h-8 bg-[#110e0c] rounded flex items-center justify-center border border-[#3a2c1f]">
                 <Scroll className="w-4 h-4 text-[#8a7045]" />
               </div>
               Quest Logs
             </h3>

             <div className="relative pl-6 sm:pl-10 space-y-8 sm:space-y-12 before:absolute before:inset-0 before:left-3 sm:before:left-5 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-yellow-600/50 before:via-[#2a1c12] before:to-transparent">
               {quests.length === 0 ? (
                 <div className="py-8 text-[#5a4a3a] italic font-serif text-center">No quests recorded in the archives.</div>
               ) : (
                 quests.map((quest: any) => (
                   <div key={quest._id} className="relative group">
                     {/* Timeline Node */}
                     <div className="absolute -left-[30px] sm:-left-[46px] top-4 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-[#070504] border border-yellow-600/50 flex items-center justify-center shadow-[0_0_10px_rgba(217,119,6,0.5)] z-10">
                       <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-600 rounded-full" />
                     </div>
                     
                     {/* Card */}
                     <div className="bg-[#110e0c]/80 backdrop-blur-md p-6 sm:p-8 rounded border border-[#2a1c12] hover:border-yellow-600/30 transition relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <Sword className="w-16 h-16 text-yellow-600" />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 relative z-10">
                          <div>
                             <h4 className="text-xl sm:text-2xl font-black text-[#e8dcc5]">{quest.role}</h4>
                             <p className="text-yellow-600/80 text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-widest">Guild: {quest.company}</p>
                          </div>
                          <span className="text-[10px] font-bold border border-[#2a1c12] bg-[#070504] px-3 py-1 text-[#8a7045] uppercase tracking-widest shadow-inner">
                             {quest.endDate ? 'COMPLETED' : 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-[#a89c8a] text-sm leading-relaxed font-serif italic relative z-10">
                          {quest.description}
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