import Link from "next/link";
import { CV } from "@/lib/catalog/cv";

export const dynamic = "force-static";

export default function JourneyPage() {
  const beats = [
    { when: CV.education.when, kicker: "School", title: CV.education.school, body: `${CV.education.degree}. ${CV.education.detail}` },
    ...CV.roles.map((role) => ({
      when: role.when,
      kicker: role.place,
      title: role.title,
      body: `${role.org}. ${role.points[0]}`,
    })),
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-60" />
      <div className="relative mx-auto max-w-[1100px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">The journey</p>
        <h1 className="mt-4 max-w-3xl font-serif text-6xl leading-[0.9] tracking-[-0.045em] sm:text-7xl">
          One timeline. The roles on the resumes.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--stage-muted)]">
          Quiz attendance and one-day volunteer lines are off this page. What remains is school, the internships, the campus lead role, and the marks that show up on the CV.
        </p>

        <ol className="relative mt-16 space-y-0 border-l border-[var(--stage-line)] pl-8">
          {beats.map((beat, index) => (
            <li key={`${beat.title}-${beat.when}`} className="stage-rise relative pb-12" style={{ animationDelay: `${index * 80}ms` }}>
              <span className="absolute -left-[2.4rem] top-1 h-3 w-3 rounded-full border border-[var(--stage-signal)] bg-[var(--stage-ink)]" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--stage-signal)]">{beat.when} · {beat.kicker}</p>
              <h2 className="mt-2 font-serif text-4xl tracking-[-0.04em]">{beat.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--stage-muted)]">{beat.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-4">
          <h2 className="font-serif text-5xl tracking-[-0.04em]">Marks on the record</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CV.marks.map((mark) => (
              <article key={mark.name} className="stage-panel quest-card p-6">
                <span className="card-sheen" aria-hidden />
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--stage-signal)]">{mark.when}</p>
                <h3 className="mt-3 font-serif text-3xl tracking-[-0.03em]">{mark.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--stage-muted)]">{mark.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <Link href="/cv" className="stage-button stage-button-solid mt-12">
          Open the full CV
        </Link>
      </div>
    </div>
  );
}
