import { addExperience, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Route, BriefcaseBusiness } from "lucide-react";
import { AddQuestForm } from "@/components/features/AddQuestForm";
import { QuestList } from "@/components/features/AdminRPGLists";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function JourneyCMS() {
  const { quests } = await getCharacterSheet();

  return (
    <PrivateShell
      eyebrow="Experience · timeline · responsibilities"
      title="Journey Editor"
      description="The roles and milestones that feed the public timeline."
      accent="blue"
      icon={<Route className="h-6 w-6 text-blue-400" />}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AddQuestForm />

        <div className="space-y-4">
          <div className="panel-cyber p-6">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Timeline Items</h3>
            <div className="space-y-4">
              <QuestList quests={quests} />
            </div>
          </div>
        </div>
      </div>
    </PrivateShell>
  );
}
