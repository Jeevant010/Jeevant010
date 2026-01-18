import Link from "next/link";
import { getSession } from "@/lib/auth"; 
import { logout } from "@/lib/actions/auth.actions";
import { 
  // Public
  Terminal, User, Code, Radio,
  // OS (Visual)
  LayoutDashboard, Crosshair, Briefcase, Brain, Library, Box,
  // CMS (Edit)
  FileCog, Sword, UserCog,
  // System
  LogOut 
} from "lucide-react";

export default async function Navbar() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
      <div className="bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-2 overflow-x-auto custom-scrollbar">
        
        {/* =======================================
            ZONE 1: PUBLIC (The Facade)
           ======================================= */}
        <div className="flex items-center gap-1 pr-2">
          <NavLink href="/" icon={<Terminal size={18} />} label="Home" />
          <NavLink href="/projects" icon={<Code size={18} />} label="Projects" />
          <NavLink href="/about" icon={<User size={18} />} label="Profile" />
          <NavLink href="/contact" icon={<Radio size={18} />} label="Contact" />
        </div>

        {isLoggedIn && (
          <>
            {/* DIVIDER: "THE VEIL" */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1"></div>

            {/* =======================================
                ZONE 2: OS (Visual / Daily Driver)
               ======================================= */}
            <div className="flex items-center gap-1 px-2 bg-white/5 rounded-xl border border-white/5 mx-1">
              <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Command" activeColor="text-red-500" />
              <NavLink href="/planner/daily" icon={<Crosshair size={18} />} label="Planner" activeColor="text-red-500" />
              <NavLink href="/career" icon={<Briefcase size={18} />} label="Career" activeColor="text-pink-500" />
              <NavLink href="/brain" icon={<Brain size={18} />} label="Brain" activeColor="text-yellow-500" />
              <NavLink href="/learning" icon={<Library size={18} />} label="Matrix" activeColor="text-green-500" />
              <NavLink href="/arsenal" icon={<Box size={18} />} label="Arsenal" activeColor="text-green-500" />
            </div>

            {/* DIVIDER: "ADMIN CLEARANCE" */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent mx-1"></div>

            {/* =======================================
                ZONE 3: CMS (Edit / God Mode)
               ======================================= */}
            <div className="flex items-center gap-1 pl-2">
              <NavLink href="/cms/projects" icon={<FileCog size={18} />} label="Edit Projects" activeColor="text-blue-400" isCms />
              <NavLink href="/cms/rpg" icon={<Sword size={18} />} label="GM Mode" activeColor="text-yellow-600" isCms />
              <NavLink href="/cms/profile" icon={<UserCog size={18} />} label="Identity" activeColor="text-purple-400" isCms />
            </div>
            
            {/* LOGOUT */}
            <form action={logout} className="ml-2 border-l border-white/10 pl-2">
              <button className="p-3 rounded-xl hover:bg-red-950 text-slate-600 hover:text-red-500 transition-all flex items-center justify-center" title="System Shutdown">
                <LogOut size={16} />
              </button>
            </form>
          </>
        )}

        {/* LOGIN LINK (Hidden when logged in) */}
        {!isLoggedIn && (
          <Link href="/login" className="ml-2 text-[10px] font-mono text-slate-700 hover:text-white transition uppercase tracking-widest px-2 whitespace-nowrap">
             // Login
          </Link>
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
  activeColor = "text-white", 
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
      className={`group relative p-3 rounded-xl transition-all flex flex-col items-center gap-1 shrink-0 ${isCms ? 'hover:bg-blue-900/20 hover:border-blue-500/30 border border-transparent' : 'hover:bg-white/10'}`}
    >
      <span className={`text-slate-400 group-hover:${activeColor} transition-colors`}>{icon}</span>
      
      {/* Tooltip */}
      <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-white/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 whitespace-nowrap pointer-events-none shadow-xl z-50">
        {label}
        {/* Tiny arrow for tooltip */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0a0a] border-r border-b border-white/20 rotate-45"></span>
      </span>
    </Link>
  );
}