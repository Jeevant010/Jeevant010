import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { PublicWork } from "@/lib/catalog/public-work";

export default function WorkDossier({ item }: { item: PublicWork }) {
  return (
    <article className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-60" />
      <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--stage-muted)] hover:text-[var(--stage-paper)]">
          <ArrowLeft className="h-4 w-4" /> Back to the board
        </Link>
        <p className="mt-10 text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">
          {item.lane} · {item.language}
        </p>
        <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.045em] sm:text-7xl">{item.title}</h1>
        <p className="mt-8 text-lg leading-8 text-[var(--stage-paper)]">{item.description}</p>
        <p className="mt-6 text-base leading-7 text-[var(--stage-muted)]">{item.detail}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {item.stack.map((tech) => (
            <span key={tech} className="rounded-full border border-[var(--stage-line)] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--stage-muted)]">
              {tech}
            </span>
          ))}
        </div>
        <a
          href={item.repo}
          target="_blank"
          rel="noreferrer"
          className="stage-button stage-button-solid mt-10"
        >
          Open the repository <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
