import { CV } from "@/lib/catalog/cv";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-static";

const STATUS_LABEL: Record<string, string> = {
  writing: "First paper · writing",
  "in-progress": "In progress",
  experiment: "Experiment",
};

export default function ResearchPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto max-w-[1000px] px-5 py-16 sm:px-8 sm:py-24">
        <PageHeader
          eyebrow="Research"
          title="Two papers in progress, not a reading list."
          description="I am a fourth-year student writing my first two papers: agentic control of Unreal Engine 5, and privacy-preserving gunshot detection on edge devices. This page tracks only what is actually being written."
        />

        <section className="mt-14 grid gap-4">
          {CV.research.map((item) => (
            <article key={item.title} className="stage-panel quest-card p-6 sm:p-8">
              <span className="card-sheen" aria-hidden />
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em]">
                <span className="rounded-full border border-[var(--stage-signal)] px-3 py-1 text-[var(--stage-signal)]">
                  {STATUS_LABEL[item.status] || item.status}
                </span>
                <span className="text-[var(--stage-muted)]">{item.when}</span>
              </div>
              <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--stage-muted)]">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 border-t border-[var(--stage-line)] pt-10">
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">
            Reading that fed the work
          </h2>
          <ul className="mt-5 grid gap-2 text-sm text-[var(--stage-muted)]">
            {CV.reading.map((title) => (
              <li key={title} className="flex gap-3 border-b border-[var(--stage-line)] pb-2">
                <span className="text-[var(--stage-signal)]">—</span>
                {title}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
