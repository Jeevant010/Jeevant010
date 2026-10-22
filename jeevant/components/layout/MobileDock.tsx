"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Mic, PenLine, ShieldCheck, LayoutDashboard } from "lucide-react";

const ITEMS = [
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/voice", label: "Voice", icon: Mic },
  { href: "/studio", label: "Studio", icon: PenLine },
  { href: "/approvals", label: "Approve", icon: ShieldCheck },
  { href: "/dashboard", label: "Board", icon: LayoutDashboard },
];

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07080a]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                active ? "text-[#c8b48a]" : "text-shell-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
