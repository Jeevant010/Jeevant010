"use client";

import { useEffect, useRef } from "react";
import LiveField from "@/components/public/LiveField";
import BootSequence from "@/components/public/BootSequence";

export default function ImmersiveChrome({ children }: { children: React.ReactNode }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const bar = barRef.current;
      if (!bar) return;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  };

  return (
    <div className="stage relative min-h-screen overflow-x-clip" onMouseMove={onMove}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="stage-grid absolute inset-0 opacity-80" />
        <div className="stage-glow absolute -left-24 top-[-8%] h-[36rem] w-[36rem] rounded-full" />
        <div className="stage-glow-alt absolute right-[-6rem] top-[18%] h-[24rem] w-[24rem] rounded-full" />
        <div className="immersive-scan absolute inset-x-0 top-0 h-24" />
        <div className="dust absolute inset-0">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              style={{
                left: `${(index * 5.5) % 100}%`,
                bottom: `${(index * 11) % 70}%`,
                animationDelay: `${index * 0.35}s`,
                animationDuration: `${8 + (index % 6)}s`,
              }}
            />
          ))}
        </div>
      </div>
      <LiveField />
      <div ref={glowRef} className="pointer-glow fixed z-[1]" style={{ transform: "translate(-999px, -999px)" }} />
      <div ref={barRef} className="scroll-progress" />
      <div className="relative z-10">{children}</div>
      <BootSequence />
    </div>
  );
}
