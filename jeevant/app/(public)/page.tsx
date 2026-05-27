import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, Code2, FileText, FolderOpen, LayoutDashboard, MapPinned, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { getDailyTasks } from "@/lib/actions/task.actions";
import { getLearning } from "@/lib/actions/learning.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { getCharacterSheet } from "@/lib/actions/rpg.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import { getProjects } from "@/lib/actions/project.action";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, projects, learning, notes, sheet, tasks] = await Promise.all([
    getProfile(),
    getProjects(),
    getLearning(),
    getNotes(),
    getCharacterSheet(),
    getDailyTasks(),
  ]);

  const publicProjects = projects.filter((project: any) => project.visibility === "public");
  const activeTasks = tasks.filter((task: any) => !task.isCompleted);
  const currentFocus = activeTasks[0]?.title || "Build a sharper public portfolio and keep the admin data flowing.";
  const latestJourney = sheet.quests[0];
  const highlights = notes.slice(0, 3);
  const learningCount = learning.length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_40%),linear-gradient(180deg,#0b0b0b,#050505)] px-6 py-16 shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {profile.status}
            </div>

            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">Portfolio / Work / Research / Writing</p>
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {profile.title}. This site is a living portfolio for projects, schedule, journey, research notes, and the practical proof behind the resume.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-blue-100">
                View projects <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/journey" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                Read journey <MapPinned className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20">
                Contact me <LayoutDashboard className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[
              { label: "Public projects", value: publicProjects.length, icon: FolderOpen },
              { label: "Current tasks", value: activeTasks.length, icon: Briefcase },
              { label: "Research notes", value: notes.length, icon: ScrollText },
              { label: "Learning items", value: learningCount, icon: BookOpen },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <item.icon className="h-5 w-5 text-blue-300" />
                <div className="mt-4 text-3xl font-black text-white">{item.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Current focus</p>
              <h2 className="mt-2 text-2xl font-bold text-white">What I am working on right now</h2>
            </div>
            <Sparkles className="h-6 w-6 text-blue-300" />
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{currentFocus}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {activeTasks.slice(0, 2).map((task: any) => (
              <div key={task._id} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Schedule</div>
                <div className="mt-3 text-base font-semibold text-white">{task.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">Journey</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Experience in plain language</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm font-semibold text-white">Latest role</div>
              <div className="mt-2 text-sm text-slate-300">{latestJourney ? `${latestJourney.role} at ${latestJourney.company}` : "Add your latest role from the admin panel."}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm font-semibold text-white">Public reading</div>
              <div className="mt-2 text-sm text-slate-300">Research notes and learning entries are ready to turn into a books and papers archive.</div>
            </div>
            <Link href="/journey" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Open journey page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Selected work</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Featured projects</h2>
            </div>
            <Code2 className="h-6 w-6 text-blue-300" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {publicProjects.slice(0, 4).map((project: any) => (
              <Link key={project._id} href="/projects" className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-blue-400/40 hover:bg-white/5">
                <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Project</div>
                <div className="mt-3 text-lg font-semibold text-white group-hover:text-blue-200">{project.title}</div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{project.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Research</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Recent notes</h2>
          <div className="mt-6 space-y-4">
            {highlights.map((note: any) => (
              <div key={note._id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold text-white">{note.title}</div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{note.content || "Use this space for books, papers, and research summaries."}</p>
              </div>
            ))}
          </div>
          <Link href="/research" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            Open research page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">More pages</p>
            <h2 className="mt-2 text-2xl font-bold text-white">The site should answer more than one question.</h2>
          </div>
          <Sparkles className="h-6 w-6 text-blue-300" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/expertise", label: "Expertise", description: "Skills, strengths, and tech stack", icon: Code2 },
            { href: "/schedule", label: "Schedule", description: "Daily focus and planning", icon: CalendarDays },
            { href: "/responsibilities", label: "Responsibilities", description: "What I own and maintain", icon: ShieldCheck },
            { href: "/resume", label: "Resume", description: "Short summary and download", icon: FileText },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-blue-400/40 hover:bg-white/5">
              <item.icon className="h-5 w-5 text-blue-300" />
              <div className="mt-4 text-lg font-semibold text-white group-hover:text-blue-200">{item.label}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}