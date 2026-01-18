import { getProfile, updateProfile } from "@/lib/actions/profile.actions";
import { UserCog, Save, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfileCMS() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-slate-300 p-8 font-mono -m-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
        <div className="w-16 h-16 bg-blue-900/20 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <UserCog className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white uppercase tracking-tight">Identity Disc</h1>
          <p className="text-blue-500 text-xs tracking-widest mt-1">// CONFIG_USER_SETTINGS</p>
        </div>
      </div>

      <form action={updateProfile} className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: PUBLIC PERSONA */}
        <div className="space-y-6 bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
          <h3 className="text-white font-bold uppercase border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Core Data
          </h3>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Display Name</label>
            <input name="name" defaultValue={profile.name} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Class / Title</label>
            <input name="title" defaultValue={profile.title} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500">Level</label>
              <input name="level" type="number" defaultValue={profile.level} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
               <label className="text-xs uppercase font-bold text-slate-500">LeetCode Rating</label>
               <input name="leetcodeRating" type="number" defaultValue={profile.leetcodeRating} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LINKS & ASSETS */}
        <div className="space-y-6 bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
           <h3 className="text-white font-bold uppercase border-b border-white/10 pb-2 mb-4">
             Assets & Links
          </h3>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Status Message (Home)</label>
            <input name="status" defaultValue={profile.status} className="w-full bg-black border border-white/10 p-3 text-green-400 outline-none focus:border-green-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">GitHub Username</label>
            <input name="githubUsername" defaultValue={profile.githubUsername} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Avatar URL</label>
            <input name="avatarUrl" defaultValue={profile.avatarUrl} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500">Resume Link (PDF)</label>
            <input name="resumeLink" defaultValue={profile.resumeLink} className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-blue-500 text-sm" />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="md:col-span-2">
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Save className="w-5 h-5" /> Update Identity Matrix
          </button>
        </div>

      </form>
    </div>
  );
}