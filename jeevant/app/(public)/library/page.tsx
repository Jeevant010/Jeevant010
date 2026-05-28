import { getLearning } from "@/lib/actions/learning.actions";
import { getNotes } from "@/lib/actions/note.actions";
import { LibraryBig, BookMarked, FileSearch2, BookOpenText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [learning, notes] = await Promise.all([getLearning(), getNotes()]);
  const progressWidths = ["w-[0%]", "w-[20%]", "w-[40%]", "w-[60%]", "w-[80%]", "w-full"];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-shell-border bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_35%),linear-gradient(180deg,var(--color-shell-surface),var(--color-shell-bg))] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300">Library</p>
          <h1 className="text-4xl font-black tracking-tight text-shell-text sm:text-6xl">The books, references, and learning trail.</h1>
          <p className="text-lg leading-8 text-shell-muted">
            This page can hold reading lists, course progress, references, and the things that shape your thinking.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <LibraryBig className="h-6 w-6 text-violet-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Reading list</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">Books, articles, and longer-form material belong here.</p>
        </div>
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <BookMarked className="h-6 w-6 text-sky-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Tracked learning</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">Courses and resources can be tracked with backend data.</p>
        </div>
        <div className="rounded-[1.75rem] border border-shell-border bg-shell-surface p-6">
          <BookOpenText className="h-6 w-6 text-amber-300" />
          <h2 className="mt-4 text-xl font-bold text-shell-text">Useful notes</h2>
          <p className="mt-2 text-sm leading-6 text-shell-muted">Takeaways from what you read can stay with the source.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-shell-border bg-shell-surface p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-shell-border pb-4">
            <h2 className="text-2xl font-bold text-shell-text">Learning catalog</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-shell-muted">Backend</span>
          </div>
          <div className="mt-6 space-y-4">
            {learning.length === 0 ? (
              <div className="text-sm text-shell-muted">Add books, courses, or papers from the admin area.</div>
            ) : (
              learning.map((item: any) => (
                <div key={item._id} className="rounded-2xl border border-shell-border bg-shell-bg/30 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-shell-text">{item.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.25em] text-shell-muted">{item.platform || "Reference"}</div>
                    </div>
                    <span className="rounded-full border border-shell-border bg-shell-text/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-shell-muted">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-shell-surface">
                    <div
                      className={`h-full rounded-full bg-violet-300 ${progressWidths[Math.min(progressWidths.length - 1, Math.floor(((item.totalModules ? (item.completedModules / item.totalModules) * 100 : 0)) / 20))]}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-shell-border bg-shell-surface p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-shell-border pb-4">
            <FileSearch2 className="h-5 w-5 text-violet-300" />
            <h2 className="text-2xl font-bold text-shell-text">Reading notes</h2>
          </div>
          <div className="mt-6 space-y-4">
            {notes.length === 0 ? (
              <div className="text-sm text-shell-muted">Use notes to store summaries, insights, or quotes from what you read.</div>
            ) : (
              notes.slice(0, 6).map((note: any) => (
                <div key={note._id} className="rounded-2xl border border-shell-border bg-shell-bg/30 p-4">
                  <div className="text-sm font-semibold text-shell-text">{note.title}</div>
                  <p className="mt-2 text-sm leading-6 text-shell-muted">{note.content || "Convert this into a paper summary or reading note."}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
