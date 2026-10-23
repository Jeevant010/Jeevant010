import Link from "next/link";
import { ArrowUpRight, Github, Mail } from "lucide-react";
import CountUp from "@/components/public/CountUp";
import LiveClock from "@/components/public/LiveClock";
import type { LifeChapter, LifeData, LiveProject } from "@/lib/catalog/live";

export default function CinematicHome({ life }: { life: LifeData }) {
  const { profile, projects, achievements, chapters, stats } = life;
  const featured = projects.filter((item) => item.featured).slice(0, 8);
  const rail = featured.length >= 4 ? featured : projects.slice(0, 8);
  const building = projects.filter((item) => item.status === "live" || item.status === "building").slice(0, 6);
  const marquee = projects
    .slice(0, 26)
    .map((item) => item.title)
    .join("  ·  ");

  return (
    <div className="palace palace-noise relative overflow-clip">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="palace-hero">
        <div className="palace-aurora" aria-hidden />
        <div className="palace-stars" aria-hidden />
        <div className="palace-floor" aria-hidden />

        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-14 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <LiveClock />
              <span className="h-3 w-px bg-[var(--line)]" />
              <span className="palace-kicker">{profile.status}</span>
            </div>

            <h1 className="palace-name mt-7" aria-label={profile.name}>
              {profile.firstName.split("").map((letter, index) => (
                <span key={`${letter}-${index}`} className="char" style={{ animationDelay: `${index * 60}ms` }}>
                  {letter}
                </span>
              ))}
              <span className="text-[0.34em] align-super tracking-[-0.02em] text-[var(--signal)]">.</span>
            </h1>

            <p className="mt-6 max-w-xl font-serif text-[clamp(1.5rem,2.6vw,2.15rem)] leading-[1.15] tracking-[-0.03em]">
              Founder of {profile.company.name.split(" (")[0]}. Engineer of retrieval systems, game tools, and the
              public record behind them.
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
              {profile.bio}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
              <span>{profile.education.school}</span>
              <span className="h-3 w-px bg-[var(--line)]" />
              <span>{profile.education.when}</span>
              <span className="h-3 w-px bg-[var(--line)]" />
              <span className="text-[var(--signal)]">CGPA 8.89</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#life" className="palace-cta palace-cta-solid">
                Enter the life <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link href="/projects" className="palace-cta">
                The record
              </Link>
              <Link href="/cv" className="palace-cta">
                CV
              </Link>
              <a href={profile.links[0]?.href || "https://github.com/Jeevant010"} target="_blank" rel="noreferrer" className="palace-cta">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href={`mailto:${profile.email}`} className="palace-cta">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className="border-l border-[var(--line)] pl-4">
                  <dt className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">{stat.label}</dt>
                  <dd className="mt-1 font-serif text-4xl leading-none tracking-[-0.04em]">
                    {/^\d+$/.test(stat.value) ? (
                      <CountUp value={Number(stat.value)} duration={1200 + index * 180} />
                    ) : (
                      stat.value
                    )}
                  </dd>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]/70">{stat.detail}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="portrait-stage mx-auto w-full max-w-[26rem] lg:max-w-none">
            <figure className="portrait-plate aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatar} alt={profile.name} />
              <figcaption className="absolute inset-x-6 bottom-6 z-10">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--signal)]">Founder · engineer</p>
                <p className="mt-1 font-serif text-3xl leading-none tracking-[-0.03em]">{profile.name}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {profile.location} · {profile.company.status}
                </p>
              </figcaption>
            </figure>
            <span className="portrait-tag portrait-tag-a">SSIP 2.0 grantee</span>
            <span className="portrait-tag portrait-tag-b">IIIT Surat · 2027</span>
          </div>
        </div>

        <a
          href="#life"
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.34em] text-[var(--muted)]"
        >
          Scroll into the life ↓
        </a>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-y border-[var(--line)] py-3">
        <div className="marquee-x gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">
          <span>{marquee}</span>
          <span aria-hidden>{marquee}</span>
        </div>
      </div>

      {/* ── THE LIFE ─────────────────────────────────────────── */}
      <section id="life" className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <header className="max-w-3xl">
          <p className="palace-kicker">The record · one person, five scenes</p>
          <h2 className="mt-5 font-serif text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.92] tracking-[-0.05em]">
            Not a static page.
            <br />
            <span className="text-[var(--signal)]">A life, in the order it happened.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Every chapter below is tied to something public: a repo, a grant, a grade, a role, a final, or a paper
            being written. Nothing here is padded for the landing page.
          </p>
        </header>

        <div className="mt-16">
          {chapters.map((chapter, index) => (
            <article key={chapter.year + chapter.title} className="chapter">
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="chapter-year">{chapter.year}</div>
                <p className="palace-kicker mt-5">{chapter.kicker}</p>
                <h3 className="mt-3 max-w-md font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[0.98] tracking-[-0.04em]">
                  {chapter.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">{chapter.body}</p>
                <ul className="mt-6 grid gap-2">
                  {chapter.proof.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--signal)]" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <ChapterScene chapter={chapter} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── THE RECORD ───────────────────────────────────────── */}
      <section className="relative border-t border-[var(--line)] py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="palace-kicker">The record · public work</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.92] tracking-[-0.05em]">
                Things that actually run.
              </h2>
            </div>
            <Link href="/projects" className="palace-cta">
              All {projects.length} repositories <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="record-rail mt-10">
            {rail.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <header>
            <p className="palace-kicker">Proof · {achievements.length} marks</p>
            <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4rem)] leading-[0.94] tracking-[-0.05em]">
              The receipts.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted)]">
              A grant, a few finals, a CTF win, two hundred days of practice. The list is long because the work
              happened, not because the page needed filler.
            </p>
          </header>

          <ol className="grid gap-x-8 sm:grid-cols-2">
            {achievements.slice(0, 12).map((mark, index) => (
              <li key={mark.slug + index} className="group border-t border-[var(--line)] py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--signal)]">
                      {mark.platform || "Mark"} · {mark.date ? new Date(mark.date).getFullYear() : "—"}
                    </p>
                    <h3 className="mt-1 text-sm font-medium leading-5 text-[var(--paper)] transition group-hover:text-[var(--signal)]">
                      {mark.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{mark.description}</p>
                  </div>
                  <span className="font-serif text-xl text-[var(--muted)]/50">{String(index + 1).padStart(2, "0")}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── NOW ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-[var(--line)]">
        <div className="palace-aurora opacity-60" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="palace-kicker">Now · the next scene</p>
            <h2 className="mt-4 max-w-2xl font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.88] tracking-[-0.055em]">
              Build the thing.
              <br />
              Then build the <span className="text-[var(--signal)]">system around it.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--muted)]">{profile.availability}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="palace-cta palace-cta-solid">
                Start a conversation <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/journey" className="palace-cta">
                Read the whole timeline
              </Link>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-black/30 p-6 backdrop-blur">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--muted)]">In the workshop</p>
            <ul className="mt-5 space-y-4">
              {building.map((project) => (
                <li key={project.slug} className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                  <div>
                    <p className="text-sm text-[var(--paper)]">{project.title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      {project.stack.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${project.status === "live" ? "bg-[#a8c49a]" : "bg-[var(--signal)]"}`} />
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {profile.currentFocus}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project, index }: { project: LiveProject; index: number }) {
  const href = project.repo || project.live || `/projects/${encodeURIComponent(project.slug)}`;
  const external = Boolean(project.repo || project.live);

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="record-card group flex flex-col p-6 sm:p-7"
    >
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">
        <span className="text-[var(--signal)]">{project.lane}</span>
        <span>{project.status}</span>
      </div>
      <h3 className="mt-6 font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.98] tracking-[-0.04em]">
        {project.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-6 text-[var(--muted)]">{project.description}</p>
      <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
        {project.stack.slice(0, 4).map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--paper)] transition group-hover:text-[var(--signal)]">
        {project.repo ? "Open repository" : project.live ? "Open live" : "Open dossier"}
        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
      <span className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em] text-[var(--paper)]/10 transition group-hover:text-[var(--signal)]/25">
        {String(index + 1).padStart(2, "0")}
      </span>
    </Link>
  );
}

function ChapterScene({ chapter }: { chapter: LifeChapter }) {
  if (chapter.tone === "origin") {
    return (
      <div className={`scene scene-origin p-6 sm:p-8`}>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full bg-[#b98a6a]" />
          <span className="h-2 w-2 rounded-full bg-[#d8c7a0]" />
          <span className="h-2 w-2 rounded-full bg-[#98a89c]" />
          <span className="ml-2">first_term.sh</span>
        </div>
        <pre className="mt-6 overflow-hidden font-mono text-[11px] leading-6 text-[var(--muted)] sm:text-xs">
{`> ssh jeevant@iiit-surat
> cat plan.txt
  learn C
  build something public
  finish what you start
> gcc first.c -o first
> ./first
  segmentation fault
> ./first
  it runs.`}
        </pre>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {[
            ["2023", "arrival"],
            ["8.89", "CGPA"],
            ["C", "first language"],
          ].map(([value, label]) => (
            <div key={label} className="border border-[var(--line)] p-3">
              <div className="font-serif text-2xl">{value}</div>
              <div className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[var(--muted)]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chapter.tone === "first") {
    return (
      <div className="scene scene-first p-6 sm:p-8">
        <p className="text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">National leaderboard · 2024</p>
        <div className="mt-7 space-y-5">
          {[
            { label: "HackOdisha 4.0", note: "top 5% nationally", width: 92 },
            { label: "AlgoUniversity", note: "stage 2 · 4k / 20k+", width: 80 },
            { label: "First public repos", note: "shipped", width: 64 },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.16em]">
                <span className="text-[var(--paper)]">{row.label}</span>
                <span className="text-[var(--muted)]">{row.note}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden bg-white/5">
                <div className="leader-bar h-full" style={{ width: `${row.width}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-[var(--line)] p-4">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--signal)]">The lesson</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The work can survive contact with the outside. Ship it early enough to find out.
          </p>
        </div>
      </div>
    );
  }

  if (chapter.tone === "build") {
    return (
      <div className="scene scene-build grid place-items-center p-6 sm:p-8">
        <div className="relative h-64 w-64">
          <div className="orbit orbit-spin orbit-center h-full w-full">
            <span className="orbit-dot" style={{ top: -4, left: "50%" }} />
            <span className="orbit-dot" style={{ bottom: -4, left: "32%" }} />
          </div>
          <div className="orbit orbit-spin-rev orbit-center h-3/4 w-3/4">
            <span className="orbit-dot" style={{ top: "50%", right: -4 }} />
          </div>
          <div className="absolute inset-[22%] grid place-items-center rounded-full border border-[var(--signal)]/40 bg-black/30 text-center">
            <div>
              <p className="text-[8px] uppercase tracking-[0.24em] text-[var(--muted)]">granted</p>
              <p className="mt-1 font-serif text-2xl leading-none">SSIP 2.0</p>
              <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[var(--signal)]">Gujarat</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["GDG AI/ML lead", "AdaptiveGrade", "CrowdStats", "Innov-AI-Thon"].map((chip) => (
            <span key={chip} className="border border-[var(--line)] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
              {chip}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (chapter.tone === "operator") {
    return (
      <div className="scene scene-operator grid grid-cols-2 gap-px bg-[var(--line)]">
        {[
          ["Astra3D", "backend intern", "2026"],
          ["50 users", "beta · 100% uptime", "live"],
          ["CTF", "1st place", "2026"],
          ["2 papers", "in progress", "now"],
        ].map(([value, label, when]) => (
          <div key={label} className="flex min-h-[9rem] flex-col justify-between bg-[#0a0a0b] p-5">
            <span className="text-[8px] uppercase tracking-[0.24em] text-[var(--muted)]">{when}</span>
            <div>
              <p className="font-serif text-3xl leading-none tracking-[-0.03em]">{value}</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[var(--signal)]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="scene scene-now flex flex-col justify-between p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="palace-kicker">
          <span className="live-dot" /> live
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">operator OS</span>
      </div>
      <div className="py-10">
        <p className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.9] tracking-[-0.05em]">
          Voice in.
          <br />
          Work out.
        </p>
        <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--muted)]">
          The assistant turns a spoken thought into drafts, tasks, plans, and shipped output. It is the system around
          the work, not another chat box.
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>Groq · Whisper · MongoDB</span>
        <span className="text-[var(--signal)]">open the console →</span>
      </div>
    </div>
  );
}
