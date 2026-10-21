"use client";

import { useTilt } from "@/lib/hooks/useTilt";

// Wrapper that gives any child the pointer-tilt treatment.
export default function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, onMouseMove, onMouseLeave } = useTilt();
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}
