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
  const [mode, setMode] = useState<"VIEW" | "ADMIN">(pathname.includes("/cms") ? "ADMIN" : "VIEW");

  return (
    <aside className="h-full w-full flex flex-col border-r border-shell-border bg-[#0a0a0a] text-shell-muted">
      
      {/* --- HEADER --- */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-shell-border px-4">
        
        {/* Logo / Title (Visible when expanded) */}
        {isExpanded ? (
          <span className="font-bold uppercase tracking-widest text-xs text-shell-text">
            Site Menu
          </span>
        ) : (
          <span className="w-full text-center text-xs font-bold">Menu</span>
        )}

        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-shell-surface rounded-lg text-shell-muted transition-colors"
        >
          {isMobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- MODE SWITCHER (Tabs) --- */}
      {isExpanded && (
        <div className="p-4 shrink-0">
          <div className="flex w-full items-center justify-between rounded-lg bg-shell-text/5 p-1">
            <button 
              onClick={() => setMode("VIEW")}
              className={`flex-1 flex items-center justify-center gap-2 rounded py-2 text-xs font-bold uppercase transition-all whitespace-nowrap ${mode === "VIEW" ? 'bg-blue-600 text-shell-text shadow-lg' : 'hover:text-shell-text'}`}
            >
              <Monitor size={14} /> View
            </button>
            <button 
              onClick={() => setMode("ADMIN")}
              className={`flex-1 flex items-center justify-center gap-2 rounded py-2 text-xs font-bold uppercase transition-all whitespace-nowrap ${mode === "ADMIN" ? 'bg-yellow-600 text-shell-text shadow-lg' : 'hover:text-shell-text'}`}
            >
              <Settings size={14} /> Admin
            </button>
          </div>
        </div>
      )}

      {/* --- MODE ICONS (Collapsed) --- */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-4 py-4 shrink-0 border-b border-white/5">
           <button onClick={() => setMode("VIEW")} className={`p-2 rounded-lg ${mode === "VIEW" ? "text-blue-500 bg-blue-500/10" : "text-shell-muted"}`} title="View Mode">
             <Monitor size={20} />
           </button>
           <button onClick={() => setMode("ADMIN")} className={`p-2 rounded-lg ${mode === "ADMIN" ? "text-yellow-500 bg-yellow-500/10" : "text-shell-muted"}`} title="Admin Mode">
             <Settings size={20} />
           </button>
        </div>
      )}

      {/* --- SCROLLABLE LINKS --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {mode === "VIEW" ? (
            <>
              {isExpanded && <SectionHeader label="Personal Site" />}
              <SidebarItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/dashboard"} expanded={isExpanded} />
              <SidebarItem href="/planner/daily" icon={<Crosshair size={20} />} label="Schedule" active={pathname.includes("planner")} expanded={isExpanded} />
              <SidebarItem href="/career" icon={<Briefcase size={20} />} label="Work" active={pathname === "/career"} expanded={isExpanded} />
              <SidebarItem href="/brain" icon={<Brain size={20} />} label="Notes" active={pathname === "/brain"} expanded={isExpanded} />
              <SidebarItem href="/learning" icon={<Library size={20} />} label="Learning" active={pathname === "/learning"} expanded={isExpanded} />
              <SidebarItem href="/arsenal" icon={<Box size={20} />} label="Tools" active={pathname === "/arsenal"} expanded={isExpanded} />
            </>
          ) : (
            <>
              {isExpanded && <SectionHeader label="Admin" />}
              <SidebarItem href="/cms/projects" icon={<FileCog size={20} />} label="Projects" active={pathname.includes("projects")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/journey" icon={<Sword size={20} />} label="Journey" active={pathname.includes("journey")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/expertise" icon={<Box size={20} />} label="Expertise" active={pathname.includes("expertise")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/resume" icon={<FileCog size={20} />} label="Resume" active={pathname.includes("resume")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/schedule" icon={<Crosshair size={20} />} label="Schedule" active={pathname.includes("schedule")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/rpg" icon={<Sword size={20} />} label="Content" active={pathname.includes("rpg")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/profile" icon={<UserCog size={20} />} label="Profile" active={pathname.includes("profile")} isCms expanded={isExpanded} />
            </>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-shell-border shrink-0 bg-[#0a0a0a]">
        <form action={logout}>
          <button className={`flex w-full items-center gap-3 rounded-xl border border-red-900/30 bg-red-900/10 p-3 text-red-400 hover:bg-red-900/30 hover:text-red-200 transition-all group overflow-hidden ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <LogOut size={20} className="shrink-0" />
            <span className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>
              Sign out
            </span>
          </button>
        </form>
      </div>

    </aside>
  );
}

// Small helper for headers
function SectionHeader({ label }: { label: string }) {
  return <div className="mb-2 mt-2 px-4 text-[10px] font-bold uppercase tracking-widest text-shell-muted whitespace-nowrap">{label}</div>;
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
          : 'hover:bg-shell-text/5 hover:text-shell-text'}
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