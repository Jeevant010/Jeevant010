import { CV } from "@/lib/catalog/cv";

export const dynamic = "force-static";

export default function ResearchPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto max-w-[900px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">Research</p>
        <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.045em]">Papers and books, named once.</h1>
        <div className="mt-12 grid gap-4">
          {CV.reading.map((title) => (
            <article key={title} className="stage-panel quest-card p-6">
              <span className="card-sheen" aria-hidden />
              <h2 className="font-serif text-3xl tracking-[-0.03em]">{title}</h2>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
