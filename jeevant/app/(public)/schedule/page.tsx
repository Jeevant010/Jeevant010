import Link from "next/link";

export const dynamic = "force-static";

export default function SchedulePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 stage-grid opacity-50" />
      <div className="relative mx-auto max-w-[800px] px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--stage-signal)]">Schedule</p>
        <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.045em]">No fake meetings on the public board.</h1>
        <p className="mt-6 text-base leading-7 text-[var(--stage-muted)]">
          The old calendar was filled with sample standups and client calls. Those rows are gone. The public schedule stays empty until a real date is worth posting.
        </p>
        <Link href="/journey" className="stage-button stage-button-solid mt-10">
          Read the timeline
        </Link>
      </div>
    </div>
  );
}
