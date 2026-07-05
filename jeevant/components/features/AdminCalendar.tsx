"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { deleteScheduleAction, updateScheduleTime, updateScheduleAction, createSchedule } from "@/lib/actions/schedule.actions";
import { X, Trash2, Save, MapPin, Video, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ScheduleItem = {
  _id: string;
  title: string;
  start: string;
  end?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  attendees?: string[];
  recurrence?: string;
  recurrenceDays?: number[];
  recurrenceEndDate?: string;
  isRecurring?: boolean;
  colorCode?: string;
  visibility?: string;
};

const colorMap: Record<string, string> = {
  slate: "#475569",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
};

export default function AdminCalendar({ schedules }: { schedules: ScheduleItem[] }) {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newEventDates, setNewEventDates] = useState<{ start: Date; end?: Date }>({ start: new Date() });

  const formatDate = (date: any) => {
    try {
      return new Date(date).toISOString().substring(0, 10);
    } catch (e) {
      return "";
    }
  };

  const formatTime = (date: any) => {
    try {
      return new Date(date).toISOString().substring(11, 16);
    } catch (e) {
      return "00:00";
    }
  };

  // Convert DB items to FullCalendar event objects
  const events = schedules.map((item) => {
    // If recurring, map to FullCalendar rrule or simple recurrence
    let daysOfWeek = undefined;
    if (item.isRecurring && item.recurrence !== "none") {
      if (item.recurrence === "daily") daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      if (item.recurrence === "weekly" && item.recurrenceDays?.length) daysOfWeek = item.recurrenceDays;
      if (item.recurrence === "custom" && item.recurrenceDays?.length) daysOfWeek = item.recurrenceDays;
      // If we couldn't parse the days, default to the start day
      if (!daysOfWeek) daysOfWeek = [new Date(item.start).getDay()];
    }

    return {
      id: item._id,
      title: item.title,
      start: item.isRecurring ? undefined : item.start,
      end: item.isRecurring ? undefined : item.end,
      startTime: item.isRecurring ? new Date(item.start).toLocaleTimeString("en-GB", { hour12: false }) : undefined,
      endTime: item.isRecurring && item.end ? new Date(item.end).toLocaleTimeString("en-GB", { hour12: false }) : undefined,
      daysOfWeek,
      startRecur: item.isRecurring ? item.start : undefined,
      endRecur: item.isRecurring ? item.recurrenceEndDate : undefined,
      backgroundColor: colorMap[item.colorCode || "sky"],
      borderColor: colorMap[item.colorCode || "sky"],
      extendedProps: { ...item },
    };
  });

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps as ScheduleItem);
  };

  const handleDateSelect = (selectInfo: any) => {
    setNewEventDates({ start: selectInfo.start, end: selectInfo.end });
    setIsCreating(true);
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleEventDrop = async (dropInfo: any) => {
    const id = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end || dropInfo.event.start;
    await updateScheduleTime(id, newStart, newEnd);
  };

  const handleEventResize = async (resizeInfo: any) => {
    const id = resizeInfo.event.id;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;
    await updateScheduleTime(id, newStart, newEnd);
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-800 bg-[#111111] p-4 sm:p-6 font-mono relative">
      
      {/* FULL CALENDAR */}
      <style suppressHydrationWarning>{`
        .fc-theme-standard th { border-color: #334155; padding: 8px 0; color: #94a3b8; font-weight: normal; text-transform: uppercase; font-size: 12px; }
        .fc-theme-standard td { border-color: #334155; }
        .fc-day-today { background-color: rgba(14, 165, 233, 0.05) !important; }
        .fc-event { border-radius: 4px; cursor: pointer; border: none; padding: 2px 4px; font-size: 11px; }
        .fc-timegrid-slot { height: 3em; }
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #f1f5f9; }
        .fc .fc-button-primary { background-color: #1e293b; border-color: #334155; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #0ea5e9; border-color: #0ea5e9; }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        height="80vh"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
      />

      {/* EDIT MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-lg text-shell-text">Edit Schedule</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form action={async (formData) => {
                await updateScheduleAction(formData);
                setSelectedEvent(null);
              }} className="p-4 space-y-4">
                <input type="hidden" name="id" value={selectedEvent._id} />
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
                  <input name="title" defaultValue={selectedEvent.title} required className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</label>
                    <input name="date" type="date" defaultValue={formatDate(selectedEvent.start)} required className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Color</label>
                    <select name="colorCode" defaultValue={selectedEvent.colorCode || "sky"} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500">
                      <option value="sky">Sky</option><option value="emerald">Emerald</option><option value="amber">Amber</option><option value="rose">Rose</option><option value="violet">Violet</option><option value="slate">Slate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Start Time</label>
                    <input name="startTime" type="time" defaultValue={formatTime(selectedEvent.start)} required className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">End Time</label>
                    <input name="endTime" type="time" defaultValue={selectedEvent.end ? formatTime(selectedEvent.end) : ""} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label>
                    <input name="location" defaultValue={selectedEvent.location} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Video className="w-3 h-3"/> Meeting Link</label>
                    <input name="meetingLink" defaultValue={selectedEvent.meetingLink} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> Attendees</label>
                  <input name="attendees" defaultValue={selectedEvent.attendees?.join(", ")} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Notes</label>
                  <textarea name="notes" defaultValue={selectedEvent.notes} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button 
                    formAction={async (fd) => {
                      await deleteScheduleAction(fd);
                      setSelectedEvent(null);
                    }}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-4 py-2 border border-red-900 rounded bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>

                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-2 rounded transition">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* CREATE MODAL */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-lg text-shell-text">Create Schedule</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form action={async (formData) => {
                await createSchedule(formData);
                setIsCreating(false);
              }} className="p-4 space-y-4">
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
                  <input name="title" required placeholder="Event Name" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</label>
                    <input name="date" type="date" defaultValue={formatDate(newEventDates.start)} required className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Color</label>
                    <select name="colorCode" defaultValue="sky" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500">
                      <option value="sky">Sky</option><option value="emerald">Emerald</option><option value="amber">Amber</option><option value="rose">Rose</option><option value="violet">Violet</option><option value="slate">Slate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Start Time</label>
                    <input name="startTime" type="time" defaultValue={formatTime(newEventDates.start)} required className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">End Time</label>
                    <input name="endTime" type="time" defaultValue={newEventDates.end ? formatTime(newEventDates.end) : ""} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label>
                    <input name="location" placeholder="Conference Room A" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Video className="w-3 h-3"/> Meeting Link</label>
                    <input name="meetingLink" placeholder="https://zoom.us/..." className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> Attendees</label>
                  <input name="attendees" placeholder="john@example.com, jane@example.com" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Notes</label>
                  <textarea name="notes" placeholder="Preparation, agenda..." rows={2} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 mt-1 text-shell-text outline-none focus:border-blue-500" />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-2 rounded transition">
                    <Save className="w-4 h-4" /> Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}