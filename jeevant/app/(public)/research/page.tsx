import { getNotes } from "@/lib/actions/note.actions";
import { BookOpen, FileText, Mic2, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const notes = await getNotes();

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

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[2rem] border border-shell-border bg-shell-surface p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-shell-border pb-4">
            <h2 className="text-2xl font-bold text-shell-text">Research & Notes</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-shell-muted">Archive</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {notes.length === 0 ? (
              <div className="col-span-full text-sm text-shell-muted">Add notes, summaries, or reference material from the admin area.</div>
            ) : (
              notes.map((note: any) => (
                <div key={note._id} className="rounded-2xl border border-shell-border bg-shell-bg/30 p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-lg font-semibold text-shell-text">{note.title}</div>
                    <p className="mt-3 text-sm leading-6 text-shell-muted">{note.content || "Use this for book notes, paper summaries, or research ideas."}</p>
                  </div>
                  {note.tags?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {note.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full border border-shell-border bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.1em] text-emerald-300">
                          #{tag}
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
          <div className="rounded-[2rem] border border-shell-border bg-gradient-to-br from-emerald-500/10 to-transparent p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-shell-text">Index</h2>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-shell-muted">
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> AI & Machine Learning</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-400"></div> Web Architecture</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-400"></div> Design Systems</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Computer Science</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
