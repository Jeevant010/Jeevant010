import PrivateShell from "@/components/layout/PrivateShell";
import { deleteActivityDataAction, deleteEverythingAction } from "@/lib/actions/privacy.actions";
import { Download, Lock, ShieldAlert, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const notice =
    params.deleted === "activity"
      ? "Activity data deleted. Content and credentials are untouched."
      : params.deleted === "all"
        ? "All personal content and credentials deleted. Guardrail settings were kept."
        : "";
  const error =
    params.error === "activity"
      ? "Confirmation text did not match. Nothing was deleted."
      : params.error === "all"
        ? "Confirmation text did not match. Nothing was deleted."
        : "";

  return (
    <PrivateShell
      eyebrow="Ops center · privacy"
      title="Privacy"
      description="Encryption status, retention windows, export, and deletion. Delete actions are irreversible and confirmation-gated."
      accent="emerald"
      icon={<Lock className="h-6 w-6 text-emerald-400" />}
    >
      {notice ? (
        <p className="mb-4 border border-emerald-900/50 bg-emerald-950/15 px-4 py-3 text-[11px] text-emerald-200">{notice}</p>
      ) : null}
      {error ? (
        <p className="mb-4 border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-[11px] text-rose-200">{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel-cyber p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-shell-muted">
            <Download className="h-4 w-4" /> Export
          </div>
          <p className="mt-3 text-[11px] leading-5 text-shell-muted">
            One JSON archive of every personal collection. Credential values are replaced with key names; token hashes
            are stripped.
          </p>
          <a
            href="/api/privacy/export"
            download
            className="mt-4 inline-flex items-center gap-2 border border-[color:var(--shell-accent)]/50 bg-[color:var(--shell-accent)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/20"
          >
            <Download className="h-3.5 w-3.5" /> Download archive
          </a>
        </section>

        <section className="panel-cyber p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-shell-muted">
            <Lock className="h-4 w-4" /> Encryption and retention
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-shell-muted">
            <li>Credential secrets: AES-256-GCM, key derived from ADMIN_SECRET.</li>
            <li>Chat and conversation memory: 90 days by default.</li>
            <li>Audit log: 180 days by default.</li>
            <li>Outbound message log: 180 days by default.</li>
            <li>Bridge links: deleted at expiry; raw tokens are never stored.</li>
            <li>Service worker: private routes and API responses are never cached.</li>
          </ul>
          <p className="mt-3 border-t border-white/5 pt-3 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/70">
            Change the windows with RETENTION_CHAT_DAYS, RETENTION_AUDIT_DAYS, and RETENTION_OUTBOUND_DAYS. Rotating
            ADMIN_SECRET makes old encrypted credentials unreadable.
          </p>
        </section>

        <section className="panel-cyber p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
            <ShieldAlert className="h-4 w-4" /> Delete activity data
          </div>
          <p className="mt-3 text-[11px] leading-5 text-shell-muted">
            Removes chat, audit, activity, focus, approvals, outbound log, jobs, bridge links, and memories. Tasks, notes,
            projects, and credentials stay.
          </p>
          <form action={deleteActivityDataAction} className="mt-4 flex flex-col gap-2">
            <input
              name="confirm"
              placeholder="Type DELETE ACTIVITY"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-amber-700/50 bg-amber-950/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300 hover:bg-amber-900/40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete activity data
            </button>
          </form>
        </section>

        <section className="panel-cyber p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300">
            <Trash2 className="h-4 w-4" /> Delete everything
          </div>
          <p className="mt-3 text-[11px] leading-5 text-shell-muted">
            Removes every content and credential collection too, including accounts, projects, and the public site data.
            Guardrail settings survive so the emergency stop is never erased.
          </p>
          <form action={deleteEverythingAction} className="mt-4 flex flex-col gap-2">
            <input
              name="confirm"
              placeholder="Type DELETE ALL"
              className="border border-rose-900/50 bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-rose-800/60 bg-rose-950/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-900/50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete everything
            </button>
          </form>
        </section>
      </div>

      <p className="mt-6 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/60">
        Full policy in docs/PRIVACY.md. Deleting here does not remove data already sent to Groq, Google, or a messaging
        provider.
      </p>
    </PrivateShell>
  );
}
