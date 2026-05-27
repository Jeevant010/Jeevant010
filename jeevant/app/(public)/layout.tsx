import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-shell flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--shell-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-black tracking-tight text-[color:var(--shell-text)]">
            Jeevant<span className="text-[color:var(--shell-accent)]">.dev</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[color:var(--shell-muted)] md:flex">
            <Link href="/journey" className="transition hover:text-[color:var(--shell-text)]">Journey</Link>
            <Link href="/expertise" className="transition hover:text-[color:var(--shell-text)]">Expertise</Link>
            <Link href="/projects" className="transition hover:text-[color:var(--shell-text)]">Projects</Link>
            <Link href="/research" className="transition hover:text-[color:var(--shell-text)]">Research</Link>
            <Link href="/library" className="transition hover:text-[color:var(--shell-text)]">Library</Link>
            <Link href="/resume" className="transition hover:text-[color:var(--shell-text)]">Resume</Link>
            <Link href="/schedule" className="transition hover:text-[color:var(--shell-text)]">Schedule</Link>
            <Link href="/responsibilities" className="transition hover:text-[color:var(--shell-text)]">Responsibilities</Link>
            <Link href="/contact" className="transition hover:text-[color:var(--shell-text)]">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--shell-text)] transition hover:border-blue-400/50 hover:bg-blue-500/10"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[color:var(--shell-bg)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[color:var(--shell-text)]">Jeevant</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[color:var(--shell-muted)]">
              A personal portfolio and operating dashboard for work, research, writing, and the long-form story behind the resume.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--shell-text)]">Public Pages</h4>
            <div className="mt-4 grid gap-3 text-sm text-[color:var(--shell-muted)]">
              <Link href="/journey" className="transition hover:text-[color:var(--shell-text)]">Journey</Link>
              <Link href="/expertise" className="transition hover:text-[color:var(--shell-text)]">Expertise</Link>
              <Link href="/projects" className="transition hover:text-[color:var(--shell-text)]">Projects</Link>
              <Link href="/research" className="transition hover:text-[color:var(--shell-text)]">Research</Link>
              <Link href="/library" className="transition hover:text-[color:var(--shell-text)]">Library</Link>
              <Link href="/resume" className="transition hover:text-[color:var(--shell-text)]">Resume</Link>
              <Link href="/schedule" className="transition hover:text-[color:var(--shell-text)]">Schedule</Link>
              <Link href="/responsibilities" className="transition hover:text-[color:var(--shell-text)]">Responsibilities</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--shell-text)]">More</h4>
            <div className="mt-4 grid gap-3 text-sm text-[color:var(--shell-muted)]">
              <Link href="/about" className="transition hover:text-[color:var(--shell-text)]">About</Link>
              <Link href="/contact" className="transition hover:text-[color:var(--shell-text)]">Contact</Link>
              <Link href="/research" className="transition hover:text-[color:var(--shell-text)]">Research</Link>
              <Link href="/library" className="transition hover:text-[color:var(--shell-text)]">Library</Link>
              <Link href="/projects" className="transition hover:text-[color:var(--shell-text)]">Projects</Link>
              <Link href="/login" className="transition hover:text-[color:var(--shell-text)]">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--shell-text)]">Contact</h4>
            <p className="mt-4 text-sm leading-6 text-[color:var(--shell-muted)]">
              Open to full-time roles, freelance work, and portfolio collaborations.
            </p>
            <Link href="/contact" className="mt-4 inline-flex rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--shell-text)] transition hover:border-blue-400/50 hover:bg-blue-500/10">
              Send a message
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
          © {new Date().getFullYear()} Jeevant Mudgil. Built with Next.js and MongoDB.
        </div>
      </footer>
    </div>
  );
}