import PrivateShell from "@/components/layout/PrivateShell";
import {
  checkInAction,
  endFocusAction,
  getTrackerOverview,
  logActivityAction,
  startActivityAction,
  startFocusAction,
  stopActivityAction,
} from "@/lib/actions/tracker.actions";
import { Timer, Square, Play, ClipboardCheck, Moon } from "lucide-react";

export const dynamic = "force-dynamic";

const KINDS = ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"];

function fmt(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

function time(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default async function TrackerPage() {
  const { activities, open, focus, totals } = await getTrackerOverview();

  return (
    <PrivateShell
      eyebrow="Comm center · life log"
      title="Tracker"
      description="Every block of the day: work, food, sleep, waste. Focus sessions check in on you."
      accent="rose"
      icon={<Timer className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <section className="panel-cyber p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
              {open ? "Currently" : "Start an activity"}
            </h2>

            {open ? (
              <div className="mt-3">
                <p className="text-lg font-bold text-shell-text">{open.label}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-shell-muted">
                  {open.kind} · since {time(open.start)}
                </p>
                <form action={stopActivityAction} className="mt-3">
                  <input type="hidden" name="id" value={open._id} />
                  <button className="flex w-full items-center justify-center gap-2 border border-rose-800/60 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/30">
                    <Square className="h-3.5 w-3.5" /> Stop
                  </button>
                </form>
              </div>
            ) : (
              <form action={startActivityAction} className="mt-3 flex flex-col gap-3">
                <input name="label" required placeholder="What are you doing?" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
                <select name="kind" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]">
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>{kind}</option>
                  ))}
                </select>
                <select name="intended" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]">
                  <option value="true">Intended</option>
                  <option value="false">Not intended (waste)</option>
                </select>
                <button className="flex items-center justify-center gap-2 border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
              </form>
            )}
          </section>

          <section className="panel-cyber p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Quick log</h2>
            <form action={logActivityAction} className="mt-3 flex flex-col gap-3">
              <input name="label" required placeholder="What did you do?" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
              <div className="grid grid-cols-2 gap-2">
                <select name="kind" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]">
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>{kind}</option>
                  ))}
                </select>
                <input name="minutes" type="number" min={1} placeholder="minutes" required className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
              </div>
              <button className="border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#d8cfbe]">
                Log it
              </button>
            </form>
          </section>

          <section className="panel-cyber p-5">
            <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
              <Moon className="h-4 w-4" /> Sleep debt
            </h2>
            <p className="mt-2 text-sm text-shell-text">
              {totals.sleep ? `${fmt(totals.sleep)} logged today` : "No sleep logged today."}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-shell-muted/70">
              Target 7h. Log naps and nights in quick log.
            </p>
          </section>
        </aside>

        <section className="space-y-4">
          <section className="panel-cyber p-5">
            <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">
              <ClipboardCheck className="h-4 w-4" /> Focus session
            </h2>

            {focus ? (
              <div className="mt-3">
                <p className="text-lg font-bold text-shell-text">{focus.intent}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-shell-muted">
                  started {time(focus.startedAt)} · {focus.checkIns?.length || 0} check-ins
                </p>
                <form action={checkInAction} className="mt-3 flex flex-col gap-2">
                  <input name="answer" placeholder="What are you doing right now?" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
                  <div className="flex gap-4 text-[10px] uppercase tracking-widest text-shell-muted">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="wasted" value="false" defaultChecked /> On task
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="wasted" value="true" /> Distracted
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 border border-[#c8b48a]/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/10">
                      Check in
                    </button>
                  </div>
                </form>
                <form action={endFocusAction} className="mt-2">
                  <input type="hidden" name="status" value="done" />
                  <button className="w-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-shell-muted hover:text-[#d8cfbe]">
                    End session
                  </button>
                </form>
              </div>
            ) : (
              <form action={startFocusAction} className="mt-3 flex flex-col gap-3">
                <input name="intent" required placeholder="What is the one task?" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
                <button className="flex items-center justify-center gap-2 border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
                  <Play className="h-3.5 w-3.5" /> Start focus
                </button>
              </form>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["deep_work", "eating", "sleep", "waste"].map((kind) => (
              <div key={kind} className="panel-cyber p-3">
                <div className="text-[9px] uppercase tracking-widest text-shell-muted">{kind.replace("_", " ")}</div>
                <div className="mt-1 text-lg font-bold text-shell-text">{fmt(totals[kind] || 0)}</div>
              </div>
            ))}
          </section>

          <section className="panel-cyber p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Today</h2>
            <div className="mt-3 flex max-h-[45vh] flex-col gap-2 overflow-y-auto custom-scrollbar">
              {activities.length === 0 && (
                <p className="py-6 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
                  Nothing logged today.
                </p>
              )}
              {activities.map((activity: any) => {
                const end = activity.end ? new Date(activity.end).getTime() : Date.now();
                const minutes = Math.max(0, Math.round((end - new Date(activity.start).getTime()) / 60_000));
                return (
                  <div key={activity._id} className="flex items-center gap-3 border-b border-white/5 pb-2 text-[11px]">
                    <span className="w-20 shrink-0 text-shell-muted">{time(activity.start)}</span>
                    <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-widest ${activity.kind === "waste" ? "border-rose-800/60 text-rose-300" : "border-white/10 text-shell-muted"}`}>
                      {activity.kind}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-shell-text">{activity.label}</span>
                    <span className="text-shell-muted">{fmt(minutes)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </PrivateShell>
  );
}
