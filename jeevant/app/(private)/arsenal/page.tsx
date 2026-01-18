import { getSnippets, addSnippet } from "@/lib/actions/snippet.actions";
import { Box, Copy, Terminal, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArsenalPage() {
  const snippets = await getSnippets();

  return (
    <div className="min-h-screen bg-[#1a1816] text-[#b0a090] p-8 font-sans -m-8 relative">
      
      {/* Background Grid Pattern (RE4 Style) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(80,70,60,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(80,70,60,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-end mb-12 border-b-4 border-[#50453b] pb-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-[#e0d0c0] flex items-center gap-4">
          <Box className="w-12 h-12 text-[#8a7560]" />
          The Arsenal
        </h1>
        <div className="text-right">
          <div className="text-xs font-bold uppercase text-[#8a7560]">Capacity</div>
          <div className="text-2xl font-bold text-[#e0d0c0]">{snippets.length} / 100</div>
        </div>
      </div>

      {/* Add New Item (Hidden Drawer Style) */}
      <div className="relative z-10 mb-12 bg-[#2a2520] border-2 border-[#50453b] p-6 shadow-2xl max-w-2xl">
        <h3 className="text-[#e0d0c0] font-bold uppercase mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" /> Craft New Item
        </h3>
        <form action={addSnippet} className="space-y-4">
          <div className="flex gap-4">
             <input name="title" placeholder="ITEM NAME (e.g. Auth Hook)" required className="flex-1 bg-[#1a1816] border border-[#50453b] p-3 text-white outline-none focus:border-green-600" />
             <input name="language" placeholder="TYPE (e.g. TSX)" required className="w-32 bg-[#1a1816] border border-[#50453b] p-3 text-white outline-none focus:border-green-600" />
          </div>
          <textarea name="code" placeholder="SOURCE CODE DATA..." required className="w-full h-32 bg-[#1a1816] border border-[#50453b] p-3 text-white font-mono text-sm outline-none focus:border-green-600 resize-none custom-scrollbar" />
          <input name="tags" placeholder="TAGS (comma separated)" className="w-full bg-[#1a1816] border border-[#50453b] p-3 text-white outline-none focus:border-green-600" />
          <button className="w-full py-3 bg-[#3a3530] border border-[#50453b] text-[#e0d0c0] font-bold uppercase hover:bg-green-800 hover:text-white transition">
            Store in Inventory
          </button>
        </form>
      </div>

      {/* The Inventory Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {snippets.map((item: any) => (
          <div key={item._id} className="group bg-[#221e1a] border-2 border-[#403530] hover:border-[#e0d0c0] transition-colors p-1 relative overflow-hidden h-64 flex flex-col">
            
            {/* Header */}
            <div className="bg-[#302822] p-2 flex justify-between items-center border-b border-[#403530]">
              <span className="font-bold text-[#e0d0c0] uppercase text-sm truncate">{item.title}</span>
              <span className="text-[10px] font-bold bg-[#1a1816] px-1 text-[#8a7560] border border-[#403530]">{item.language}</span>
            </div>

            {/* Code Preview */}
            <div className="flex-1 bg-[#100e0c] p-3 overflow-hidden relative">
               <pre className="text-[10px] font-mono text-green-500/80 leading-tight whitespace-pre-wrap break-all">
                 {item.code.substring(0, 300)}...
               </pre>
               <div className="absolute inset-0 bg-gradient-to-t from-[#100e0c] to-transparent" />
            </div>

            {/* Hover Overlay Action */}
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition">
                 <Copy className="w-6 h-6" />
               </button>
               <div className="text-white font-bold uppercase tracking-widest text-xs">Equip</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}