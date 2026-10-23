import Link from "next/link";
import { getLife, formatWhen } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CV · Jeevant Mudgil",
  description: "Curriculum vitae for Jeevant Mudgil: founder, backend engineer, AI/ML builder.",
};

export default async function CvPage() {
  const life = await getLife();
  const { profile, experiences, achievements } = life;

  return (
    <div className="document min-h-screen">
      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[17rem_1fr] lg:gap-16">
          <aside className="h-fit lg:sticky lg:top-24">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Curriculum vitae</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.9] tracking-[-0.05em]">
              {profile.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#4a463e]">{profile.title}</p>

            <div className="mt-7 space-y-2 text-sm">
              <a href={`mailto:${profile.email}`} className="block underline underline-offset-4">{profile.email}</a>
              <p className="text-[#4a463e]">{profile.phone}</p>
              <p className="text-[#4a463e]">{profile.location}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {profile.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="document-rule mt-8 pt-6">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#6d5429]">Education</p>
              <p className="mt-2 text-sm font-medium leading-6">{profile.education.school}</p>
              <p className="mt-1 text-sm text-[#4a463e]">{profile.education.degree}</p>
              <p className="mt-1 text-xs text-[#6a655b]">{profile.education.when}</p>
              <p className="mt-2 text-xs leading-5 text-[#4a463e]">{profile.education.detail}</p>
            </div>

            <div className="document-rule mt-6 pt-6">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#6d5429]">Skills</p>
              <div className="mt-3 space-y-3">
                {profile.skills.map((row) => (
                  <div key={row.group}>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6a655b]">{row.group}</p>
                    <p className="mt-1 text-xs leading-5">{row.items}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/contact" className="mt-8 inline-flex border border-[#1a1916] px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition hover:bg-[#1a1916] hover:text-[#f4f0e7]">
              Get in touch
            </Link>
          </aside>

          <main>
            <section>
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Summary</h2>
              <p className="mt-3 text-[15px] leading-8 text-[#2c2a25]">{profile.bio}</p>
            </section>

            <section className="document-rule mt-10 pt-8">
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Experience</h2>
              <div className="mt-6 space-y-8">
                {experiences.map((role) => (
                  <article key={`${role.company}-${role.role}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl leading-tight tracking-[-0.03em]">{role.role}</h3>
                      <span className="text-xs text-[#6a655b]">
                        {role.start ? formatWhen(role.start) : role.start}
                        {role.current ? " — present" : role.end ? ` — ${formatWhen(role.end)}` : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6d5429]">
                      {role.company}
                      {role.location ? ` · ${role.location}` : ""}
                    </p>
                    {role.description && (
                      <p className="mt-2 text-sm leading-7 text-[#4a463e]">{role.description}</p>
                    )}
                    {role.skills.length > 0 && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#6a655b]">
                        {role.skills.join(" · ")}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="document-rule mt-10 pt-8">
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Selected work</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {profile.company && (
                  <article className="border border-[#1a1916]/15 p-4">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#6a655b]">Founded · live</p>
                    <h3 className="mt-2 font-serif text-xl leading-tight">{profile.company.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#4a463e]">{profile.company.blurb}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#6d5429]">
                      {profile.company.metrics.map((metric) => `${metric.value} ${metric.label}`).join(" · ")}
                    </p>
                  </article>
                )}
                {life.projects
                  .filter((project) => project.featured)
                  .slice(0, 3)
                  .map((project) => (
                    <article key={project.slug} className="border border-[#1a1916]/15 p-4">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#6a655b]">{project.lane}</p>
                      <h3 className="mt-2 font-serif text-xl leading-tight">{project.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-[#4a463e]">{project.description}</p>
                    </article>
                  ))}
              </div>
            </section>

            <section className="document-rule mt-10 pt-8">
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Marks and certificates</h2>
              <ul className="mt-5">
                {achievements.map((mark) => (
                  <li key={mark.slug} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[#1a1916]/10 py-2.5">
                    <div>
                      <span className="text-sm font-medium">{mark.title}</span>
                      <span className="ml-2 text-xs text-[#6a655b]">{mark.description}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#6d5429]">
                      {mark.date ? new Date(mark.date).getFullYear() || mark.date : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="document-rule mt-10 pt-8">
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#6d5429]">Reading</h2>
              <ul className="mt-4 grid gap-2 text-sm text-[#4a463e] sm:grid-cols-2">
                {profile.reading.map((title) => (
                  <li key={title} className="border-t border-[#1a1916]/10 pt-2">
                    {title}
                  </li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
