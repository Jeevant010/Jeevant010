import Link from "next/link";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";
import { ArrowRight, Briefcase, Award, MapPinned, Route } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const [profile, sheet, projects] = await Promise.all([getProfile(), getCharacterSheet(), getProjects()]);
  const currentRole = sheet.quests[0];
  const sortedProjects = projects
    .filter((project: any) => project.startDate)
    .sort((left: any, right: any) => new Date(right.startDate).getTime() - new Date(left.startDate).getTime());

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,#0f1218,#06080d)] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">Journey</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">The story behind the resume.</h1>
          <p className="text-lg leading-8 text-slate-300">
            This page shows the work path, responsibilities, and milestones that shaped the portfolio.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <Briefcase className="h-6 w-6 text-blue-300" />
          <div className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">Current role</div>
          <div className="mt-2 text-xl font-semibold text-white">{profile.title}</div>
          <div className="mt-2 text-sm text-slate-400">{profile.name}</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <MapPinned className="h-6 w-6 text-amber-300" />
          <div className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">Current focus</div>
          <div className="mt-2 text-xl font-semibold text-white">Build, write, ship</div>
          <div className="mt-2 text-sm text-slate-400">Every page should explain what was built and why.</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <Award className="h-6 w-6 text-emerald-300" />
          <div className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">Latest milestone</div>
          <div className="mt-2 text-xl font-semibold text-white">Backend-backed portfolio</div>
          <div className="mt-2 text-sm text-slate-400">Editing and public display now come from the same source.</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Experience timeline</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">From backend data</span>
          </div>
          <div className="mt-6 space-y-5 border-l border-white/10 pl-6">
            {sheet.quests.length === 0 ? (
              <div className="text-sm text-slate-500">Add jobs, internships, or freelance work from the admin panel.</div>
            ) : (
              sheet.quests.map((quest: any) => (
                <div key={quest._id} className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-blue-300" />
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-semibold text-white">{quest.role}</div>
                        <div className="mt-1 text-sm text-slate-400">{quest.company}</div>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                        Experience
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{quest.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">What this page should answer</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>What roles have I done?</li>
              <li>What responsibilities did I own?</li>
              <li>What changed because of my work?</li>
              <li>What should a recruiter see first?</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Next step</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Use the admin panel to add the exact roles, responsibilities, and outcomes you want displayed here.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Contact me <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Route map</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Project timeline</h2>
          </div>
          <Route className="h-6 w-6 text-blue-300" />
        </div>
        {sortedProjects.length === 0 ? (
          <div className="mt-6 text-sm text-slate-500">Add project start and end dates in the CMS to show a chronological project route here.</div>
        ) : (
          <div className="mt-6 grid gap-4">
            {sortedProjects.map((project: any, index: number) => {
              const start = project.startDate ? new Date(project.startDate) : null;
              const end = project.endDate ? new Date(project.endDate) : null;
              return (
                <div key={project._id} className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{index + 1}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{project.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{project.description}</div>
                    <div className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                      {start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "No start date"}
                      {end ? ` - ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : project.isOngoing ? " - present" : ""}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="relative h-4 w-full overflow-hidden rounded-full border border-white/10 bg-black/20">
                      <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 ${project.isOngoing ? "w-[88%]" : "w-[72%]"}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
