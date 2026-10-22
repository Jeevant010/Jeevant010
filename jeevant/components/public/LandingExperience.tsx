"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { PUBLIC_WORK, laneCounts, type PublicWork } from "@/lib/catalog/public-work";
import { CV } from "@/lib/catalog/cv";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import TiltCard from "@/components/public/TiltCard";

const ORBIT = ["PyTorch", "Unreal", "RAG", "Solidity", "Next.js", "MongoDB", "FastAPI", "LangChain"];

const WHISPERS = [
  "Finish the scene you are in.",
  "The next level is the one you ship.",
  "The audience only sees the public repos.",
  "Play the work, do not narrate it.",
];

export default function LandingExperience({ profile }: { profile: { name?: string; status?: string } | null }) {
  const featured = PUBLIC_WORK.filter((item) => item.featured);
  const lanes = laneCounts();
  const [active, setActive] = useState(0);
  const [whisper, setWhisper] = useState(0);
  const [counts, setCounts] = useState({ repos: 0, featured: 0, awards: 0 });
  const name = profile?.name?.split(" ")[0] || "Jeevant";
  const spotlight = featured[active] ?? featured[0];
  const marquee = useMemo(() => PUBLIC_WORK.map((item) => item.title).join("   ·   "), []);

  useEffect(() => {
    const scene = window.setInterval(() => setActive((n) => (n + 1) % featured.length), 4200);
    const line = window.setInterval(() => setWhisper((n) => (n + 1) % WHISPERS.length), 2800);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      setCounts({
        repos: Math.round(PUBLIC_WORK.length * t),
        featured: Math.round(featured.length * t),
        awards: Math.round(CV.marks.length * t),
      });
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      window.clearInterval(scene);
      window.clearInterval(line);
      cancelAnimationFrame(frame);
    };
  }, [featured.length]);

  return (
    <div className="relative overflow-hidden">
      <section className="relative mx-auto grid min-h-[100svh] max-w-[1400px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-[var(--stage-muted)]">
            <span className="stage-live" />
            {profile?.status || "Build in public"} · scene {String(active + 1).padStart(2, "0")}
          </p>
          <h1 className="title-sweep font-serif text-[clamp(4.8rem,14vw,10rem)] leading-[0.78] tracking-[-0.05em]">
            {name.split("").map((letter, index) => (
              <span key={`${letter}-${index}`} className="title-letter inline-block" style={{ animationDelay: `${index * 55}ms` }}>
                {letter}
              </span>
            ))}
          </h1>
          <p key={whisper} className="film-wipe mt-4 text-2xl font-medium tracking-[-0.03em] text-[var(--stage-signal)] sm:text-4xl">
            {WHISPERS[whisper]}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
            <span className="rounded-full border border-[var(--stage-signal)] px-3 py-1 text-[var(--stage-signal)]">
              Founder · {CV.company.name.split(" (")[0]}
            </span>
            <span className="text-[var(--stage-muted)]">SSIP 2.0 grantee · ex-AI/ML lead, GDG IIIT Surat</span>
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--stage-muted)]">
            {PUBLIC_WORK.length} original repositories, {CV.roles.length} roles from the resumes, and one rule under the title: finish the scene you are in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="stage-button stage-button-solid">Open the board <ArrowUpRight className="h-4 w-4" /></Link>
            <Link href="/journey" className="stage-button">Journey</Link>
            <Link href="/cv" className="stage-button">CV</Link>
            <a href="https://github.com/Jeevant010" target="_blank" rel="noreferrer" className="stage-button"><Github className="h-4 w-4" /> GitHub</a>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              [counts.repos, "repos"],
              [counts.featured, "featured"],
              [counts.awards, "awards"],
            ].map(([value, label]) => (
              <div key={String(label)} className="stage-panel px-4 py-3">
                <div className="font-serif text-4xl">{value}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--stage-muted)]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="skill-orbit absolute inset-0">
              {ORBIT.map((word, index) => (
                <span
                  key={word}
                  className="absolute left-1/2 top-1/2 text-[11px] uppercase tracking-[0.18em] text-[var(--stage-signal)]"
                  style={{ transform: `rotate(${index * 45}deg) translateY(-9.5rem) rotate(-${index * 45}deg)` }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
          <Spotlight item={spotlight} index={active} total={featured.length} onPick={setActive} />
        </div>
      </section>

      <div className="border-y border-[var(--stage-line)] py-4">
        <div className="stage-marquee text-sm uppercase tracking-[0.22em] text-[var(--stage-muted)]">
          <div className="stage-marquee-track">
            <span>{marquee}</span>
            <span>{marquee}</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden py-14">
        <div className="mb-6 flex items-end justify-between px-5 sm:px-8">
          <h2 className="font-serif text-5xl tracking-[-0.04em]">Now playing</h2>
          <p className="select-prompt text-[11px] uppercase tracking-[0.2em] text-[var(--stage-signal)]">Hover to hold</p>
        </div>
        <div className="rail-track px-5">
          {[...featured, ...featured].map((item, index) => (
            <Link key={`${item.slug}-${index}`} href={`/projects/${item.slug}`} className="stage-panel quest-card w-[20rem] shrink-0 p-6">
              <span className="card-sheen" aria-hidden />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--stage-signal)]">{item.lane}</p>
              <h3 className="mt-4 font-serif text-3xl">{item.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--stage-muted)]">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        <RevealOnScroll>
          <div className="grid gap-3 sm:grid-cols-5">
            {lanes.map((lane, index) => (
              <div key={lane.lane} className="stage-panel float-chip p-4" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--stage-muted)]">{lane.lane}</div>
                <div className="mt-2 font-serif text-4xl">{lane.count}</div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--stage-line)]">
                  <div className="xp-fill" style={{ width: `${(lane.count / PUBLIC_WORK.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-serif text-5xl tracking-[-0.04em]">Every public name</h2>
          <Link href="/projects" className="text-sm text-[var(--stage-muted)] underline-offset-4 hover:underline">Filter them</Link>
        </div>
        <RevealOnScroll>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_WORK.filter((item) => item.lane !== "Lab").slice(0, 24).map((item, index) => (
              <Link
                key={item.slug}
                href={`/projects/${item.slug}`}
                className="stage-rise rounded-full border border-[var(--stage-line)] px-3 py-2 text-sm transition hover:-translate-y-1 hover:border-[var(--stage-signal)] hover:text-[var(--stage-signal)]"
                style={{ animationDelay: `${Math.min(index * 18, 400)}ms` }}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-4 px-5 pb-20 sm:px-8 md:grid-cols-2">
        {featured.map((item, index) => (
          <TiltCard key={item.slug} className="h-full">
            <article className="stage-panel quest-card h-full p-6 sm:p-8">
              <span className="card-sheen" aria-hidden />
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--stage-muted)]">
                <span>Lvl {String(index + 1).padStart(2, "0")} · {item.lane}</span>
                <span className="select-prompt">Select</span>
              </div>
              <h3 className="mt-5 font-serif text-4xl tracking-[-0.04em]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--stage-muted)]">{item.description}</p>
              <div className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--stage-line)]">
                <div className="xp-fill" style={{ width: `${78 - index * 5}%` }} />
              </div>
              <Link href={`/projects/${item.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm">
                Enter scene <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          </TiltCard>
        ))}
      </section>
    </div>
  );
}

function Spotlight({
  item,
  index,
  total,
  onPick,
}: {
  item: PublicWork;
  index: number;
  total: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="stage-panel quest-card relative z-10 min-h-[26rem] p-6 sm:p-8">
      <span className="card-sheen" aria-hidden />
      <div className="orbit-ring" />
      <div className="relative flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--stage-muted)]">
        <span>Now showing</span>
        <span className="text-[var(--stage-signal)]">Lvl {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div key={item.slug} className="film-wipe relative mt-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--stage-signal)]">{item.lane}</p>
        <h2 className="mt-2 font-serif text-5xl leading-[0.95] tracking-[-0.04em]">{item.title}</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--stage-muted)]">{item.description}</p>
        <Link href={`/projects/${item.slug}`} className="stage-button mt-6">Enter scene <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex gap-2">
        {Array.from({ length: total }).map((_, dot) => (
          <button
            key={dot}
            type="button"
            aria-label={`Show scene ${dot + 1}`}
            onClick={() => onPick(dot)}
            className={`h-1 flex-1 rounded-full ${dot === index ? "bg-[var(--stage-signal)]" : "bg-[var(--stage-line)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
