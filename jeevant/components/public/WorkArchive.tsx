"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_WORK, WORK_LANES, type WorkLane } from "@/lib/catalog/public-work";

export default function WorkArchive() {
  const [lane, setLane] = useState<WorkLane | "All">("All");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return PUBLIC_WORK.filter((item) => {
      const laneOk = lane === "All" || item.lane === lane;
      const text = `${item.title} ${item.description} ${item.stack.join(" ")} ${item.language}`.toLowerCase();
      return laneOk && (!needle || text.includes(needle));
    });
  }, [lane, query]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-70" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">Public record</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="max-w-3xl font-serif text-6xl leading-[0.9] tracking-[-0.045em] sm:text-7xl">
            The repos, with the story the README actually tells.
          </h1>
          <p className="max-w-sm text-sm leading-6 text-[var(--stage-muted)]">
            {PUBLIC_WORK.length} original repositories from Jeevant010. Cards link to a dossier, then to GitHub. No embedded previews, because those pages refuse to load inside the site.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["All", ...WORK_LANES] as const).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setLane(name)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                  lane === name
                    ? "border-[var(--stage-signal)] bg-[var(--stage-signal)] text-[var(--stage-ink)]"
                    : "border-[var(--stage-line)] text-[var(--stage-muted)] hover:text-[var(--stage-paper)]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the board"
            className="w-full rounded-full border border-[var(--stage-line)] bg-transparent px-4 py-2 text-sm text-[var(--stage-paper)] outline-none placeholder:text-[var(--stage-muted)] sm:w-64"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.slug} className="stage-panel quest-card stage-rise flex h-full flex-col p-6" style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}>
              <span className="card-sheen" aria-hidden />
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--stage-muted)]">
                <span>{item.lane}</span>
                <span>{item.language}</span>
              </div>
              <h2 className="mt-5 font-serif text-3xl tracking-[-0.03em]">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--stage-muted)]">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.stack.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[11px] uppercase tracking-[0.14em] text-[var(--stage-muted)]">
                    {tech}
                  </span>
                ))}
              </div>
              <Link href={`/projects/${item.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--stage-paper)]">
                Dossier <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-16 text-center text-sm text-[var(--stage-muted)]">Nothing on the board matches that search.</p>
        )}
      </div>
    </div>
  );
}
