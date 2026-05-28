import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-shell flex min-h-screen flex-col relative">
      <div className="film-grain" />
      <nav className="sticky top-0 z-50 border-b border-shell-border bg-shell-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-black tracking-tight text-shell-text relative group">
            Jeevant<span className="text-shell-accent">.dev</span>
            <div className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[color:var(--shell-accent)] transition-all group-hover:w-full" />
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-shell-muted md:flex">
            <Link href="/about" className="transition hover:text-shell-text hover:drop-shadow-md">Profile</Link>
            <Link href="/journey" className="transition hover:text-shell-text hover:drop-shadow-md">Journey</Link>
            <Link href="/projects" className="transition hover:text-shell-text hover:drop-shadow-md">Projects</Link>
            <Link href="/research" className="transition hover:text-shell-text hover:drop-shadow-md">Research</Link>
            <Link href="/library" className="transition hover:text-shell-text hover:drop-shadow-md">Library</Link>
            <Link href="/schedule" className="transition hover:text-shell-text hover:drop-shadow-md">Schedule</Link>
            <Link href="/contact" className="transition hover:text-shell-text hover:drop-shadow-md">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      <footer className="border-t border-shell-border bg-shell-bg relative z-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-shell-text">Jeevant</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-shell-muted">
              A cinematic portfolio and operating dashboard for work, research, and the story behind the code.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-shell-text">Public Pages</h4>
            <div className="mt-4 grid gap-3 text-sm text-shell-muted">
              <Link href="/about" className="transition hover:text-shell-text">Profile</Link>
              <Link href="/journey" className="transition hover:text-shell-text">Journey</Link>
              <Link href="/projects" className="transition hover:text-shell-text">Projects</Link>
              <Link href="/research" className="transition hover:text-shell-text">Research</Link>
              <Link href="/library" className="transition hover:text-shell-text">Library</Link>
              <Link href="/schedule" className="transition hover:text-shell-text">Schedule</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-shell-text">More</h4>
            <div className="mt-4 grid gap-3 text-sm text-shell-muted">
              <Link href="/contact" className="transition hover:text-shell-text">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-shell-text">Contact</h4>
            <p className="mt-4 text-sm leading-6 text-shell-muted">
              Open to full-time roles, freelance work, and portfolio collaborations.
            </p>
            <Link href="/contact" className="mt-4 inline-flex rounded-full border border-shell-border bg-shell-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-shell-text transition hover:border-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/10 hover:shadow-[0_0_15px_var(--cinematic-glow)]">
              Send a message
            </Link>
          </div>
        </div>

        <div className="border-t border-shell-border py-4 text-center text-xs uppercase tracking-[0.2em] text-shell-muted">
          © {new Date().getFullYear()} Jeevant Mudgil. Built with Next.js and MongoDB.
        </div>
      </footer>
    </div>
  );
}