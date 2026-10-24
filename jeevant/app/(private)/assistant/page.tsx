import PrivateShell from "@/components/layout/PrivateShell";
import Assistant from "@/components/assistant/Assistant";
import PushSetup from "@/components/layout/PushSetup";
import { addMemoryAction, deleteMemoryAction, getMemories } from "@/lib/actions/memory.actions";
import { getBriefing, getRecentHistory } from "@/lib/agent/briefing";
import { Bot, Brain, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const [memories, briefing, history] = await Promise.all([
    getMemories().catch(() => []),
    getBriefing(),
    getRecentHistory(16),
  ]);

  return (
    <PrivateShell
      eyebrow="Comm center · operator"
      title="Assistant"
      description="A voice-first operator over your real data: it briefs, navigates, writes, and executes tools. Every state below is read live."
      accent="emerald"
      icon={<Bot className="h-6 w-6 text-emerald-400" />}
    >
      <Assistant
        initialBriefing={briefing}
        initialHistory={history}
        memoryCount={memories.length}
      />

      <PushSetup />

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={addMemoryAction} className="panel-cyber h-fit p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
            <Brain className="h-4 w-4" /> Teach memory ({memories.length})
          </div>
          <p className="mt-3 text-[10px] uppercase leading-5 tracking-[0.14em] text-shell-muted/70">
            Durable facts injected into every planning call. Keep them short and true.
          </p>
          <input
            name="text"
            required
            placeholder="Something to remember…"
            className="mt-4 w-full border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-emerald-500"
          />
          <div className="mt-2 flex gap-2">
            <input
              name="tags"
              placeholder="tags, comma, separated"
              className="flex-1 border border-shell-border bg-black px-3 py-2 text-xs text-shell-text outline-none focus:border-emerald-500"
            />
            <button type="submit" className="border border-emerald-700 bg-emerald-950/30 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300 hover:bg-emerald-900/40">
              Save
            </button>
          </div>
        </form>

        <div className="panel-cyber p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
              <Brain className="h-4 w-4" /> Stored facts
            </div>
            <span className="text-[9px] uppercase tracking-[0.16em] text-shell-muted/60">{memories.length} on file</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {memories.map((memory: any) => (
              <div key={memory._id} className="flex items-start gap-2 border border-white/5 bg-black/20 px-3 py-2 text-xs text-shell-muted">
                <span className="flex-1 leading-5 text-shell-text">{memory.text}</span>
                <form action={deleteMemoryAction}>
                  <input type="hidden" name="id" value={memory._id} />
                  <button type="submit" aria-label="Delete memory" className="text-shell-muted hover:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))}
            {memories.length === 0 && (
              <p className="py-4 text-center text-[10px] uppercase tracking-widest text-shell-muted/60 sm:col-span-2">
                Nothing stored yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </PrivateShell>
  );
}
