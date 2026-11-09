import { redirect } from "next/navigation";
import PrivateShell from "@/components/layout/PrivateShell";
import ActionBridge from "@/components/bridge/ActionBridge";
import { getSession } from "@/lib/auth";
import { Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <PrivateShell
      eyebrow="Comm center · bridge"
      title="Action Bridge"
      description="Short-lived links that finish one chore from your phone, a script, or a QR code. The link is the credential; it is hashed at rest, expires, and can be revoked."
      accent="emerald"
      icon={<Link2 className="h-6 w-6 text-emerald-400" />}
    >
      <ActionBridge />
    </PrivateShell>
  );
}
