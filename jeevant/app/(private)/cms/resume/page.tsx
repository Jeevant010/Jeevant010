import { getProfile, updateProfile } from "@/lib/actions/profile.actions";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResumeCMS() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-sky-900/20 border-2 border-sky-500 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-sky-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Resume Editor</h1>
          <p className="text-sky-500 text-xs tracking-widest mt-1">// PROFILE // RESUME LINK // FIRST IMPRESSION</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <form action={updateProfile} className="space-y-4 bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
          <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Resume Basics</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-shell-muted">Name</label>
              <input name="name" defaultValue={profile.name} placeholder="Your display name" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-shell-muted">Title</label>
              <input name="title" defaultValue={profile.title} placeholder="Full Stack Engineer" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Status</label>
            <input name="status" defaultValue={profile.status} placeholder="Available for Hire" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Resume Link</label>
            <input name="resumeLink" defaultValue={profile.resumeLink} placeholder="https://...pdf" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">GitHub Username</label>
            <input name="githubUsername" defaultValue={profile.githubUsername} placeholder="GitHub handle" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Avatar URL</label>
            <input name="avatarUrl" defaultValue={profile.avatarUrl} placeholder="https://..." className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-sky-500" />
          </div>

          <button className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-shell-text font-bold uppercase tracking-widest transition">Save Resume Settings</button>
        </form>

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">What powers the public resume</h3>
            <div className="space-y-3 text-sm leading-6 text-shell-muted">
              <p>Profile information from this page.</p>
              <p>Project history and start/end dates from the project CMS.</p>
              <p>Experience timeline items from the journey CMS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
