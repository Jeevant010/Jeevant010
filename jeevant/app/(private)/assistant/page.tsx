import PrivateShell from "@/components/layout/PrivateShell";
import Assistant from "@/components/assistant/Assistant";
import { addMemoryAction, deleteMemoryAction, getMemories } from "@/lib/actions/memory.actions";
import { Bot, Brain, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const memories = await getMemories();

  return (
    <PrivateShell
      eyebrow="Comm center · assistant"
      title="Assistant"
      description="Talk or type. It remembers you, calls tools, and speaks the reply back."
      accent="emerald"
      icon={<Bot className="h-6 w-6 text-emerald-400" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Assistant />

        <aside className="panel-cyber h-fit p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
            <Brain className="h-4 w-4" /> Memory ({memories.length})
          </div>

          <form action={addMemoryAction} className="mt-4 flex flex-col gap-2">
            <input
              name="text"
              required
              placeholder="Something to remember…"
              className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
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

          <div className="mt-5 flex max-h-[42vh] flex-col gap-2 overflow-y-auto custom-scrollbar">
            {memories.map((memory: any) => (
              <div key={memory._id} className="flex items-start gap-2 border-b border-white/5 pb-2 text-xs text-shell-muted">
                <span className="flex-1 text-shell-text">{memory.text}</span>
                <form action={deleteMemoryAction}>
                  <input type="hidden" name="id" value={memory._id} />
                  <button type="submit" aria-label="Delete memory" className="text-shell-muted hover:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))}
            {memories.length === 0 && (
              <p className="py-4 text-center text-[10px] uppercase tracking-widest text-shell-muted/60">
                Nothing stored yet.
              </p>
            )}
          </div>
          <p className="mt-4 border-t border-white/5 pt-3 text-[10px] uppercase tracking-widest text-shell-muted/70">
            Memory is injected into every agent prompt.
          </p>
        </aside>
      </div>
    </PrivateShell>
  );
}
