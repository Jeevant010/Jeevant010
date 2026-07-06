import { addExperience, addAchievement, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { QuestList, LootList } from "@/components/features/AdminRPGLists";
import { AddQuestForm } from "@/components/features/AddQuestForm";
import { AddLootForm } from "@/components/features/AddLootForm";
import { Sword, Shield, Scroll, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GameMasterConsole() {
  const { quests, loot } = await getCharacterSheet();

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
    </div>
  );
}