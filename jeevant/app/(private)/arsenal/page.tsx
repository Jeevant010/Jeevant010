import { getSnippets, addSnippet } from "@/lib/actions/snippet.actions";
import { Box, Plus } from "lucide-react";
import { ArsenalSortableGrid } from "@/components/features/ArsenalSortableGrid";
import AddSnippetForm from "@/components/features/AddSnippetForm";

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
      <AddSnippetForm />

      {/* STATS BAR */}
      <div className="relative z-10 flex gap-4 mb-8">
        <div className="bg-[#2a2520] border-2 border-[#50453b] p-3 text-center min-w-[120px]">
          <div className="text-[10px] uppercase font-bold text-[#8a7560]">Total Items</div>
          <div className="text-xl font-bold text-[#e0d0c0]">{snippets.length}</div>
        </div>
        <div className="bg-[#2a2520] border-2 border-[#50453b] p-3 text-center min-w-[120px]">
          <div className="text-[10px] uppercase font-bold text-[#8a7560]">High Complexity</div>
          <div className="text-xl font-bold text-red-500">{snippets.filter((s:any) => s.complexity === 'high').length}</div>
        </div>
        <div className="bg-[#2a2520] border-2 border-[#50453b] p-3 text-center min-w-[120px]">
          <div className="text-[10px] uppercase font-bold text-[#8a7560]">Ready (Not Deprecated)</div>
          <div className="text-xl font-bold text-green-500">{snippets.filter((s:any) => !s.isDeprecated).length}</div>
        </div>
      </div>

      {/* The Inventory Grid */}
      <ArsenalSortableGrid initialItems={snippets} />
    </div>
  );
}