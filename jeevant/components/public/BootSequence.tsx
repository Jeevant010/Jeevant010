"use client";

import { useEffect, useState } from "react";

const LINES = [
  "> establishing secure channel …",
  "> loading public archive …",
  "> indexing repositories …",
  "> mounting the stage …",
  "> welcome back, operator.",
];

// A one-per-session console boot overlay. Skipped entirely for reduced motion.
export default function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("hc_booted") === "1") return;
    } catch {
      // sessionStorage unavailable — just show it.
    }
    setVisible(true);

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setStep(index);
      if (index >= LINES.length) {
        clearInterval(timer);
        window.setTimeout(() => {
          try {
            sessionStorage.setItem("hc_booted", "1");
          } catch {
            // ignore
          }
          setVisible(false);
        }, 650);
      }
    }, 300);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="boot-overlay" aria-hidden>
      <div className="boot-console">
        {LINES.slice(0, step).map((line, index) => (
          <div key={index} className="boot-line">
            {line}
          </div>
        ))}
        <span className="boot-cursor">_</span>
      </div>
    </div>
  );
}
