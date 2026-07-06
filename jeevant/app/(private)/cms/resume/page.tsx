import { getResumes } from "@/lib/actions/resume.actions";
import { FileText } from "lucide-react";
import ResumeManager from "@/components/features/ResumeManager";

export const dynamic = "force-dynamic";

export default async function ResumeCMS() {
  const resumes = await getResumes();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-4 sm:p-8 font-mono sm:-m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-sky-900/20 border-2 border-sky-500 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-sky-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Resume Editor</h1>
          <p className="text-sky-500 text-xs tracking-widest mt-1">// DOMAINS // TARGETING // VERSIONS</p>
        </div>
      </div>

      <ResumeManager resumes={resumes} />
    </div>
  );
}
