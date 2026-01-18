import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  BrainCircuit, 
  Briefcase, 
  Settings 
} from "lucide-react"; // Make sure you ran: npm install lucide-react

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add Authentication Check Here (e.g. if (!user) return redirect('/login'))

  const navItems = [
    { name: "Cockpit", href: "/dashboard", icon: LayoutDashboard },
    { name: "Planner", href: "/planner/daily", icon: CalendarDays },
    { name: "Second Brain", href: "/brain", icon: BookOpen },
    { name: "Learning", href: "/learning", icon: BrainCircuit },
    { name: "Career CRM", href: "/career", icon: Briefcase },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* --- Admin Sidebar --- */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-950">
        <div className="p-6 h-16 flex items-center border-b border-slate-800">
          <span className="font-bold text-lg tracking-widest text-slate-400">JEEVANT<span className="text-white">OS</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">
            Operations
          </div>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition group"
            >
              <item.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              {item.name}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-2">
            System
          </div>
          <Link href="/cms/projects" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition">
             <Settings className="w-4 h-4" />
             Manage Content
          </Link>
        </nav>

        {/* User Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              JM
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Jeevant M.</span>
              <span className="text-xs text-green-400">● Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Dashboard Content --- */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}