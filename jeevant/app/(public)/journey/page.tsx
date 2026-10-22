import Link from "next/link";
import { CV } from "@/lib/catalog/cv";
import PageHeader from "@/components/ui/PageHeader";

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
        <PageHeader
          eyebrow="The journey"
          title="One timeline. The roles on the resumes."
          description="Quiz attendance and one-day volunteer lines are off this page. What remains is school, the internships, the campus lead role, and the marks that show up on the CV."
        />

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

        <section className="mt-16">
          <h2 className="font-serif text-5xl tracking-[-0.04em]">Events and rooms I ran</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CV.events.map((event) => (
              <article key={event.name} className="stage-panel quest-card p-6">
                <span className="card-sheen" aria-hidden />
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--stage-muted)]">
                  <span>{event.when}</span>
                  <span className="text-[var(--stage-signal)]">{event.role}</span>
                </div>
                <h3 className="mt-3 font-serif text-3xl tracking-[-0.03em]">{event.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--stage-muted)]">{event.detail}</p>
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
