import { getProfile } from "@/lib/actions/profile.actions";
import { UserCog } from "lucide-react";
import ProfileForm from "@/components/features/ProfileForm";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function ProfileCMS() {
  const profile = await getProfile();

  return (
    <PrivateShell
      eyebrow="Configure user settings"
      title="Identity Matrix"
      description="The single source of truth for your public identity."
      accent="emerald"
      icon={<UserCog className="h-6 w-6 text-emerald-400" />}
    >
      <ProfileForm profile={profile} />
    </PrivateShell>
  );
}