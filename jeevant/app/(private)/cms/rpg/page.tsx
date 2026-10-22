import { addExperience, addAchievement, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { QuestList, LootList } from "@/components/features/AdminRPGLists";
import { AddQuestForm } from "@/components/features/AddQuestForm";
import { AddLootForm } from "@/components/features/AddLootForm";
import { Sword, Shield, Scroll, Save } from "lucide-react";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function GameMasterConsole() {
  const { quests, loot } = await getCharacterSheet();

  return (
    <PrivateShell
      eyebrow="Character stats & history"
      title="Game Master Console"
      description="Edit quests and loot — the same data the public timeline reads."
      accent="amber"
      icon={<Scroll className="h-6 w-6 text-amber-400" />}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* COLUMN 1: QUESTS (Experience) */}
        <div>
          {/* FORM 1: ADD QUEST */}
          <div className="bg-[#231f1b] border-2 border-[#4a3c30] p-8 rounded-xl shadow-2xl relative mb-8">
            <div className="absolute -top-4 left-8 bg-[#1a1510] px-4 text-xl font-bold text-yellow-500 flex items-center gap-2 border border-[#4a3c30]">
               <Sword className="w-5 h-5" /> New Quest Log
            </div>
            <div className="mt-6">
              <AddQuestForm />
            </div>
          </div>

          <QuestList quests={quests} />
        </div>

        {/* COLUMN 2: LOOT (Achievement) */}
        <div>
          {/* FORM 2: ADD LOOT */}
          <AddLootForm />

          <LootList loot={loot} />
        </div>

      </div>
    </PrivateShell>
  );
}