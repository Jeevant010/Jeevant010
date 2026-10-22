"use client";

import { useCallback, useRef } from "react";

// Pointer-driven 3D tilt. Attach the returned ref + handlers to any element.
export function useTilt(max = 9, scale = 1.015) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) scale(${scale})`;
    },
    [max, scale]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
