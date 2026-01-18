import Link from "next/link";
import { ArrowRight, Code, Terminal, Cpu, Zap, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none h-[800px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 flex flex-col items-center text-center pt-32 pb-20 px-4">
        
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          Open to Work & Collaborations
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Build. <span className="glow-text">Scale.</span> Innovate.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The personal operating system of <strong>Jeevant</strong>. 
          Merging Full-Stack Engineering with AI Agents to build the future of software.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/projects" 
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center gap-2"
          >
            Explore Projects <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition backdrop-blur-md"
          >
            Enter Dashboard
          </Link>
        </div>
      </section>

      {/* --- FLOATING STATS BAR --- */}
      <div className="relative z-20 max-w-4xl mx-auto -mt-8 mb-24">
        <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-white">1,525</div>
            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">LeetCode Rating</div>
          </div>
          <div className="w-full md:w-px h-px md:h-12 bg-white/10"></div>
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-white">6th</div>
            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Semester (CSE)</div>
          </div>
          <div className="w-full md:w-px h-px md:h-12 bg-white/10"></div>
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-white">5+</div>
            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Production Projects</div>
          </div>
        </div>
      </div>

      {/* --- TECH STACK GRID --- */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Powered By Modern Tech</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-2xl group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">MERN Stack</h3>
            <p className="text-slate-400 leading-relaxed">
              Building scalable backends with Node.js and interactive frontends with React & Next.js.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-2xl group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Agents</h3>
            <p className="text-slate-400 leading-relaxed">
              Developing local AI agents using Python, Ollama, and RAG pipelines for smarter apps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-2xl group">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Performance First</h3>
            <p className="text-slate-400 leading-relaxed">
              Optimized for speed. From database queries to client-side rendering with Next.js 15.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}