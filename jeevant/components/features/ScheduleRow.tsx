"use client";

import { deleteScheduleAction } from "@/lib/actions/schedule.actions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScheduleRow({ entry }: { entry: any }) {
  const router = useRouter();

  const start = new Date(entry.start);
  const end = entry.end ? new Date(entry.end) : null;

  return (
    <div className="p-4 flex items-start justify-between">
      <div>
        <div className="text-sm font-semibold text-white">{entry.title}</div>
        <div className="text-xs text-slate-400">{start.toLocaleString()} {end ? `– ${end.toLocaleTimeString()}` : ""}</div>
        {entry.notes ? <div className="text-xs text-slate-300 mt-2">{entry.notes}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        <form action={async (formData: FormData) => {
          await deleteScheduleAction(formData);
          router.refresh();
        }}>
          <input type="hidden" name="id" value={entry._id} />
          <button type="submit" className="text-red-400 hover:text-red-300 p-2 rounded-md" aria-label="Delete schedule">
            <Trash2 className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
