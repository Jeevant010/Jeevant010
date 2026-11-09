import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLife, type LifeData } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journey · Jeevant Mudgil",
  description: "The full chronological record: school, roles, finals, grants, and the work in between.",
};

type Event = {
  year: string;
  sort: number;
  kind: "chapter" | "role" | "mark";
  title: string;
  org: string;
  when: string;
  body: string;
  tags: string[];
  chapter: boolean;
};

function yearOf(value: string | null): string {
  if (!value) return "Now";
  const match = value.match(/(19|20)\d{2}/);
  return match ? match[0] : "Now";
}

function whenOf(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthOf(value: string | null): number {
  if (!value) return 0;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.getMonth();
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const lowered = value.toLowerCase();
  const index = months.findIndex((month) => lowered.includes(month));
  return index < 0 ? 0 : index;
}

function buildEvents(life: LifeData): Event[] {
  const events: Event[] = [];

  for (const chapter of life.chapters) {
    events.push({
      year: chapter.year,
      sort: 0,
      kind: "chapter",
      title: chapter.title,
      org: chapter.place,
      when: chapter.year,
      body: chapter.body,
      tags: chapter.proof,
      chapter: true,
    });
  }

  for (const role of life.experiences) {
    const year = yearOf(role.start);
    const start = new Date(role.start);
    const end = role.end ? new Date(role.end) : null;
    const when = Number.isNaN(start.getTime())
      ? role.start
      : `${start.toLocaleDateString("en-US", { month: "short", year: "numeric" })} — ${
          end ? end.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "present"
        }`;
    events.push({
      year,
      sort: monthOf(role.start) + 1,
      kind: "role",
      title: role.role,
      org: role.company,
      when,
      body: role.description,
      tags: role.skills.slice(0, 5),
      chapter: false,
    });
  }

  for (const mark of life.achievements) {
    events.push({
      year: yearOf(mark.date),
      sort: monthOf(mark.date) + 2,
      kind: "mark",
      title: mark.title,
      org: mark.platform || "Record",
      when: whenOf(mark.date),
      body: mark.description,
      tags: [],
      chapter: false,
    });
  }

  return events;
}

export default async function JourneyPage() {
  const life = await getLife();
  const events = buildEvents(life);
  const years = Array.from(new Set(events.map((event) => event.year))).sort((a, b) =>
    a === "Now" ? 1 : b === "Now" ? -1 : Number(a) - Number(b)
  );

  return (
    <div className="palace relative min-h-screen">
      <div className="palace-stars opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        <header className="grid gap-10 border-b border-[var(--line)] pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="palace-kicker">The full record · {events.length} entries</p>
            <h1 className="palace-name mt-5 text-[clamp(4rem,12vw,10rem)]" style={{ lineHeight: 0.9 }} aria-label="Journey">
              Journey<span className="text-[var(--signal)]">.</span>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-[var(--muted)]">
              One timeline, in the order it happened. Chapters explain the arc; the ledger underneath holds the roles
              and the marks. Everything is either in the database or on a resume.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {life.stats.map((stat) => (
              <div key={stat.label} className="border border-[var(--line)] p-4">
                <p className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">{stat.label}</p>
                <p className="mt-1 font-serif text-3xl leading-none">{stat.value}</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[var(--muted)]/70">{stat.detail}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-14">
          {years.map((year) => {
            const yearEvents = events
              .filter((event) => event.year === year)
              .sort((a, b) => a.sort - b.sort);
            return (
              <section key={year} className="ledger-year">
                <div className="ledger-sticky">
                  <div className="ledger-year-number">{year}</div>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    {yearEvents.filter((event) => event.kind === "role").length} roles ·{" "}
                    {yearEvents.filter((event) => event.kind === "mark").length} marks
                  </p>
                </div>

                <div>
                  {yearEvents.map((event, index) => (
                    <article
                      key={`${event.year}-${event.title}-${index}`}
                      className={`ledger-event ${event.chapter ? "ledger-event-chapter" : ""}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--signal)]">
                          {event.kind === "chapter" ? "Chapter" : event.kind === "role" ? "Role" : "Mark"} · {event.when}
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">{event.org}</p>
                      </div>
                      <h2
                        className={`mt-2 tracking-[-0.03em] ${
                          event.chapter ? "font-serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.02]" : "text-lg font-medium text-[var(--paper)]"
                        }`}
                      >
                        {event.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--muted)]">{event.body}</p>
                      {event.tags.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                          {event.tags.map((tag) => (
                            <li key={tag} className="text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]/80">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--line)] pt-10">
          <div>
            <p className="palace-kicker">Next</p>
            <p className="mt-2 max-w-lg font-serif text-3xl leading-tight tracking-[-0.03em]">
              The record keeps growing. The next entry is the one being built now.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="palace-cta palace-cta-solid">
              See the work <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/cv" className="palace-cta">
              Full CV
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
