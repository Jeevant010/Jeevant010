import Link from "next/link";
import { CV } from "@/lib/catalog/cv";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto grid max-w-[1100px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <PageHeader
            eyebrow="Profile"
            title={CV.name}
            description={`${CV.role} at ${CV.education.school}. ${CV.summary}`}
            actions={
              <>
                <Link href="/cv" className="stage-button stage-button-solid">Full CV</Link>
                <Link href="/journey" className="stage-button">Journey</Link>
              </>
            }
          />
        </div>
        <div className="grid gap-4">
          <article className="stage-panel overflow-hidden">
            <img
              src={CV.portrait}
              alt="Jeevant Mudgil"
              className="h-80 w-full object-cover object-top"
            />
            <div className="p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--stage-signal)]">Founder · current</p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em]">{CV.company.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--stage-muted)]">{CV.company.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CV.company.metrics.map((metric) => (
                  <span
                    key={metric.label}
                    className="rounded-full border border-[var(--stage-line)] px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
                  >
                    {metric.value} {metric.label}
                  </span>
                ))}
              </div>
              <a
                href={CV.company.site}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm text-[var(--stage-signal)] underline-offset-4 hover:underline"
              >
                {CV.company.site.replace("https://", "")}
              </a>
            </div>
          </article>

          {CV.skills.map((row, index) => (
            <article key={row.group} className="stage-panel stage-rise p-6" style={{ animationDelay: `${index * 70}ms` }}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--stage-signal)]">{row.group}</p>
              <p className="mt-3 text-lg leading-7">{row.items}</p>
            </article>
          ))}
          <article className="stage-panel p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--stage-signal)]">Now</p>
            <p className="mt-3 text-lg leading-7">{CV.education.degree}. {CV.education.detail}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
