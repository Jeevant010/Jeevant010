import Link from "next/link";
import { getSession } from "@/lib/auth"; 
import { logout } from "@/lib/actions/auth.actions";
import { 
  // Public
  Terminal, User, Code, Radio, Sparkles, MapPinned, Shield,
  // OS (Visual)
  LayoutDashboard, Crosshair, Briefcase, Brain, Library, Box,
  // CMS (Edit)
  FileCog, Sword, UserCog, Calendar, Award, Compass, FileText,
  // System
  LogOut 
} from "lucide-react";

export default async function Navbar() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
      <div className="bg-shell-bg/95 backdrop-blur-xl border border-shell-border rounded-2xl p-2 shadow-2xl flex items-center gap-2 overflow-x-auto custom-scrollbar">
        
        {/* =======================================
            ZONE 1: PUBLIC (The Facade)
           ======================================= */}
        <div className="flex items-center gap-1 pr-2">
          <NavLink href="/" icon={<Terminal size={18} />} label="Home" />
          <NavLink href="/about" icon={<User size={18} />} label="About" />
          <NavLink href="/journey" icon={<MapPinned size={18} />} label="Journey" />
          <NavLink href="/projects" icon={<Code size={18} />} label="Projects" />
          <NavLink href="/research" icon={<Radio size={18} />} label="Research" />
          <NavLink href="/library" icon={<Library size={18} />} label="Library" />
          <NavLink href="/schedule" icon={<Crosshair size={18} />} label="Schedule" />
          <NavLink href="/contact" icon={<Terminal size={18} />} label="Contact" />
        </div>

        {isLoggedIn && (
          <>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1"></div>

            <div className="flex items-center gap-1 px-2 bg-shell-text/5 rounded-xl border border-shell-border mx-1">
              <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" activeColor="text-red-500" />
              <NavLink href="/planner/daily" icon={<Crosshair size={18} />} label="Schedule" activeColor="text-red-500" />
              <NavLink href="/career" icon={<Briefcase size={18} />} label="Work" activeColor="text-pink-500" />
              <NavLink href="/brain" icon={<Brain size={18} />} label="Notes" activeColor="text-yellow-500" />
              <NavLink href="/learning" icon={<Library size={18} />} label="Learning" activeColor="text-green-500" />
              <NavLink href="/arsenal" icon={<Box size={18} />} label="Tools" activeColor="text-green-500" />
            </div>

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent mx-1"></div>

            <div className="flex items-center gap-1 pl-2">
              <NavLink href="/cms/projects" icon={<FileCog size={18} />} label="Projects" activeColor="text-blue-400" isCms />
              <NavLink href="/cms/rpg" icon={<Sword size={18} />} label="RPG / Quests" activeColor="text-yellow-600" isCms />
              <NavLink href="/cms/schedule" icon={<Calendar size={18} />} label="Schedule" activeColor="text-emerald-400" isCms />
              <NavLink href="/cms/expertise" icon={<Award size={18} />} label="Expertise" activeColor="text-amber-400" isCms />
              <NavLink href="/cms/journey" icon={<Compass size={18} />} label="Journey" activeColor="text-cyan-400" isCms />
              <NavLink href="/cms/resume" icon={<FileText size={18} />} label="Resume" activeColor="text-rose-400" isCms />
              <NavLink href="/cms/profile" icon={<UserCog size={18} />} label="Identity" activeColor="text-purple-400" isCms />
            </div>
            
            <form action={logout} className="ml-2 border-l border-shell-border pl-2">
              <button className="p-3 rounded-xl hover:bg-red-950 text-shell-muted hover:text-red-500 transition-all flex items-center justify-center" title="System Shutdown">
                <LogOut size={16} />
              </button>
            </form>
          </>
        )}



      </div>
    </nav>
  );
}

// --- HELPER COMPONENT ---
function NavLink({ 
  href, 
  icon, 
  label, 
  activeColor = "text-shell-text", 
  isCms = false 
}: { 
  href: string, 
  icon: any, 
  label: string, 
  activeColor?: string,
  isCms?: boolean 
}) {
  return (
    <Link 
      href={href} 
      className={`group relative p-3 rounded-xl transition-all flex flex-col items-center gap-1 shrink-0 ${isCms ? 'hover:bg-blue-900/20 hover:border-blue-500/30 border border-transparent' : 'hover:bg-shell-text/10'}`}
    >
      <span className={`text-shell-muted group-hover:${activeColor} transition-colors`}>{icon}</span>
      
      {/* Tooltip */}
      <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-shell-surface border border-shell-border px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-shell-text opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 whitespace-nowrap pointer-events-none shadow-xl z-50">
        {label}
        {/* Tiny arrow for tooltip */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-shell-surface border-r border-b border-shell-border rotate-45"></span>
      </span>
    </Link>
  );
}