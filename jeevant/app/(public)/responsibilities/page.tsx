import Link from "next/link";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProjects } from "@/lib/actions/project.action";
import { ArrowRight, ShieldCheck, ClipboardList, Users, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResponsibilitiesPage() {
  const [sheet, projects] = await Promise.all([getCharacterSheet(), getProjects()]);
  const activeProjects = projects.filter((project: any) => project.visibility === "public");
  const currentRole = sheet.quests[0];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_35%),linear-gradient(180deg,#0a1210,#050606)] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Responsibilities</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">What I own, what I maintain, and what people can expect from me.</h1>
          <p className="text-lg leading-8 text-slate-300">
            This page is the practical side of the portfolio. It explains responsibility in normal language instead of using system jargon.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {[
          { label: "Ownership", value: "High", icon: ShieldCheck },
          { label: "Visibility", value: "Public + Admin", icon: ClipboardList },
          { label: "Collaboration", value: "Shared", icon: Users },
          { label: "Data", value: activeProjects.length, icon: Database },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
            <item.icon className="h-6 w-6 text-emerald-300" />
            <div className="mt-4 text-3xl font-black text-white">{item.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Responsibilities I can describe clearly</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Resume-ready</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Build and maintain the personal website and admin flow",
              "Keep public content current and useful",
              "Track work, learning, and research in one place",
              "Present projects and experience in a recruiter-friendly way",
              "Keep the backend data organized and editable",
              "Turn notes and learning into visible portfolio value",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Current role</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {currentRole ? `${currentRole.role} at ${currentRole.company}` : "Add your latest work role in the backend."}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              This is where the site should explain what you are responsible for, what outcomes you own, and what you want visitors to understand quickly.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Good responsibilities page content</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>System ownership</li>
              <li>Content ownership</li>
              <li>Communication and collaboration</li>
              <li>Long-term maintenance</li>
            </ul>
            <Link href="/journey" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              See journey <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
