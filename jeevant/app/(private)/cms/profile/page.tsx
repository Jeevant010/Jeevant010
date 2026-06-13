import { getProfile } from "@/lib/actions/profile.actions";
import { UserCog } from "lucide-react";
import ProfileForm from "@/components/features/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfileCMS() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-400 p-8 font-mono -m-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-12 border-b border-slate-800 pb-6">
        <div className="w-16 h-16 bg-emerald-900/20 border-2 border-emerald-500 rounded flex items-center justify-center">
          <UserCog className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white uppercase tracking-tight">Identity Matrix</h1>
          <p className="text-emerald-500 text-xs tracking-widest mt-1">// CONFIG_USER_SETTINGS</p>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}