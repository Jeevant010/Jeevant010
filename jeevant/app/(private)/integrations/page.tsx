import { getIntegrationStatus, getSettings } from "@/lib/actions/integration.actions";
import IntegrationPanel from "@/components/integrations/IntegrationPanel";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const statuses = await getIntegrationStatus();
  const settings = await getSettings();

  return (
    <div className="-m-8 min-h-screen bg-[#08080a] p-6 font-mono text-shell-text sm:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-shell-border pb-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-[color:var(--accent)] shadow-[0_0_15px_var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--accent)]">
              COMM_CENTER // WIRING
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter sm:text-5xl">Integrations</h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-shell-muted">
            // Wire the pipes once. Everything else runs on autopilot.
          </p>
        </header>

        <IntegrationPanel statuses={statuses} settings={settings} />
      </div>
    </div>
  );
}
