"use client";

import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is best-effort.
    });
  }, []);

  return null;
}
