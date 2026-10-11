import Link from "next/link";
import { CV } from "@/lib/catalog/cv";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto grid max-w-[1100px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">Profile</p>
          <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.045em]">{CV.name}</h1>
          <p className="mt-4 text-lg text-[var(--stage-muted)]">{CV.role} at {CV.education.school}.</p>
          <p className="mt-6 text-sm leading-7 text-[var(--stage-muted)]">{CV.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cv" className="stage-button stage-button-solid">Full CV</Link>
            <Link href="/journey" className="stage-button">Journey</Link>
          </div>
        </div>
        <div className="grid gap-4">
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
