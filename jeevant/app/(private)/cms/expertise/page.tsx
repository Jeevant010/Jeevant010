import { addAchievement, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Trophy } from "lucide-react";
import { AddLootForm } from "@/components/features/AddLootForm";
import { LootList } from "@/components/features/AdminRPGLists";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function ExpertiseCMS() {
  const { loot } = await getCharacterSheet();

  return (
    <PrivateShell
      eyebrow="Achievements · certifications · proof"
      title="Expertise Editor"
      description="Everything that backs the claims on the public profile."
      accent="amber"
      icon={<Trophy className="h-6 w-6 text-amber-400" />}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AddLootForm />

        <div className="space-y-4">
          <div className="panel-cyber p-6">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Expertise Entries</h3>
            <div className="space-y-4">
              <LootList loot={loot} />
            </div>
          </div>
        </div>
      </div>
    </PrivateShell>
  );
}
