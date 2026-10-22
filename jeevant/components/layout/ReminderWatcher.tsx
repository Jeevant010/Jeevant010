"use client";

import { useEffect, useState } from "react";

// In-app notifications for due reminders. True background push would need a
// service worker + VAPID keys; this works whenever the app is open.
export default function ReminderWatcher() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setEnabled(Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      try {
        const res = await fetch("/api/reminders/due", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();

        const seen: string[] = JSON.parse(localStorage.getItem("hc_seen_reminders") || "[]");
        let changed = false;

        for (const task of json.tasks || []) {
          if (seen.includes(task.id)) continue;
          const due = new Date(task.dueDate).getTime();
          if (due > Date.now() + 5 * 60 * 1000) continue; // only due within 5 minutes
          new Notification("Reminder", { body: task.title });
          seen.push(task.id);
          changed = true;
        }

        if (changed) localStorage.setItem("hc_seen_reminders", JSON.stringify(seen.slice(-200)));
      } catch {
        // best-effort
      }
    };

    void tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (enabled) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        if (!("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        setEnabled(permission === "granted");
      }}
      className="fixed bottom-[86px] right-3 z-40 rounded-full border border-[#c8b48a]/40 bg-[#07080a]/90 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#c8b48a] backdrop-blur md:bottom-4 md:right-4"
    >
      Enable alerts
    </button>
  );
}
