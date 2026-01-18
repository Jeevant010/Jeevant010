"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  // Icons
  LayoutDashboard, Crosshair, Briefcase, Brain, Library, Box, 
  FileCog, Sword, UserCog, 
  LogOut, Monitor, Settings,
  Menu, X
} from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isExpanded, toggleSidebar, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const [mode, setMode] = useState<"OS" | "CMS">(pathname.includes("/cms") ? "CMS" : "OS");

  return (
    <aside className="h-full w-full flex flex-col border-r border-white/10 bg-[#0a0a0a] text-slate-400">
      
      {/* --- HEADER --- */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
        
        {/* Logo / Title (Visible when expanded) */}
        {isExpanded ? (
          <span className="font-bold uppercase tracking-widest text-xs text-white">
            System Dock
          </span>
        ) : (
          <span className="w-full text-center text-xs font-bold">OS</span>
        )}

        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
        >
          {isMobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- MODE SWITCHER (Tabs) --- */}
      {isExpanded && (
        <div className="p-4 shrink-0">
          <div className="flex w-full items-center justify-between rounded-lg bg-white/5 p-1">
            <button 
              onClick={() => setMode("OS")}
              className={`flex-1 flex items-center justify-center gap-2 rounded py-2 text-xs font-bold uppercase transition-all whitespace-nowrap ${mode === "OS" ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-white'}`}
            >
              <Monitor size={14} /> View
            </button>
            <button 
              onClick={() => setMode("CMS")}
              className={`flex-1 flex items-center justify-center gap-2 rounded py-2 text-xs font-bold uppercase transition-all whitespace-nowrap ${mode === "CMS" ? 'bg-yellow-600 text-white shadow-lg' : 'hover:text-white'}`}
            >
              <Settings size={14} /> Edit
            </button>
          </div>
        </div>
      )}

      {/* --- MODE ICONS (Collapsed) --- */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-4 py-4 shrink-0 border-b border-white/5">
           <button onClick={() => setMode("OS")} className={`p-2 rounded-lg ${mode === "OS" ? "text-blue-500 bg-blue-500/10" : "text-slate-600"}`} title="OS Mode">
             <Monitor size={20} />
           </button>
           <button onClick={() => setMode("CMS")} className={`p-2 rounded-lg ${mode === "CMS" ? "text-yellow-500 bg-yellow-500/10" : "text-slate-600"}`} title="CMS Mode">
             <Settings size={20} />
           </button>
        </div>
      )}

      {/* --- SCROLLABLE LINKS --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {mode === "OS" ? (
            <>
              {isExpanded && <SectionHeader label="Personal OS" />}
              <SidebarItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Command Center" active={pathname === "/dashboard"} expanded={isExpanded} />
              <SidebarItem href="/planner/daily" icon={<Crosshair size={20} />} label="War Room" active={pathname.includes("planner")} expanded={isExpanded} />
              <SidebarItem href="/career" icon={<Briefcase size={20} />} label="Corp Intel" active={pathname === "/career"} expanded={isExpanded} />
              <SidebarItem href="/brain" icon={<Brain size={20} />} label="Mind Place" active={pathname === "/brain"} expanded={isExpanded} />
              <SidebarItem href="/learning" icon={<Library size={20} />} label="The Matrix" active={pathname === "/learning"} expanded={isExpanded} />
              <SidebarItem href="/arsenal" icon={<Box size={20} />} label="Arsenal" active={pathname === "/arsenal"} expanded={isExpanded} />
            </>
          ) : (
            <>
              {isExpanded && <SectionHeader label="God Mode" />}
              <SidebarItem href="/cms/projects" icon={<FileCog size={20} />} label="Project Files" active={pathname.includes("projects")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/rpg" icon={<Sword size={20} />} label="RPG Stats" active={pathname.includes("rpg")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/profile" icon={<UserCog size={20} />} label="Identity Matrix" active={pathname.includes("profile")} isCms expanded={isExpanded} />
            </>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-white/10 shrink-0 bg-[#0a0a0a]">
        <form action={logout}>
          <button className={`flex w-full items-center gap-3 rounded-xl border border-red-900/30 bg-red-900/10 p-3 text-red-400 hover:bg-red-900/30 hover:text-red-200 transition-all group overflow-hidden ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <LogOut size={20} className="shrink-0" />
            <span className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>
              Disconnect
            </span>
          </button>
        </form>
      </div>

    </aside>
  );
}

// Small helper for headers
function SectionHeader({ label }: { label: string }) {
  return <div className="mb-2 mt-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap">{label}</div>;
}

// Sidebar Item
function SidebarItem({ href, icon, label, active, isCms, expanded }: any) {
  return (
    <Link 
      href={href}
      title={!expanded ? label : ""}
      className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 whitespace-nowrap overflow-hidden
        ${active 
          ? (isCms ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-blue-600/20 text-blue-400 border border-blue-600/50') 
          : 'hover:bg-white/5 hover:text-white'}
        ${expanded ? 'justify-start' : 'justify-center'}
      `}
    >
      <span className="shrink-0">{icon}</span>
      <span className={`text-sm font-medium transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>
        {label}
      </span>
    </Link>
  )
}