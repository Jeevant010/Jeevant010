import PrivateShell from "@/components/layout/PrivateShell";
import { TEMPLATES } from "@/lib/automation/templates";
import {
  createWorkflowAction,
  deleteWorkflowAction,
  getRecentRuns,
  getWorkflows,
  runWorkflowAction,
  toggleWorkflowAction,
} from "@/lib/actions/workflow.actions";
import { Play, Power, Trash2, Workflow as WorkflowIcon, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const workflows = await getWorkflows();
  const runs = await getRecentRuns(30);

  return (
    <PrivateShell
      eyebrow="Comm center · automation"
      title="Automations"
      description="Multi-step workflows: agent, tasks, notes, posts, email, calendar, and HTTP. External steps queue for approval."
      accent="emerald"
      icon={<WorkflowIcon className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">New workflow</h2>
          <form action={createWorkflowAction} className="mt-4 flex flex-col gap-3">
            <select
              name="template"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
            >
              {TEMPLATES.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Name (optional)"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
            />
            <select
              name="trigger"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
            >
              <option value="manual">Manual</option>
              <option value="schedule">Scheduled</option>
              <option value="webhook">Webhook</option>
            </select>
            <input
              name="intervalMinutes"
              type="number"
              min={5}
              placeholder="Every N minutes (scheduled only)"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]"
            />
            <button
              type="submit"
              className="border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20"
            >
              Create workflow
            </button>
          </form>
          <p className="mt-4 border-t border-white/5 pt-3 text-[10px] uppercase tracking-widest text-shell-muted/70">
            Scheduled workflows run when <code>/api/cron/worker</code> is hit.
          </p>
        </aside>

        <section className="space-y-3">
          {workflows.length === 0 && (
            <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
              No workflows yet. Create one from a template.
            </div>
          )}

          {workflows.map((workflow: any) => (
            <article key={workflow._id} className="panel-cyber p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        workflow.enabled
                          ? "border-emerald-700/60 bg-emerald-950/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-shell-muted"
                      }`}
                    >
                      {workflow.enabled ? "enabled" : "paused"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-shell-muted">
                      <Clock className="h-3 w-3" />
                      {workflow.trigger === "schedule" ? `every ${workflow.intervalMinutes}m` : "manual"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-shell-text">{workflow.name}</h3>
                  {workflow.description && <p className="mt-1 text-xs text-shell-muted">{workflow.description}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={runWorkflowAction}>
                    <input type="hidden" name="id" value={workflow._id} />
                    <button className="flex items-center gap-2 border border-[#c8b48a]/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/10">
                      <Play className="h-3.5 w-3.5" /> Run
                    </button>
                  </form>
                  <form action={toggleWorkflowAction}>
                    <input type="hidden" name="id" value={workflow._id} />
                    <button className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-shell-text">
                      <Power className="h-3.5 w-3.5" /> {workflow.enabled ? "Pause" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteWorkflowAction}>
                    <input type="hidden" name="id" value={workflow._id} />
                    <button className="flex items-center gap-2 border border-rose-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/30">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(workflow.steps || []).map((step: any, index: number) => (
                  <span key={step._id || index} className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-widest text-shell-muted">
                    {index + 1}. {step.type}
                  </span>
                ))}
              </div>

              {workflow.webhookKey && (
                <div className="mt-3 border border-white/5 bg-black/40 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-shell-muted">Inbound webhook</div>
                  <code className="mt-1 block break-all text-[10px] text-[#c8b48a]">
                    /api/hooks/{workflow.webhookKey}
                  </code>
                </div>
              )}

              {(() => {
                const history = runs.filter((run: any) => String(run.workflowId) === workflow._id).slice(0, 3);
                if (!history.length) return null;
                return (
                  <div className="mt-4 border-t border-white/5 pt-3">
                    <div className="mb-1 text-[9px] uppercase tracking-widest text-shell-muted">Run history</div>
                    {history.map((run: any) => (
                      <div key={run._id} className="mb-2 border border-white/5 p-2">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-widest">
                          <span className={run.status === "success" ? "text-emerald-400" : "text-rose-400"}>{run.status}</span>
                          <span className="text-shell-muted">{new Date(run.startedAt).toLocaleString()}</span>
                        </div>
                        {(run.steps || []).map((step: any, index: number) => (
                          <div key={index} className="mt-1 text-[11px] text-shell-muted">
                            <span className={step.ok ? "text-emerald-400" : "text-rose-400"}>{step.ok ? "✓" : "✗"}</span>{" "}
                            {step.type} ({step.attempts} attempt{step.attempts === 1 ? "" : "s"}) — {step.result}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {Array.isArray(workflow.lastResult) && workflow.lastResult.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="mb-1 text-[9px] uppercase tracking-widest text-shell-muted">Last run</div>
                  {workflow.lastResult.map((result: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-[11px]">
                      <span className={result.ok ? "text-emerald-400" : "text-rose-400"}>{result.ok ? "✓" : "✗"}</span>
                      <span className="text-shell-muted">
                        <span className="font-bold uppercase tracking-widest text-shell-text">{result.type}</span> — {result.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </PrivateShell>
  );
}
