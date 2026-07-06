"use client";

import Link from 'next/link';
import { Terminal, ShieldAlert, ArrowLeft, Home, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-shell-bg text-shell-text font-mono relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      
      {/* TACTICAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-shell-accent),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.1),transparent_50%)] opacity-20" />
        <div className="absolute left-0 top-0 w-full h-full bg-mindplace-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      
      {/* GLITCH & RADAR EFFECTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-0 w-full h-[2px] bg-red-500/20 animate-scan opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto border border-red-500/30 bg-shell-surface/80 backdrop-blur-md p-8 sm:p-12 shadow-[0_0_50px_rgba(220,38,38,0.15)] rounded-xl text-center group">
        {/* Corner Ornaments */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-red-500/50" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-red-500/50" />
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-6 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <Activity className="w-3 h-3" /> Error Code: 404
        </div>
        
        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-shell-text mb-4 drop-shadow-[0_2px_10px_rgba(220,38,38,0.3)]">
          Sector Not Found
        </h1>
        
        {/* Description */}
        <p className="text-shell-muted mb-10 max-w-lg mx-auto leading-relaxed text-sm sm:text-base border-l-2 border-red-500/30 pl-4 text-left font-sans bg-red-500/5 p-4 rounded-r">
          The intelligence sector or requested endpoint you are attempting to access does not exist, has been redacted, or your clearance level is insufficient. 
          Return to the secure network immediately.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-shell-text text-shell-bg font-black uppercase tracking-widest text-sm hover:opacity-80 hover:shadow-[0_0_20px_var(--color-cinematic-glow)] transition-all w-full sm:w-auto rounded-sm"
          >
             <ArrowLeft className="w-4 h-4" /> Disengage (Back)
          </button>
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 border border-shell-border bg-shell-surface/50 text-shell-muted font-bold uppercase tracking-widest text-sm hover:border-shell-accent hover:text-shell-accent transition-all w-full sm:w-auto rounded-sm"
          >
             <Home className="w-4 h-4" /> Base Command
          </Link>
        </div>
        
        {/* Footer HUD */}
        <div className="mt-12 text-[10px] font-mono text-shell-muted/50 flex justify-between items-center border-t border-shell-border/50 pt-4">
          <span className="flex items-center gap-2 uppercase tracking-widest"><Terminal className="w-3 h-3" /> Connection: Lost</span>
          <span className="uppercase tracking-widest animate-pulse text-red-500/60">Trace Failed</span>
        </div>
      </div>
    </div>
  );
}
