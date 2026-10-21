import type { ReactNode } from "react";
import { CV } from "@/lib/catalog/cv";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-static";

export const metadata = {
  title: "CV · Jeevant Mudgil",
  description: "Curriculum vitae for Jeevant Mudgil, drawn from his resumes.",
};

export default function CvPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-40" />
      <article className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <PageHeader
          eyebrow="Curriculum vitae"
          title={CV.name}
          description={`${CV.role} · ${CV.location}. ${CV.summary}`}
        />

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <a className="underline-offset-4 hover:underline" href={`mailto:${CV.email}`}>{CV.email}</a>
          <span className="text-[var(--stage-muted)]">{CV.phone}</span>
          {CV.links.map((link) => (
            <a key={link.href} href={link.href} className="text-[var(--stage-signal)] underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>

        <Section title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-3xl tracking-[-0.03em]">{CV.education.school}</h3>
            <span className="text-sm text-[var(--stage-muted)]">{CV.education.when}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--stage-paper)]">{CV.education.degree}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--stage-muted)]">{CV.education.detail}</p>
        </Section>

        <Section title="Experience">
          <div className="space-y-8">
            {CV.roles.map((role) => (
              <div key={role.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-3xl tracking-[-0.03em]">{role.title}</h3>
                  <span className="text-sm text-[var(--stage-muted)]">{role.when}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--stage-signal)]">{role.org} · {role.place}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--stage-muted)]">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Selected work">
          <div className="space-y-5">
            {CV.focus.map((item) => (
              <div key={item.name}>
                <h3 className="font-serif text-2xl">{item.name}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--stage-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <div className="space-y-2 text-sm leading-6">
            {CV.skills.map((row) => (
              <p key={row.group}>
                <span className="text-[var(--stage-paper)]">{row.group}. </span>
                <span className="text-[var(--stage-muted)]">{row.items}</span>
              </p>
            ))}
          </div>
        </Section>

        <Section title="Marks and certificates">
          <ul className="space-y-3 text-sm leading-6 text-[var(--stage-muted)]">
            {CV.marks.map((mark) => (
              <li key={mark.name}>
                <span className="text-[var(--stage-paper)]">{mark.name}.</span> {mark.detail}
                <span className="text-[var(--stage-signal)]"> {mark.when}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Reading">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--stage-muted)]">
            {CV.reading.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 border-t border-[var(--stage-line)] pt-8">
      <h2 className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
