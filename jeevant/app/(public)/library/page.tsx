import Link from "next/link";
import { CV } from "@/lib/catalog/cv";

export const metadata = {
  title: "Library · Jeevant Mudgil",
  description: "The books and papers named on the resumes, kept as a working shelf.",
};

export default function LibraryPage() {
  return (
    <div className="palace min-h-screen">
      <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <header className="max-w-3xl">
          <p className="palace-kicker">Library · {CV.reading.length} titles</p>
          <h1 className="mt-5 font-serif text-[clamp(3.4rem,9vw,7rem)] leading-[0.86] tracking-[-0.055em]">
            The shelf<span className="text-[var(--signal)]">.</span>
          </h1>
          <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
            Not a reading challenge and not an affiliate list. These are the books and papers that show up on the
            resumes because they fed the RAG, the transformer, and the systems work.
          </p>
        </header>

        <div className="mt-14 shelf-row">
          {CV.reading.map((title, index) => (
            <span
              key={title}
              className="book-spine"
              style={{ minHeight: `${8 + (index % 4) * 0.55}rem` }}
              title={title}
            >
              {title.split("—")[0].trim()}
            </span>
          ))}
        </div>

        <ol className="mt-12">
          {CV.reading.map((title, index) => (
            <li key={title} className="grid gap-3 border-t border-[var(--line)] py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline">
              <span className="font-serif text-2xl text-[var(--signal)]">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-base leading-7 text-[var(--paper)]">{title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Reading · selected shelf
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">shelf</span>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--line)] pt-8">
          <p className="max-w-lg font-serif text-2xl leading-tight tracking-[-0.03em]">
            The reading is public. The notes are private. The difference is usually the interesting part.
          </p>
          <Link href="/research" className="palace-cta">
            See the papers being written
          </Link>
        </div>
      </div>
    </div>
  );
}
