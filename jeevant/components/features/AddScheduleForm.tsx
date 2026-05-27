"use client";

import { createSchedule } from "@/lib/actions/schedule.actions";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Saving..." : "Add Entry"}
    </button>
  );
}

export default function AddScheduleForm() {
  return (
    <form action={createSchedule} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="md:col-span-2 space-y-1">
        <label htmlFor="sch-title" className="text-xs text-slate-400 ml-1">Title</label>
        <input id="sch-title" name="title" required placeholder="Meeting / Focus block" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="md:col-span-1 space-y-1">
        <label htmlFor="sch-date" className="text-xs text-slate-400 ml-1">Date</label>
        <input id="sch-date" name="date" type="date" required placeholder="YYYY-MM-DD" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="md:col-span-1 space-y-1">
        <label htmlFor="sch-start" className="text-xs text-slate-400 ml-1">Start</label>
        <input id="sch-start" name="startTime" type="time" required placeholder="09:00" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="md:col-span-1 space-y-1">
        <label htmlFor="sch-end" className="text-xs text-slate-400 ml-1">End</label>
        <input id="sch-end" name="endTime" type="time" placeholder="10:00" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="md:col-span-6 space-y-1">
        <label className="text-xs text-slate-400 ml-1">Notes (optional)</label>
        <input name="notes" placeholder="Quick notes" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="text-xs text-slate-400 ml-1">Recurrence</label>
        <select name="recurrence" title="Schedule recurrence" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="text-xs text-slate-400 ml-1">Color</label>
        <select name="colorCode" title="Schedule color" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
          <option value="sky">Sky</option>
          <option value="emerald">Emerald</option>
          <option value="amber">Amber</option>
          <option value="rose">Rose</option>
          <option value="violet">Violet</option>
          <option value="slate">Slate</option>
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="text-xs text-slate-400 ml-1">Visibility</label>
        <select name="visibility" title="Schedule visibility" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      <label className="md:col-span-2 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 mt-1">
        <input name="isRecurring" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500" />
        Mark as recurring
      </label>

      <div className="md:col-span-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
