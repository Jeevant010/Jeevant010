"use client";

import { useMemo, useState } from "react";

type ScheduleItem = {
  _id: string;
  title: string;
  start: string;
  end?: string;
  notes?: string;
  recurrence?: string;
  isRecurring?: boolean;
  colorCode?: string;
};

const colorMap: Record<string, string> = {
  slate: "border-slate-700 bg-slate-500/10 text-slate-200",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-100",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-100",
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, count: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + count);
  return value;
}

function groupByDate(items: ScheduleItem[]) {
  const grouped: Record<string, ScheduleItem[]> = {};
  for (const item of items) {
    const key = formatDate(new Date(item.start));
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}

export default function AdminCalendar({ schedules }: { schedules: ScheduleItem[] }) {
  const [mode, setMode] = useState<"day" | "week">("week");
  const [anchorDate, setAnchorDate] = useState(new Date());

  const grouped = useMemo(() => groupByDate(schedules), [schedules]);
  const todayKey = formatDate(startOfDay(anchorDate));
  const weekStart = useMemo(() => {
    const base = startOfDay(anchorDate);
    return addDays(base, -base.getDay());
  }, [anchorDate]);

  const visibleDays = useMemo(() => {
    if (mode === "day") return [startOfDay(anchorDate)];
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [anchorDate, mode, weekStart]);

  return (
    <div className="rounded-[1.75rem] border border-slate-800 bg-[#111111] p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Planner calendar</div>
          <div className="mt-2 text-xl font-semibold text-white">{mode === "day" ? "Day view" : "Week view"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAnchorDate(new Date())} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-slate-500 hover:text-white">Today</button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, -1))} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-slate-500 hover:text-white">Prev</button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, 1))} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-slate-500 hover:text-white">Next</button>
          <button onClick={() => setMode("day")} className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${mode === "day" ? "bg-sky-600 text-white" : "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"}`}>Day</button>
          <button onClick={() => setMode("week")} className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${mode === "week" ? "bg-sky-600 text-white" : "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"}`}>Week</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {visibleDays.map((day) => {
          const key = formatDate(day);
          const events = grouped[key] || [];
          return (
            <section key={key} className="rounded-2xl border border-slate-800 bg-black/30 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-sm font-semibold text-white">{weekdays[day.getDay()]}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{key}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{events.length} event{events.length === 1 ? "" : "s"}</div>
              </div>
              <div className="mt-4 grid gap-3">
                {events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-600">No events scheduled for this day.</div>
                ) : (
                  events.map((event) => {
                    const start = new Date(event.start);
                    const end = event.end ? new Date(event.end) : null;
                    const tone = colorMap[event.colorCode || "sky"] || colorMap.sky;
                    return (
                      <div key={event._id} className={`rounded-xl border p-4 ${tone}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold">{event.title}</div>
                          <div className="text-[10px] uppercase tracking-[0.3em] text-current/70">
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {end ? ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-current/60">
                          <span>{event.isRecurring ? "Recurring" : "One-time"}</span>
                          <span>{event.recurrence || "none"}</span>
                          <span>{event.notes ? "Has notes" : "No notes"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-black/20 p-4 text-sm text-slate-400">
        Selected anchor date: <span className="text-white">{todayKey}</span>. This is a fast, dependency-free day/week planner; if you want drag-and-drop later, we can swap this shell for a calendar library without changing the data model.
      </div>
    </div>
  );
}
