import { addAchievement, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Trophy } from "lucide-react";
import { AddLootForm } from "@/components/features/AddLootForm";
import { LootList } from "@/components/features/AdminRPGLists";

export const dynamic = "force-dynamic";

export default async function ExpertiseCMS() {
  const { loot } = await getCharacterSheet();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-amber-900/20 border-2 border-amber-500 rounded-full flex items-center justify-center">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Expertise Editor</h1>
          <p className="text-amber-500 text-xs tracking-widest mt-1">// ACHIEVEMENTS // CERTIFICATIONS // PROOF</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AddLootForm />

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Expertise Entries</h3>
            <div className="space-y-4">
              <LootList loot={loot} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
