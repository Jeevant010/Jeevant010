import { getResumes } from "@/lib/actions/resume.actions";
import { FileText } from "lucide-react";
import ResumeManager from "@/components/features/ResumeManager";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function ResumeCMS() {
  const resumes = await getResumes();

  return (
    <PrivateShell
      eyebrow="Domains · targeting · versions"
      title="Resume Editor"
      description="Role-specific resumes generated from one source of truth."
      accent="sky"
      icon={<FileText className="h-6 w-6 text-sky-400" />}
    >
      <ResumeManager resumes={resumes} />
    </PrivateShell>
  );
}
