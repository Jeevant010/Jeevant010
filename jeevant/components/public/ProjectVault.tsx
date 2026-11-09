"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Github, Search } from "lucide-react";
import type { LiveProject } from "@/lib/catalog/live";
import { WORK_LANES, type WorkLane } from "@/lib/catalog/public-work";

type Status = "all" | "live" | "building" | "planned" | "stopped";

export default function ProjectVault({ projects }: { projects: LiveProject[] }) {
  const [lane, setLane] = useState<WorkLane | "All">("All");
  const [status, setStatus] = useState<Status>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) map.set(project.lane, (map.get(project.lane) || 0) + 1);
    return map;
  }, [projects]);

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const laneOk = lane === "All" || project.lane === lane;
      const statusOk = status === "all" || project.status === status;
      const haystack = `${project.title} ${project.description} ${project.stack.join(" ")} ${project.language}`.toLowerCase();
      return laneOk && statusOk && (!needle || haystack.includes(needle));
    });
  }, [projects, lane, status, query]);

  return (
    <div className="palace relative min-h-screen">
      <div className="palace-stars opacity-35" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        <header className="grid gap-10 border-b border-[var(--line)] pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="palace-kicker">The vault · {projects.length} public records</p>
            <h1 className="palace-name mt-5 text-[clamp(4rem,12vw,10rem)]" aria-label="The record">
              Record<span className="text-[var(--signal)]">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Every original public repository, plus the products and papers that are still being built. Filter by
              lane, status, or a word. Nothing here is a fork dressed up as a launch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
            {WORK_LANES.map((name) => (
              <div key={name} className="border border-[var(--line)] p-4">
                <p className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">{name}</p>
                <p className="mt-1 font-serif text-3xl leading-none">
                  {String(counts.get(name) || 0).padStart(2, "0")}
                </p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--muted)]">Lane</p>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {(["All", ...WORK_LANES] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setLane(name)}
                  className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition ${
                    lane === name
                      ? "border-[var(--signal)] bg-[var(--signal)] text-[var(--ink)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--signal)] hover:text-[var(--paper)]"
                  }`}
                >
                  <span>{name}</span>
                  <span>{name === "All" ? projects.length : counts.get(name) || 0}</span>
                </button>
              ))}
            </div>

            <p className="mt-8 text-[9px] uppercase tracking-[0.28em] text-[var(--muted)]">Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "live", "building", "planned", "stopped"] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setStatus(name)}
                  className={`border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] transition ${
                    status === name
                      ? "border-[var(--signal)] text-[var(--signal)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--paper)]"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="flex items-center gap-3 border border-[var(--line)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the record — try RAG, Unreal, MongoDB, game…"
                className="w-full bg-transparent text-sm text-[var(--paper)] outline-none placeholder:text-[var(--muted)]/70"
              />
              <span className="shrink-0 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {items.length} shown
              </span>
            </div>

            <ol className="mt-2">
              {items.map((project, index) => (
                <li
                  key={project.slug}
                  className="group grid gap-4 border-b border-[var(--line)] py-6 transition-colors hover:bg-white/[0.025] sm:grid-cols-[3.5rem_1fr_auto] sm:items-start"
                >
                  <span className="font-serif text-2xl leading-none text-[var(--muted)]/40 transition group-hover:text-[var(--signal)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      <span className="text-[var(--signal)]">{project.lane}</span>
                      <span>{project.status}</span>
                      <span>{project.language}</span>
                      {project.ongoing && <span className="text-[#a8c49a]">ongoing</span>}
                    </div>
                    <Link
                      href={`/projects/${encodeURIComponent(project.slug)}`}
                      className="mt-2 inline-block font-serif text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.02] tracking-[-0.04em] transition group-hover:text-[var(--signal)]"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--muted)]">{project.description}</p>
                    {project.stack.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                        {project.stack.slice(0, 6).map((tech) => (
                          <li key={tech} className="text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]/80">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Link
                      href={`/projects/${encodeURIComponent(project.slug)}`}
                      className="inline-flex items-center gap-1.5 border border-[var(--line)] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[var(--paper)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
                    >
                      Dossier <ArrowUpRight className="h-3 w-3" />
                    </Link>
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.title} on GitHub`}
                        className="inline-flex items-center gap-1.5 border border-transparent px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-[var(--paper)]"
                      >
                        <Github className="h-3 w-3" /> Repo
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {items.length === 0 && (
              <p className="border-b border-[var(--line)] py-20 text-center text-sm text-[var(--muted)]">
                Nothing in the record matches that. Try a different lane or a broader word.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
