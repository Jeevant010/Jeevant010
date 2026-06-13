"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  // Icons
  LayoutDashboard, Crosshair, Briefcase, Brain, Library, Box, 
  FileCog, Sword, UserCog, 
  LogOut, Monitor, Settings,
  Menu, X, Calendar, Compass, FileText, Award,
  Code, Radio, Mail, Wrench
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
          <span className="font-bold uppercase tracking-[0.3em] text-[10px] text-[color:var(--accent)]">
            SYSTEM_MENU
          </span>
        ) : (
          <span className="w-full text-center text-xs font-bold text-[color:var(--accent)]">OS</span>
        )}

        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-shell-surface rounded text-[color:var(--accent)] transition-colors border border-transparent hover:border-[color:var(--accent)]/50"
        >
          {isMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* --- MODE SWITCHER (Tabs) --- */}
      {isExpanded && (
        <div className="p-4 shrink-0">
          <div className="flex w-full items-center justify-between rounded bg-[#111] border border-shell-border p-1">
            <button 
              onClick={() => setMode("VIEW")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${mode === "VIEW" ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'hover:text-white'}`}
            >
              <Monitor size={14} /> View
            </button>
            <button 
              onClick={() => setMode("ADMIN")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${mode === "ADMIN" ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'hover:text-white'}`}
            >
              <Settings size={14} /> Admin
            </button>
          </div>
        </div>
      )}

      {/* --- MODE ICONS (Collapsed) --- */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-4 py-4 shrink-0 border-b border-shell-border">
           <button onClick={() => setMode("VIEW")} className={`p-2 rounded border transition-colors ${mode === "VIEW" ? "text-blue-400 bg-blue-600/10 border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]" : "text-shell-muted border-transparent hover:border-white/20"}`} title="View Mode">
             <Monitor size={18} />
           </button>
           <button onClick={() => setMode("ADMIN")} className={`p-2 rounded border transition-colors ${mode === "ADMIN" ? "text-amber-500 bg-amber-500/10 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "text-shell-muted border-transparent hover:border-white/20"}`} title="Admin Mode">
             <Settings size={18} />
           </button>
        </div>
      )}

      {/* --- SCROLLABLE LINKS --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {mode === "VIEW" ? (
            <>
              {isExpanded && <SectionHeader label="Private Tools" />}
              <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" active={pathname === "/dashboard"} expanded={isExpanded} />
              <SidebarItem href="/planner/daily" icon={<Crosshair size={18} />} label="Agenda" active={pathname.includes("planner")} expanded={isExpanded} />
              <SidebarItem href="/brain" icon={<Brain size={18} />} label="Notes" active={pathname === "/brain"} expanded={isExpanded} />
              <SidebarItem href="/career" icon={<Briefcase size={18} />} label="Career" active={pathname === "/career"} expanded={isExpanded} />
              <SidebarItem href="/learning" icon={<Library size={18} />} label="Learning" active={pathname === "/learning"} expanded={isExpanded} />
              <SidebarItem href="/arsenal" icon={<Wrench size={18} />} label="Arsenal" active={pathname === "/arsenal"} expanded={isExpanded} />
              
              {isExpanded && <div className="mt-4"><SectionHeader label="Public Site" /></div>}
              <SidebarItem href="/" icon={<Box size={18} />} label="Home" active={pathname === "/"} expanded={isExpanded} />
              <SidebarItem href="/about" icon={<UserCog size={18} />} label="About" active={pathname === "/about"} expanded={isExpanded} />
              <SidebarItem href="/projects" icon={<Code size={18} />} label="Projects" active={pathname === "/projects"} expanded={isExpanded} />
              <SidebarItem href="/journey" icon={<Sword size={18} />} label="Journey" active={pathname === "/journey"} expanded={isExpanded} />
              <SidebarItem href="/schedule" icon={<Calendar size={18} />} label="Schedule" active={pathname === "/schedule"} expanded={isExpanded} />
              <SidebarItem href="/research" icon={<Radio size={18} />} label="Research" active={pathname === "/research"} expanded={isExpanded} />
              <SidebarItem href="/library" icon={<Library size={18} />} label="Library" active={pathname === "/library"} expanded={isExpanded} />
              <SidebarItem href="/contact" icon={<Mail size={18} />} label="Contact" active={pathname === "/contact"} expanded={isExpanded} />
            </>
          ) : (
            <>
              {isExpanded && <SectionHeader label="Content Management" />}
              <SidebarItem href="/cms/projects" icon={<FileCog size={18} />} label="Projects" active={pathname.includes("projects")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/rpg" icon={<Sword size={18} />} label="RPG System" active={pathname.includes("rpg")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/schedule" icon={<Calendar size={18} />} label="Schedule" active={pathname.includes("schedule")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/expertise" icon={<Award size={18} />} label="Expertise" active={pathname.includes("expertise")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/journey" icon={<Compass size={18} />} label="Journey" active={pathname.includes("journey")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/resume" icon={<FileText size={18} />} label="Resume" active={pathname.includes("resume")} isCms expanded={isExpanded} />
              <SidebarItem href="/cms/profile" icon={<UserCog size={18} />} label="Identity" active={pathname.includes("profile")} isCms expanded={isExpanded} />
            </>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-shell-border shrink-0 bg-[#050505]">
        <form action={logout}>
          <button className={`cut-corners flex w-full items-center gap-3 border border-red-900/50 bg-red-950/30 p-3 text-red-500 hover:bg-red-900/50 hover:text-red-300 hover:shadow-[0_0_15px_rgba(153,27,27,0.3)] transition-all group overflow-hidden ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <LogOut size={18} className="shrink-0" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>
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
  return <div className="mb-2 mt-2 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-shell-muted/70 whitespace-nowrap">{label}</div>;
}

// Sidebar Item
function SidebarItem({ href, icon, label, active, isCms, expanded }: any) {
  return (
    <Link 
      href={href}
      title={!expanded ? label : ""}
      className={`cut-corners flex items-center gap-3 p-3 transition-all duration-300 whitespace-nowrap overflow-hidden
        ${active 
          ? (isCms ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-blue-600/10 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.1)]') 
          : 'border border-transparent hover:bg-white/5 hover:text-white'}
        ${expanded ? 'justify-start' : 'justify-center'}
      `}
    >
      <span className="shrink-0">{icon}</span>
      <span className={`text-[11px] font-bold uppercase tracking-widest transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 hidden w-0'}`}>
        {label}
      </span>
    </Link>
  )
}