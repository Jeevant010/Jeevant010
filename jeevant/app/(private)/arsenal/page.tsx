import { getSnippets, addSnippet } from "@/lib/actions/snippet.actions";
import { Box, Plus } from "lucide-react";
import { ArsenalSortableGrid } from "@/components/features/ArsenalSortableGrid";
import AddSnippetForm from "@/components/features/AddSnippetForm";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function ArsenalPage() {
  const snippets = await getSnippets();

  return (
    <PrivateShell
      eyebrow="Snippet vault"
      title="The Arsenal"
      description="Reusable code, tested versions, and the notes that matter."
      accent="amber"
      icon={<Box className="h-6 w-6 text-amber-400" />}
      actions={
        <div className="stat-chip text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-shell-muted">Capacity</div>
          <div className="text-xl font-black text-amber-300">{snippets.length} / 100</div>
        </div>
      }
    >
      <AddSnippetForm />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="stat-chip">
          <div className="text-[10px] uppercase font-bold tracking-widest text-shell-muted">Total Items</div>
          <div className="mt-1 text-xl font-bold text-shell-text">{snippets.length}</div>
        </div>
        <div className="stat-chip">
          <div className="text-[10px] uppercase font-bold tracking-widest text-shell-muted">High Complexity</div>
          <div className="mt-1 text-xl font-bold text-red-400">{snippets.filter((s:any) => s.complexity === 'high').length}</div>
        </div>
        <div className="stat-chip">
          <div className="text-[10px] uppercase font-bold tracking-widest text-shell-muted">Ready (Not Deprecated)</div>
          <div className="mt-1 text-xl font-bold text-green-400">{snippets.filter((s:any) => !s.isDeprecated).length}</div>
        </div>
      </div>

      <ArsenalSortableGrid initialItems={snippets} />
    </PrivateShell>
  );
}