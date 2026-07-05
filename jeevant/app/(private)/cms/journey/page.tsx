import { addExperience, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Route, BriefcaseBusiness } from "lucide-react";
import { AddQuestForm } from "@/components/features/AddQuestForm";
import { QuestList } from "@/components/features/AdminRPGLists";

export const dynamic = "force-dynamic";

export default async function JourneyCMS() {
  const { quests } = await getCharacterSheet();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-blue-900/20 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <Route className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Journey Editor</h1>
          <p className="text-blue-500 text-xs tracking-widest mt-1">// EXPERIENCE // TIMELINE // RESPONSIBILITIES</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AddQuestForm />

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Timeline Items</h3>
            <div className="space-y-4">
              <QuestList quests={quests} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
