import { getNotes } from "@/lib/actions/note.actions";
import { getLearning } from "@/lib/actions/learning.actions";
import { BookOpen, FileText, Mic2, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [notes, learning] = await Promise.all([getNotes(), getLearning()]);
  const progressWidths = ["w-[0%]", "w-[20%]", "w-[40%]", "w-[60%]", "w-[80%]", "w-full"];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-shell-border bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_35%),linear-gradient(180deg,var(--color-shell-surface),var(--color-shell-bg))] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Research</p>
          <h1 className="text-4xl font-black tracking-tight text-shell-text sm:text-6xl">Notes, papers, and the ideas worth keeping.</h1>
          <p className="text-lg leading-8 text-shell-muted">
            This page is the written trail behind the work: what I read, what I learned, and what I want to remember.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <Search className="h-6 w-6 text-emerald-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Searchable notes</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">Store articles, observations, and summaries in one place.</p>
        </div>
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <BookOpen className="h-6 w-6 text-sky-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Reading list</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">Books, courses, and papers can all live here.</p>
        </div>
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <Mic2 className="h-6 w-6 text-violet-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Thought log</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">A place for the ideas you want to build on later.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-shell-border bg-shell-surface p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-shell-border pb-4">
            <h2 className="text-2xl font-bold text-shell-text">Research notes</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-shell-muted">From the backend</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {notes.length === 0 ? (
              <div className="col-span-full text-sm text-shell-muted">Add notes, summaries, or reference material from the admin area.</div>
            ) : (
              notes.slice(0, 8).map((note: any) => (
                <div key={note._id} className="rounded-2xl border border-shell-border bg-shell-bg/30 p-5">
                  <div className="text-sm font-semibold text-shell-text">{note.title}</div>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-shell-muted">{note.content || "Use this for book notes, paper summaries, or research ideas."}</p>
                  {note.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {note.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full border border-shell-border bg-shell-text/5 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-shell-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-shell-border bg-shell-surface p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-shell-text">Learning stack</h2>
            <div className="mt-5 space-y-4">
              {learning.length === 0 ? (
                <div className="text-sm text-shell-muted">Add courses, books, or papers in the learning section.</div>
              ) : (
                learning.map((item: any) => (
                  <div key={item._id} className="rounded-2xl border border-shell-border bg-shell-bg/30 p-4">
                    <div className="text-sm font-semibold text-shell-text">{item.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.25em] text-shell-muted">{item.platform || "Reference"}</div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-shell-surface">
                      <div
                        className={`h-full rounded-full bg-emerald-300 ${progressWidths[Math.min(progressWidths.length - 1, Math.floor(((item.totalModules ? (item.completedModules / item.totalModules) * 100 : 0)) / 20))]}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-shell-border bg-gradient-to-br from-emerald-500/10 to-transparent p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-shell-text">Use this page for</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-shell-muted">
              <li>Books I have read</li>
              <li>Papers I have reviewed</li>
              <li>Ideas worth revisiting</li>
              <li>Topics I want to study next</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
