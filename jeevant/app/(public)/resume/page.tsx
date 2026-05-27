import Link from "next/link";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Download, FileText, Star, BookOpen, ChartNoAxesCombined } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const [profile, projects, sheet] = await Promise.all([getProfile(), getProjects(), getCharacterSheet()]);
  const publicProjects = projects.filter((project: any) => project.visibility === "public");
  const latestRole = sheet.quests[0];
  const timelineProjects = projects
    .filter((project: any) => project.startDate)
    .sort((left: any, right: any) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime());

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_35%),linear-gradient(180deg,#17140f,#090807)] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Resume</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">A clean, readable summary of my background.</h1>
          <p className="text-lg leading-8 text-slate-300">
            This page is for people who want the concise version: who I am, what I’ve worked on, and how to contact me.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Summary</p>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Graph view</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Project mini-Gantt</h2>
              </div>
              <ChartNoAxesCombined className="h-6 w-6 text-amber-300" />
            </div>
            {timelineProjects.length === 0 ? (
              <div className="mt-6 text-sm text-slate-500">Add project start dates in the CMS to render a public timeline bar view here.</div>
            ) : (
              <div className="mt-6 space-y-4">
                {timelineProjects.map((project: any, index: number) => {
                  const startDate = new Date(project.startDate);
                  const startLabel = startDate.toLocaleDateString(undefined, { month: "short", year: "numeric" });
                  const spanClass = project.isOngoing ? "w-[84%]" : index % 3 === 0 ? "w-[66%]" : index % 3 === 1 ? "w-[74%]" : "w-[58%]";

                  return (
                    <div key={project._id} className="grid gap-3 md:grid-cols-[0.75fr_1.25fr] md:items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">{project.title}</div>
                        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{startLabel}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/20 p-1">
                        <div className={`rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 py-2 ${spanClass}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
              <h2 className="mt-2 text-2xl font-bold text-white">{profile.name}</h2>
            </div>
            <FileText className="h-6 w-6 text-amber-300" />
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>{profile.title}</p>
            <p>Focused on building useful web products, data-backed portfolios, and clear content systems.</p>
            <p>Open to full-time roles, freelance work, and projects where the end result needs to be organized and easy to maintain.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest role</div>
              <div className="mt-2 text-lg font-semibold text-white">{latestRole ? latestRole.role : "Add role from admin"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Projects</div>
              <div className="mt-2 text-lg font-semibold text-white">{publicProjects.length} public projects</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Star className="h-5 w-5 text-amber-300" />
              <h2 className="text-2xl font-bold text-white">Highlights</h2>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <p>Strong front-end presentation and content organization.</p>
              <p>Backend-backed portfolio structure with editable data.</p>
              <p>Game-inspired presentation, but the site still behaves like a real portfolio.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <BookOpen className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-bold text-white">Download / contact</h2>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-300">
              Use the resume link in the admin profile if you want a downloadable version, or send a message if you want to discuss work.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={profile.resumeLink || "#"} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-blue-100">
                Download resume <Download className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                Contact me
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
