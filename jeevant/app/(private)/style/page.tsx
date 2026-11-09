import PrivateShell from "@/components/layout/PrivateShell";
import { getStyle, learnStyleAction, saveStyleGuideAction } from "@/lib/actions/style.actions";
import { PenTool, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StylePage() {
  const { samples, guide } = await getStyle();

  return (
    <PrivateShell
      eyebrow="Comm center · voice"
      title="Writing Style"
      description="Paste real messages you wrote. The app learns your voice and uses it for every draft."
      accent="violet"
      icon={<PenTool className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel-cyber p-5">
          <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
            <Sparkles className="h-4 w-4" /> Samples
          </h2>
          <p className="mt-2 text-[11px] leading-5 text-shell-muted">
            Paste 3–8 real messages (emails, WhatsApp, posts). Separate each with a line containing only <code>---</code>.
          </p>
          <form action={learnStyleAction} className="mt-4 flex flex-col gap-3">
            <textarea
              name="samples"
              rows={14}
              defaultValue={samples.join("\n---\n")}
              placeholder={"Hey, quick update on the deploy...\n---\nHi Sir, sharing the formatted document...\n---\nShipped the RAG eval today."}
              className="resize-y border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a] custom-scrollbar"
            />
            <button type="submit" className="border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
              Learn my style
            </button>
          </form>
        </section>

        <section className="panel-cyber p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Style guide</h2>
          <p className="mt-2 text-[11px] leading-5 text-shell-muted">
            This is injected into every draft and agent reply. Edit it if the learned version is off.
          </p>
          <form action={saveStyleGuideAction} className="mt-4 flex flex-col gap-3">
            <textarea
              name="guide"
              rows={14}
              defaultValue={guide}
              placeholder="Tone, sentence length, greetings, sign-offs, phrases to reuse, things to avoid…"
              className="resize-y border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a] custom-scrollbar"
            />
            <button type="submit" className="border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#d8cfbe]">
              Save guide
            </button>
          </form>
        </section>
      </div>
    </PrivateShell>
  );
}
