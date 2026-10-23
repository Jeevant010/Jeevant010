import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLife } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile · Jeevant Mudgil",
  description: "Founder, backend engineer, and AI/ML builder based in Surat, India.",
};

export default async function AboutPage() {
  const life = await getLife();
  const { profile } = life;

  return (
    <div className="palace palace-light min-h-screen">
      <div className="mx-auto max-w-[1250px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <header className="editorial">
          <figure className="editorial-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatar} alt={profile.name} />
            <figcaption className="editorial-caption">
              {profile.location} · {profile.company.status}
            </figcaption>
          </figure>

          <div>
            <p className="palace-kicker">Profile · the person behind the record</p>
            <h1 className="mt-5 font-serif text-[clamp(3.6rem,8vw,7rem)] leading-[0.86] tracking-[-0.06em]">
              Jeevant
              <br />
              Mudgil<span className="text-[var(--signal)]">.</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">{profile.title}</p>

            <p className="editorial-drop mt-7 text-[15px] leading-8 text-[var(--paper)]/85">
              {profile.bio}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">School</dt>
                <dd className="mt-1 text-sm leading-6">{profile.education.school}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Degree</dt>
                <dd className="mt-1 text-sm leading-6">{profile.education.degree}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Founder</dt>
                <dd className="mt-1 text-sm leading-6">{profile.company.name}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Email</dt>
                <dd className="mt-1 text-sm leading-6">
                  <a href={`mailto:${profile.email}`} className="underline underline-offset-4">
                    {profile.email}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cv" className="palace-cta palace-cta-solid">
                Read the CV <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/journey" className="palace-cta">
                The journey
              </Link>
              {profile.links.slice(0, 3).map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="palace-cta">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-24 grid gap-10 border-t border-[var(--line)] pt-12 lg:grid-cols-[0.55fr_1.45fr]">
          <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em]">The short version</h2>
          <div className="space-y-5 text-[15px] leading-8 text-[var(--paper)]/85">
            <p>
              I study computer science at IIIT Surat and build systems that retrieve, reason, and ship. My public work
              sits in three lanes: retrieval and agentic AI, game tooling that drives Unreal Engine from outside the
              editor, and full-stack products with real deployments behind them.
            </p>
            <p>
              I founded Scholar Dive, an adaptive learning platform that grades and tutors with retrieval-grounded
              models. It went through the SSIP 2.0 grant process, ran a fifty-user beta at full uptime, and still owns
              the backend and deployment. Before that I led the AI/ML track at GDG IIIT Surat and ran the technical side
              of four campus events.
            </p>
            <p>
              The thing I optimize for is not the portfolio. It is the gap between a working prototype and something
              another person can use without me in the room.
            </p>
          </div>
        </section>

        <section className="mt-20 border-t border-[var(--line)] pt-12">
          <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em]">What I actually work with</h2>
          <div className="mt-8">
            {profile.skills.map((row) => (
              <div key={row.group} className="rule-row">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--signal)]">{row.group}</p>
                <p className="text-sm leading-7 text-[var(--paper)]/85">{row.items}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 border-t border-[var(--line)] pt-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="palace-kicker">Now</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em]">{profile.company.name}</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--muted)]">{profile.company.blurb}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.company.metrics.map((metric) => (
                <div key={metric.label} className="border border-[var(--line)] px-4 py-3">
                  <div className="font-serif text-3xl leading-none">{metric.value}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</div>
                </div>
              ))}
            </div>
            <a href={profile.company.site} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4">
              {profile.company.site.replace("https://", "")} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div>
            <p className="palace-kicker">Reading that fed the work</p>
            <ul className="mt-4">
              {profile.reading.slice(0, 6).map((title, index) => (
                <li key={title} className="flex gap-4 border-t border-[var(--line)] py-3 text-sm leading-6">
                  <span className="font-serif text-xl text-[var(--signal)]">{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
