"use client";

import { useEffect, useState } from "react";

export default function LiveClock({ label = "Surat, India" }: { label?: string }) {
  const [time, setTime] = useState<string>("--:--");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());

    setTime(format());
    const timer = window.setInterval(() => setTime(format()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
      <span className="live-dot" />
      {label} · {time} IST
    </span>
  );
}
