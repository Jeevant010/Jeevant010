"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "Profile" },
  { href: "/journey", label: "Journey" },
  { href: "/cv", label: "CV" },
  { href: "/research", label: "Research" },
  { href: "/library", label: "Library" },
  { href: "/schedule", label: "Schedule" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#090a0d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#f3efe6]">
          Jeevant
        </Link>

        <div className="hidden items-center gap-6 text-sm text-[#a39c90] md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#f3efe6]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#f3efe6] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-[#f3efe6] hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
