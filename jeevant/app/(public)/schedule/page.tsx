import Link from "next/link";
import { getDailyTasks } from "@/lib/actions/task.actions";
import { getDaySchedules } from "@/lib/actions/schedule.actions";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const tasks = await getDailyTasks();
  const openTasks = tasks.filter((task: any) => !task.isCompleted);
  const completedTasks = tasks.filter((task: any) => task.isCompleted);
  const primaryTask = openTasks[0];
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysSchedule = await getDaySchedules(todayISO);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),transparent_35%),linear-gradient(180deg,#120b11,#070707)] p-8 shadow-2xl sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-300">Schedule</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">A simple view of the day, week, and current priorities.</h1>
          <p className="text-lg leading-8 text-slate-300">
            This is the planning page people can actually understand. The private planner can hold the full detail, while this page shows the current shape of the day.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {[
          { label: "Open tasks", value: openTasks.length, icon: Target },
          { label: "Completed tasks", value: completedTasks.length, icon: CheckCircle2 },
          { label: "Today", value: tasks.length, icon: CalendarDays },
          { label: "Focus", value: "Daily", icon: Clock3 },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
            <item.icon className="h-6 w-6 text-pink-300" />
            <div className="mt-4 text-3xl font-black text-white">{item.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Today’s plan</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">From backend tasks</span>
          </div>
          <div className="mt-6 space-y-4">
            {todaysSchedule && todaysSchedule.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Schedule</div>
                <div className="mt-2 text-xl font-semibold text-white">{todaysSchedule[0].title}</div>
                <div className="text-xs text-slate-400">{new Date(todaysSchedule[0].start).toLocaleTimeString()}</div>
              </div>
            ) : primaryTask ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">No scheduled events today</div>
                <div className="mt-2 text-xl font-semibold text-white">Focus on: {primaryTask.title}</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-500">No scheduled events today. Add tasks in the private planner to populate the schedule.</div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {openTasks.slice(0, 4).map((task: any) => (
                <div key={task._id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Task</div>
                  <div className="mt-2 text-sm font-semibold text-white">{task.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/10 to-transparent p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">How to use this page</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>Show the current day at a glance.</p>
            <p>Keep the real task editing in the admin/planner side.</p>
            <p>Use it to explain what you are focused on without making visitors dig around.</p>
          </div>
          <Link href="/planner/daily" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            Open planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
