import { getLearning, addLearning, deleteLearning, incrementLearning } from "@/lib/actions/learning.actions";
import { LearningSortableList } from "@/components/features/LearningSortableList";
import { AddLearningForm } from "@/components/features/AddLearningForm";
import { Terminal, Code, Check, Trash2, Plus } from "lucide-react";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function LearningMatrix() {
  const items = await getLearning();

  return (
    <PrivateShell
      eyebrow="Downloading skillsets"
      title="Knowledge Upload"
      description="Courses, papers, and guides with live progress."
      accent="green"
      icon={<Terminal className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <AddLearningForm />
      <LearningSortableList initialItems={items} />
    </PrivateShell>
  );
}