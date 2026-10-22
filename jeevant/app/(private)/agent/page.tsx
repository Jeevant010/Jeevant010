import PrivateShell from "@/components/layout/PrivateShell";
import AgentConsole from "@/components/agent/AgentConsole";
import { Bot } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <PrivateShell
      eyebrow="Comm center · operator"
      title="Agent Console"
      description="Prompt or speak. The agent calls tools that read and write the same database the admin pages use."
      accent="emerald"
      icon={<Bot className="h-6 w-6 text-emerald-400" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AgentConsole />

        <aside className="panel-cyber h-fit p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Available tools</div>
          <ul className="mt-4 space-y-3 text-xs text-shell-muted">
            <li><span className="text-shell-text">create_task</span> — add to the daily planner</li>
            <li><span className="text-shell-text">complete_task</span> — mark a task done</li>
            <li><span className="text-shell-text">delete_task</span> — requires confirmation</li>
            <li><span className="text-shell-text">create_note</span> — save to the brain</li>
            <li><span className="text-shell-text">search_notes</span> — query notes</li>
            <li><span className="text-shell-text">create_project</span> — add a project</li>
            <li><span className="text-shell-text">list_tasks</span> — show open work</li>
          </ul>
          <div className="mt-5 border-t border-white/5 pt-4 text-[10px] uppercase tracking-widest text-shell-muted/70">
            Destructive actions never run without an explicit confirm.
          </div>
        </aside>
      </div>
    </PrivateShell>
  );
}
