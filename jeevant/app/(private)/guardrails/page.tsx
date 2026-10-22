import PrivateShell from "@/components/layout/PrivateShell";
import { getGuardrailOverview, saveGuardrailsAction } from "@/lib/actions/guardrail.actions";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export const dynamic = "force-dynamic";

const DECISION_STYLE: Record<string, string> = {
  approval: "border-amber-700/60 bg-amber-950/20 text-amber-300",
  blocked: "border-rose-800/60 bg-rose-950/20 text-rose-300",
  executed: "border-emerald-700/60 bg-emerald-950/20 text-emerald-300",
  failed: "border-rose-800/60 bg-rose-950/20 text-rose-300",
};

export default async function GuardrailsPage() {
  const { settings, logs } = await getGuardrailOverview();
  const blocked = settings.mode === "blocked";

  return (
    <PrivateShell
      eyebrow="Comm center · guardrails"
      title="Guardrails"
      description="No auto-send exists. Every outbound action is either queued for approval or blocked."
      accent="rose"
      icon={<ShieldAlert className="h-6 w-6 text-[#d8cfbe]" />}
      actions={
        <span className={`stat-chip text-center ${blocked ? "border-rose-800/60" : ""}`}>
          <div className="text-[9px] uppercase tracking-widest text-shell-muted">Mode</div>
          <div className={`text-sm font-black uppercase ${blocked ? "text-rose-300" : "text-emerald-300"}`}>
            {settings.mode}
          </div>
        </span>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Policy</h2>

          <form action={saveGuardrailsAction} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">External-action mode</span>
              <select
                name="mode"
                defaultValue={settings.mode}
                className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
              >
                <option value="approval">Approval — queue everything</option>
                <option value="blocked">Blocked — emergency stop</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">HTTP allowlist</span>
              <textarea
                name="httpAllowlist"
                rows={4}
                defaultValue={settings.httpAllowlist}
                placeholder={"hooks.slack.com\ndiscord.com\napi.telegram.org"}
                className="resize-y border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a] custom-scrollbar"
              />
              <span className="text-[10px] text-shell-muted/70">One hostname per line. Workflow HTTP steps to any other host are blocked.</span>
            </label>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Save policy
            </button>
          </form>

          <div className="mt-5 border-t border-white/5 pt-4 text-[10px] leading-5 text-shell-muted/80">
            <p className="font-bold uppercase tracking-widest text-shell-muted">Hard rules</p>
            <ul className="mt-2 space-y-1">
              <li>• No auto-send mode exists in the code.</li>
              <li>• Destructive tools require an explicit confirm.</li>
              <li>• Scheduled posts create approvals, never sends.</li>
              <li>• Workflow HTTP steps need an allowlisted host + approval.</li>
            </ul>
          </div>
        </aside>

        <section className="panel-cyber p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Audit log</h2>
          <div className="mt-4 flex max-h-[65vh] flex-col gap-2 overflow-y-auto custom-scrollbar">
            {logs.length === 0 && (
              <p className="py-6 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
                No decisions recorded yet.
              </p>
            )}
            {logs.map((log: any) => (
              <div key={log._id} className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2 text-[11px]">
                <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${DECISION_STYLE[log.decision] || ""}`}>
                  {log.decision}
                </span>
                <span className="font-bold uppercase tracking-widest text-shell-text">{log.action}</span>
                <span className="min-w-0 truncate text-shell-muted">{log.target}</span>
                <span className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-widest text-shell-muted/60">
                  {log.decision === "blocked" ? <ShieldX className="h-3 w-3 text-rose-400" /> : null}
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                {log.reason && <span className="w-full pl-1 text-[10px] text-shell-muted/70">{log.reason}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PrivateShell>
  );
}
