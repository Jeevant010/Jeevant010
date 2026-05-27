import Link from "next/link";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";
import { getLearning } from "@/lib/actions/learning.actions";
import { BadgeCheck, Code2, Layers3, Workflow, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpertisePage() {
  const [profile, projects, learning] = await Promise.all([getProfile(), getProjects(), getLearning()]);
  const publicProjects = projects.filter((project: any) => project.visibility === "public");
  const stack = Array.from(
    new Set(
      projects.flatMap((project: any) => project.techStack || [])
    )
  ).slice(0, 12);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_35%),linear-gradient(180deg,#0d1117,#050607)] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Expertise</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">What I can build, maintain, and improve.</h1>
          <p className="text-lg leading-8 text-slate-300">
            This page is the practical version of the skills section. It turns the resume into something more specific and more useful.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <Code2 className="h-6 w-6 text-sky-300" />
          <h2 className="mt-4 text-xl font-bold text-white">Frontend</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Interfaces, dashboards, admin flows, responsive layouts, and design systems.</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <Workflow className="h-6 w-6 text-emerald-300" />
          <h2 className="mt-4 text-xl font-bold text-white">Backend</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">MongoDB, server actions, data models, and content workflows.</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <Layers3 className="h-6 w-6 text-violet-300" />
          <h2 className="mt-4 text-xl font-bold text-white">Product thinking</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Turning scattered work into pages people can understand quickly.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Core stack</h2>
            <BadgeCheck className="h-5 w-5 text-sky-300" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {stack.length === 0 ? (
              <div className="text-sm text-slate-500">Add project tech stacks in the admin panel to populate this area.</div>
            ) : (
              stack.map((item: string) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                  {item}
                </span>
              ))
            )}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Projects</div>
              <div className="mt-2 text-3xl font-black text-white">{publicProjects.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Learning items</div>
              <div className="mt-2 text-3xl font-black text-white">{learning.length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/10 to-transparent p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">Where I’m strongest</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>Building clean interfaces that feel polished and easy to navigate.</p>
            <p>Connecting the public site and admin side to the same backend data.</p>
            <p>Creating structured content pages that can grow without becoming messy.</p>
            <p>Using the portfolio as proof of delivery, not just a gallery of screenshots.</p>
          </div>
          <Link href="/projects" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            See projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white">How this page should evolve</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin editable</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Frontend skills and frameworks",
            "Backend tools and databases",
            "Communication, ownership, and product thinking",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-6 text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
