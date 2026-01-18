import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Globe } from "lucide-react";
import { getProfile } from "@/lib/actions/profile.actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white">
      
      {/* --- 1. CINEMATIC BACKGROUND IMAGE --- */}
      {/* High-res Cyberpunk City / Data Highway Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')",
          filter: "contrast(1.2) brightness(0.8)"
        }}
      />
      
      {/* Overlay Gradient to make text readable */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />

      {/* --- 2. HERO CONTENT --- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        
        {/* Status Chip */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-900/20 px-4 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-400">
            {profile.status}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter text-white md:text-9xl" style={{ textShadow: "0 0 40px rgba(255,255,255,0.3)" }}>
          {profile.name}
        </h1>
        
        {/* Subtitle / Role */}
        <p className="mb-12 max-w-2xl text-lg font-light tracking-widest text-slate-300 md:text-xl">
          <span className="text-blue-500 font-bold">//</span> {profile.title} <br/>
          <span className="text-xs opacity-70">SYSTEM ARCHITECT & AI OPERATOR</span>
        </p>

        {/* Action Grid */}
        <div className="grid w-full max-w-lg grid-cols-1 gap-4 md:grid-cols-2">
          
          <Link 
            href="/projects" 
            className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-white/20 bg-white/5 px-6 py-5 transition-all hover:bg-white/10 hover:border-blue-500/50"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase text-blue-400">01. Portfolio</span>
              <span className="font-bold uppercase tracking-wider text-white">View Projects</span>
            </div>
            <Globe className="h-6 w-6 text-slate-500 transition-transform group-hover:scale-110 group-hover:text-white" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <Link 
            href="/about" 
            className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-white/20 bg-white/5 px-6 py-5 transition-all hover:bg-white/10 hover:border-purple-500/50"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase text-purple-400">02. Identity</span>
              <span className="font-bold uppercase tracking-wider text-white">Bio & Stats</span>
            </div>
            <Cpu className="h-6 w-6 text-slate-500 transition-transform group-hover:scale-110 group-hover:text-white" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

        </div>

      </div>

      {/* --- 3. BOTTOM FOOTER DECORATION --- */}
      <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-end text-[10px] font-mono text-white/40 uppercase tracking-widest z-10">
        <div>
          Jeevant_OS v2.0 <br/>
          Secure Connection
        </div>
        <div className="flex gap-4">
          <span>LAT: 28.7041</span>
          <span>LON: 77.1025</span>
        </div>
      </div>

    </div>
  );
}