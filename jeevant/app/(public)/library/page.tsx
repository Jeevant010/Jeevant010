import { CV } from "@/lib/catalog/cv";

export const dynamic = "force-static";

export default function LibraryPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto max-w-[900px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">Library</p>
        <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.045em]">What the resumes say was read.</h1>
        <p className="mt-6 text-base leading-7 text-[var(--stage-muted)]">
          These are the books and papers named on the AI resume, not a padded shelf.
        </p>
        <ol className="mt-12 space-y-4">
          {CV.reading.map((title, index) => (
            <li key={title} className="stage-panel stage-rise flex gap-4 p-6" style={{ animationDelay: `${index * 70}ms` }}>
              <span className="font-serif text-3xl text-[var(--stage-signal)]">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-lg leading-8">{title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
