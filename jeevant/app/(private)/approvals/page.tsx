import PrivateShell from "@/components/layout/PrivateShell";
import { approveApprovalAction, getApprovals, rejectApprovalAction } from "@/lib/actions/approval.actions";
import { CheckCheck, X, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-700/60 bg-amber-950/20 text-amber-300",
  approved: "border-blue-700/60 bg-blue-950/20 text-blue-300",
  executed: "border-emerald-700/60 bg-emerald-950/20 text-emerald-300",
  rejected: "border-slate-700 bg-slate-900/40 text-slate-300",
  failed: "border-rose-800/60 bg-rose-950/20 text-rose-300",
};

export default async function ApprovalsPage() {
  const items = await getApprovals();
  const pending = items.filter((item: any) => item.status === "pending");
  const history = items.filter((item: any) => item.status !== "pending");

  return (
    <PrivateShell
      eyebrow="Comm center · guardrails"
      title="Approvals"
      description="External actions wait here until you approve them. Nothing is sent on its own."
      accent="amber"
      icon={<CheckCheck className="h-6 w-6 text-amber-400" />}
      actions={
        <span className="stat-chip text-center">
          <div className="text-[9px] uppercase tracking-widest text-shell-muted">Pending</div>
          <div className="text-xl font-black text-amber-300">{pending.length}</div>
        </span>
      }
    >
      <section className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Pending</h2>
        {pending.length === 0 && (
          <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
            Nothing waiting. Requests from the assistant will appear here.
          </div>
        )}
        {pending.map((item: any) => (
          <article key={item._id} className="panel-cyber p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${STATUS_STYLE[item.status]}`}>
                    {item.status}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-shell-muted">{item.kind}</span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-shell-text">{item.title}</h3>
                {item.detail && <p className="mt-1 text-xs text-shell-muted">{item.detail}</p>}
                <p className="mt-2 text-[10px] uppercase tracking-widest text-shell-muted/60">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={approveApprovalAction}>
                  <input type="hidden" name="id" value={item._id} />
                  <button className="flex items-center gap-2 border border-emerald-700 bg-emerald-950/30 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300 hover:bg-emerald-900/40">
                    <CheckCheck className="h-3.5 w-3.5" /> Approve
                  </button>
                </form>
                <form action={rejectApprovalAction}>
                  <input type="hidden" name="id" value={item._id} />
                  <button className="flex items-center gap-2 border border-rose-900/60 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/40">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">History</h2>
        {history.length === 0 && (
          <div className="panel-cyber p-6 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
            No decisions yet.
          </div>
        )}
        {history.map((item: any) => (
          <article key={item._id} className="panel-cyber p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${STATUS_STYLE[item.status] || STATUS_STYLE.rejected}`}>
                {item.status}
              </span>
              <span className="text-sm text-shell-text">{item.title}</span>
              <span className="text-[10px] uppercase tracking-widest text-shell-muted">{item.kind}</span>
              {item.result && (
                <span className="flex items-center gap-1 text-[10px] text-shell-muted">
                  {item.status === "failed" ? <AlertTriangle className="h-3 w-3 text-rose-400" /> : null}
                  {item.result}
                </span>
              )}
              <span className="ml-auto text-[10px] text-shell-muted/60">
                {item.decidedAt ? new Date(item.decidedAt).toLocaleString() : ""}
              </span>
            </div>
          </article>
        ))}
      </section>
    </PrivateShell>
  );
}
