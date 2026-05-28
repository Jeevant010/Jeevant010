"use client";

import { useMemo, useState } from "react";
import { deleteScheduleAction, updateScheduleAction } from "@/lib/actions/schedule.actions";
import { Edit2, Trash2, X, Save } from "lucide-react";

type ScheduleItem = {
  _id: string;
  title: string;
  start: string;
  end?: string;
  notes?: string;
  recurrence?: string;
  isRecurring?: boolean;
  colorCode?: string;
  visibility?: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
    <div className="rounded-[1.75rem] border border-slate-800 bg-[#111111] p-4 sm:p-6 font-mono">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-shell-muted">Planner calendar</div>
          <div className="mt-2 text-xl font-semibold text-shell-text">{mode === "day" ? "Day view" : "Week view"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAnchorDate(new Date())} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-shell-muted hover:border-slate-500 hover:text-shell-text">Today</button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, -1))} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-shell-muted hover:border-slate-500 hover:text-shell-text">Prev</button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, 1))} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-shell-muted hover:border-slate-500 hover:text-shell-text">Next</button>
          <button onClick={() => setMode("day")} className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${mode === "day" ? "bg-sky-600 text-shell-text" : "border border-slate-700 text-shell-muted hover:border-slate-500 hover:text-shell-text"}`}>Day</button>
          <button onClick={() => setMode("week")} className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${mode === "week" ? "bg-sky-600 text-shell-text" : "border border-slate-700 text-shell-muted hover:border-slate-500 hover:text-shell-text"}`}>Week</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {visibleDays.map((day) => {
          const key = formatDate(day);
          const events = grouped[key] || [];
          return (
            <section key={key} className="rounded-2xl border border-slate-800 bg-shell-bg/30 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-sm font-semibold text-shell-text">{weekdays[day.getDay()]}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-shell-muted">{key}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-shell-muted">{events.length} event{events.length === 1 ? "" : "s"}</div>
              </div>
              <div className="mt-4 grid gap-3">
                {events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-shell-muted">No events scheduled for this day.</div>
                ) : (
                  events.map((event) => {
                    const start = new Date(event.start);
                    const end = event.end ? new Date(event.end) : null;
                    const tone = colorMap[event.colorCode || "sky"] || colorMap.sky;
                    
                    if (editingId === event._id) {
                      return (
                        <div key={event._id} className="rounded-xl border border-shell-accent p-4 bg-shell-surface">
                           <div className="flex justify-between items-center mb-3">
                             <div className="text-[10px] text-shell-accent font-bold uppercase tracking-widest">Editing Entry</div>
                             <button onClick={() => setEditingId(null)}><X className="w-4 h-4 text-shell-muted" /></button>
                           </div>
                           <form action={async (formData) => {
                             await updateScheduleAction(formData);
                             setEditingId(null);
                           }} className="grid grid-cols-2 gap-3">
                             <input type="hidden" name="id" value={event._id} />
                             <input name="title" defaultValue={event.title} className="col-span-2 bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text" required />
                             <input name="date" type="date" defaultValue={formatDate(start)} className="bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text" required />
                             <select name="colorCode" defaultValue={event.colorCode || "sky"} className="bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text">
                                <option value="sky">Sky</option><option value="emerald">Emerald</option><option value="amber">Amber</option><option value="rose">Rose</option><option value="violet">Violet</option><option value="slate">Slate</option>
                             </select>
                             <input name="startTime" type="time" defaultValue={start.toISOString().substring(11,16)} className="bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text" required />
                             <input name="endTime" type="time" defaultValue={end ? end.toISOString().substring(11,16) : ""} className="bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text" />
                             <input name="notes" defaultValue={event.notes} className="col-span-2 bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text" placeholder="Notes" />
                             <select name="visibility" defaultValue={event.visibility || "private"} className="bg-slate-900 border border-slate-700 text-sm p-2 text-shell-text">
                                <option value="private">Private</option><option value="public">Public</option>
                             </select>
                             <div className="flex gap-2 col-span-2 mt-2">
                               <button type="submit" className="bg-shell-accent text-shell-bg px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Save className="w-3 h-3" /> Save Changes</button>
                             </div>
                           </form>
                        </div>
                      );
                    }

                    return (
                      <div key={event._id} className={`group relative rounded-xl border p-4 ${tone} transition-all hover:brightness-110`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold">{event.title}</div>
                          <div className="text-[10px] uppercase tracking-[0.3em] text-current/70">
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {end ? ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-current/60">
                          <span>{event.visibility === 'public' ? 'Public' : 'Private'}</span>
                          <span>{event.isRecurring ? "Recurring" : "One-time"}</span>
                          <span>{event.recurrence || "none"}</span>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button onClick={() => setEditingId(event._id)} className="bg-slate-900/80 p-1.5 rounded hover:bg-slate-800 text-shell-text"><Edit2 className="w-3 h-3" /></button>
                           <form action={async (formData) => { await deleteScheduleAction(formData); }}>
                              <input type="hidden" name="id" value={event._id} />
                              <button type="submit" className="bg-red-900/80 p-1.5 rounded hover:bg-red-800 text-white"><Trash2 className="w-3 h-3" /></button>
                           </form>
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
    </div>
  );
}
