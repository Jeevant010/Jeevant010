"use client";

import { useEffect, useRef } from "react";

// A GPU-cheap canvas constellation that drifts and leans toward the pointer.
// No external dependency, and it disables animation under prefers-reduced-motion.
export default function LiveField({ density = 64 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let signal = "#d6ff4a";
    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const stage = document.querySelector(".stage");
      const read = getComputedStyle(stage || document.documentElement).getPropertyValue("--stage-signal").trim();
      if (read) signal = read;

      const count = reduce ? Math.min(28, density) : density;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const onMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!reduce) {
          particle.x += particle.vx;
          particle.y += particle.vy;
        }
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 170 && distance > 0.5) {
          particle.x += (dx / distance) * 0.45;
          particle.y += (dy / distance) * 0.45;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.4, 0, Math.PI * 2);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = signal;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 118) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.globalAlpha = (1 - dist / 118) * 0.16;
            ctx.strokeStyle = signal;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className="livefield pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
