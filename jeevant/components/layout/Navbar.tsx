import Link from "next/link";
import { getSession } from "@/lib/auth"; 
import { logout } from "@/lib/actions/auth.actions";
import { 
  // Public Icons
  Terminal, // Home
  Code,     // Projects
  User,     // About
  Radio,    // Contact

  // Private Icons
  LayoutDashboard, // Dashboard
  Crosshair,       // Planner (Daily)
  Briefcase,       // Career
  Brain,           // Brain (Notes)
  Library,         // Learning (Matrix)
  Box,             // Arsenal (Snippets)
  Sword,           // CMS (RPG Admin)
  FolderOpen,      // CMS (Projects Admin)
  
  // System
  LogOut 
} from "lucide-react";

export default async function Navbar() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        
        {/* --- PUBLIC SECTOR (Visible to Everyone) --- */}
        <div className="flex items-center gap-1">
          <NavLink href="/" icon={<Terminal size={18} />} label="Root" />
          <NavLink href="/projects" icon={<Code size={18} />} label="Projects" />
          <NavLink href="/about" icon={<User size={18} />} label="About" />
          <NavLink href="/contact" icon={<Radio size={18} />} label="Comms" />
        </div>

        {/* --- PRIVATE SECTOR (Only visible if logged in) --- */}
        {isLoggedIn && (
          <>
            {/* Divider */}
            <div className="w-px h-8 bg-white/10 mx-2 flex-shrink-0"></div>

            {/* WORK CLUSTER */}
            <div className="flex items-center gap-1">
              <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="OS" activeColor="text-red-500" />
              <NavLink href="/planner/daily" icon={<Crosshair size={18} />} label="Planner" activeColor="text-red-500" />
              <NavLink href="/career" icon={<Briefcase size={18} />} label="Career" activeColor="text-pink-500" />
            </div>

            {/* KNOWLEDGE CLUSTER */}
            <div className="flex items-center gap-1 ml-1 border-l border-white/5 pl-1">
              <NavLink href="/brain" icon={<Brain size={18} />} label="Brain" activeColor="text-yellow-500" />
              <NavLink href="/learning" icon={<Library size={18} />} label="Matrix" activeColor="text-green-500" />
              <NavLink href="/arsenal" icon={<Box size={18} />} label="Arsenal" activeColor="text-green-500" />
            </div>

            {/* ADMIN CLUSTER */}
            <div className="flex items-center gap-1 ml-1 border-l border-white/5 pl-1">
              <NavLink href="/cms/projects" icon={<FolderOpen size={18} />} label="Files" activeColor="text-blue-500" />
              <NavLink href="/cms/rpg" icon={<Sword size={18} />} label="GM Mode" activeColor="text-yellow-600" />
            </div>
            
            {/* LOGOUT */}
            <form action={logout} className="ml-2">
              <button className="p-3 rounded-xl hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center" title="System Shutdown">
                <LogOut size={18} />
              </button>
            </form>
          </>
        )}

        {/* LOGIN LINK (Only if logged out) */}
        {!isLoggedIn && (
          <>
             <div className="w-px h-8 bg-white/10 mx-2"></div>
             <Link href="/login" className="text-[10px] font-mono text-slate-600 hover:text-white transition uppercase tracking-widest px-2 whitespace-nowrap">
               // Login
             </Link>
          </>
        )}

      </div>
    </nav>
  );
}

// Helper Component for the Icons
function NavLink({ href, icon, label, activeColor = "text-white" }: { href: string, icon: any, label: string, activeColor?: string }) {
  return (
    <Link 
      href={href} 
      className="group relative p-3 rounded-xl hover:bg-white/5 transition-all flex flex-col items-center gap-1 shrink-0"
    >
      <span className={`text-slate-400 group-hover:${activeColor} transition-colors`}>{icon}</span>
      
      {/* Tooltip (Hover) */}
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </Link>
  );
}