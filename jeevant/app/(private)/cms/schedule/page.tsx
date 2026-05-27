import { clearPastScheduleEntries, getSchedules } from "@/lib/actions/schedule.actions";
import AddScheduleForm from "@/components/features/AddScheduleForm";
import AdminCalendar from "@/components/features/AdminCalendar";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScheduleCMS() {
  const items = await getSchedules();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-slate-300 p-8 font-mono -m-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3"><Calendar className="w-8 h-8 text-green-500" /> Schedule</h1>
          <p className="text-slate-500 text-xs tracking-widest mt-1">// ACCESS LEVEL: ADMIN // Database: SCHEDULE</p>
        </div>
      </div>

      <div className="mb-8">
        <AddScheduleForm />
      </div>

      <div className="mb-4 flex justify-end">
        <form action={clearPastScheduleEntries}>
          <button className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-amber-500 hover:text-amber-300">
            Clear past events
          </button>
        </form>
      </div>

      <AdminCalendar schedules={items as any[]} />
    </div>
  );
}
