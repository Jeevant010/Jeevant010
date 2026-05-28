"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";

export default function PrivateLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsExpanded(false);
      } else {
        setIsMobile(false);
        setIsExpanded(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // APP SHELL: The Mind Place OS
    <div className="flex h-screen w-full bg-[color:var(--mindplace-bg)] overflow-hidden text-shell-text relative font-mono">
      
      {/* Mind Place FX */}
      <div className="absolute inset-0 bg-mindplace-grid opacity-30 pointer-events-none z-0" />
      <div className="film-grain z-50" />

      {/* --- SIDEBAR CONTAINER --- */}
      <div 
        className={`hidden md:block shrink-0 transition-[width] duration-300 ease-in-out relative z-40 border-r border-shell-border bg-shell-bg/40 backdrop-blur-xl ${
          isExpanded ? "w-[240px]" : "w-[80px]"
        }`}
      >
        <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} isMobile={false} />
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden relative z-10 transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-shell-bg/80 backdrop-blur-md p-4 border-b border-shell-border flex items-center justify-between">
           <span className="font-bold uppercase tracking-widest text-xs text-[color:var(--accent)]">Jeevant_OS // Mind_Place</span>
           <button title="menu" onClick={() => setIsExpanded(true)} className="p-2 border border-shell-border rounded text-shell-text">
             <Menu size={18} />
           </button>
        </div>

        <div className="w-full h-full relative">
          {children}
        </div>

      </main>

      {/* --- MOBILE OVERLAY SIDEBAR --- */}
      <div 
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[240px] bg-[#050505] shadow-2xl transform transition-transform duration-300 ease-out ${
          isExpanded ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isExpanded={true} toggleSidebar={() => setIsExpanded(false)} isMobile={true} />
      </div>

      {/* Mobile Backdrop */}
      {isExpanded && isMobile && (
        <div 
          className="md:hidden fixed inset-0 bg-shell-bg/80 z-40 backdrop-blur-md"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}