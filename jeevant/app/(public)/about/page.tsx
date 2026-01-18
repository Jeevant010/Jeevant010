import { 
  Sword, 
  Shield, 
  Scroll, 
  Crown, 
  Map, 
  Star,
  Zap 
} from "lucide-react";

export default function AboutRPG() {
  return (
    <div className="min-h-screen bg-[#1e1b18] text-[#d4c5a3] p-8 font-serif relative overflow-hidden -m-8">
      
      {/* --- BACKGROUND TEXTURES (Wood & Magic) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,50,20,0.5),rgba(20,10,5,1))] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_20px_gold]" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
        
        {/* --- LEFT: AVATAR CARD --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#2a2420] border-4 border-[#8a7045] rounded-xl p-2 shadow-2xl relative group">
            {/* Corner Ornaments */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-500" />
            
            {/* Profile Image Area */}
            <div className="aspect-[3/4] bg-[#151210] rounded-lg border border-[#4a3c30] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://github.com/Jeevant010.png')] bg-cover bg-center opacity-90 group-hover:scale-105 transition duration-700" />
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent h-24" />
               <div className="absolute bottom-4 left-4">
                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest text-shadow-sm">Jeevant</h2>
                 <p className="text-yellow-500 text-xs font-bold uppercase">Lvl 3 Full-Stack Wizard</p>
               </div>
            </div>
            
            {/* Base Stats */}
            <div className="mt-4 space-y-3 px-2">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Sword className="w-4 h-4" /> ATK (Code)</span>
                <span className="text-yellow-400">1525 (LeetCode)</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Shield className="w-4 h-4" /> DEF (Debug)</span>
                <span className="text-green-400">High</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-[#a89c8a]"><Zap className="w-4 h-4" /> MANA (Creativity)</span>
                <span className="text-blue-400">Infinite</span>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <button className="w-full py-4 bg-gradient-to-b from-yellow-700 to-yellow-900 border-2 border-yellow-500 rounded-lg text-white font-bold uppercase tracking-widest hover:scale-105 transition shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2">
            <Scroll className="w-5 h-5" /> Summon (Contact)
          </button>
        </div>

        {/* --- RIGHT: QUEST LOG & INVENTORY --- */}
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

          {/* Inventory (Tech Stack) */}
          <div className="bg-[#231f1b] p-6 rounded-xl border border-[#4a3c30] shadow-inner">
             <h3 className="text-xl font-bold text-[#d4c5a3] mb-6 flex items-center gap-3">
               <div className="w-8 h-8 bg-[#3a3028] rounded flex items-center justify-center border border-[#5a4a3a]">
                 <Star className="w-4 h-4 text-yellow-500" />
               </div>
               Skill Inventory (Tech Stack)
             </h3>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { name: "React Blade", rarity: "Legendary", color: "text-blue-400" },
                 { name: "Next.js Armor", rarity: "Epic", color: "text-white" },
                 { name: "Python Scroll", rarity: "Epic", color: "text-yellow-400" },
                 { name: "Mongo Vault", rarity: "Rare", color: "text-green-500" },
                 { name: "Tailwind Cloak", rarity: "Rare", color: "text-cyan-400" },
                 { name: "Docker Chest", rarity: "Uncommon", color: "text-blue-600" },
               ].map((item, i) => (
                 <div key={i} className="bg-[#1a1816] p-3 rounded border border-[#3a3028] flex items-center gap-3 hover:border-yellow-600 transition cursor-pointer group">
                   <div className={`w-10 h-10 rounded bg-[#0f0e0d] flex items-center justify-center ${item.color} group-hover:scale-110 transition`}>
                     <Zap className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="text-sm font-bold text-[#e8dcc5]">{item.name}</div>
                     <div className="text-[10px] uppercase font-bold text-[#5a4a3a]">{item.rarity}</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Quest Log (Experience) */}
          <div className="space-y-4">
             <h3 className="text-xl font-bold text-[#d4c5a3] mb-2 flex items-center gap-3">
               <div className="w-8 h-8 bg-[#3a3028] rounded flex items-center justify-center border border-[#5a4a3a]">
                 <Map className="w-4 h-4 text-green-600" />
               </div>
               Quest History (Experience)
             </h3>

             {/* Quest Item 1 */}
             <div className="relative pl-8 border-l-2 border-[#4a3c30] space-y-8">
               <div className="relative group">
                 <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-[#1e1b18] border-2 border-yellow-600 flex items-center justify-center">
                   <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                 </div>
                 <div className="bg-[#2a2420] p-6 rounded-lg border border-[#4a3c30] hover:border-yellow-600/50 transition">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-white">Virtual Intern</h4>
                      <span className="text-xs font-bold bg-[#3a3028] px-2 py-1 rounded text-yellow-500">Active Quest</span>
                    </div>
                    <p className="text-[#8a7045] text-sm font-bold mb-2">AICTE - SmartBridge - ServiceNow</p>
                    <p className="text-[#a89c8a] text-sm leading-relaxed">
                      Crafting workflows on the ServiceNow realm. Developing catalog items and mastering Glide scripting arts.
                    </p>
                 </div>
               </div>

               {/* Quest Item 2 */}
               <div className="relative group">
                 <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-[#1e1b18] border-2 border-[#5a4a3a] flex items-center justify-center">
                   <div className="w-2 h-2 bg-[#5a4a3a] rounded-full" />
                 </div>
                 <div className="bg-[#2a2420] p-6 rounded-lg border border-[#4a3c30] hover:border-yellow-600/50 transition opacity-80 hover:opacity-100">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-white">Guild Leader (Member)</h4>
                      <span className="text-xs font-bold bg-[#3a3028] px-2 py-1 rounded text-[#8a7045]">Completed</span>
                    </div>
                    <p className="text-[#8a7045] text-sm font-bold mb-2">Google Developer Groups (GDG)</p>
                    <p className="text-[#a89c8a] text-sm leading-relaxed">
                      Mentoring junior apprentices. Evaluating strength in DSA and ML combat.
                    </p>
                 </div>
               </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}