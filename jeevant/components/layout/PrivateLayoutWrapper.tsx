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

  // Handle screen resize to auto-collapse on mobile
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
    
    // Init
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // APP SHELL: 100vh height, Hidden Overflow (No scrollbars on body)
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-slate-300">
      
      {/* --- SIDEBAR CONTAINER (Desktop) --- 
          This div takes up physical space. The Main content MUST shrink to accommodate it.
      */}
      <div 
        className={`hidden md:block shrink-0 transition-[width] duration-300 ease-in-out relative z-40 ${
          isExpanded ? "w-[240px]" : "w-[80px]"
        }`}
      >
        <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} isMobile={false} />
      </div>

      {/* --- MAIN CONTENT AREA --- 
          flex-1: Fill remaining width
          min-w-0: CRITICAL. This forces grids inside to shrink instead of overflow.
          overflow-y-auto: Independent vertical scrolling.
      */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden relative bg-[#050505] transition-all duration-300">
        
        {/* Mobile Header (Only visible < 768px) */}
        <div className="md:hidden sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between">
           <span className="font-bold uppercase tracking-widest text-xs">Jeevant_OS</span>
           <button onClick={() => setIsExpanded(true)} className="p-2 border border-white/10 rounded text-white">
             <Menu size={18} />
           </button>
        </div>

        {/* PAGE CONTENT */}
        <div className="w-full">
          {children}
        </div>

      </main>

      {/* --- MOBILE OVERLAY SIDEBAR --- 
          Fixed on top of everything. Only for mobile.
      */}
      <div 
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0a0a0a] shadow-2xl transform transition-transform duration-300 ease-out ${
          isExpanded ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isExpanded={true} toggleSidebar={() => setIsExpanded(false)} isMobile={true} />
      </div>

      {/* Mobile Backdrop */}
      {isExpanded && isMobile && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

    </div>
  );
}