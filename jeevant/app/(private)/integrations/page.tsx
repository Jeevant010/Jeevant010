import { getIntegrationStatus, getSettings } from "@/lib/actions/integration.actions";
import IntegrationPanel from "@/components/integrations/IntegrationPanel";
import PrivateShell from "@/components/layout/PrivateShell";
import { Plug } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const statuses = await getIntegrationStatus();
  const settings = await getSettings();

  return (
    <PrivateShell
      eyebrow="Comm center · wiring"
      title="Integrations"
      description="Wire the pipes once. Everything else runs on autopilot."
      accent="amber"
      icon={<Plug className="h-6 w-6 text-amber-400" />}
    >
      <IntegrationPanel statuses={statuses} settings={settings} />
    </PrivateShell>
  );
}
