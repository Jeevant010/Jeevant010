import Link from "next/link";
import PublicNav from "@/components/layout/PublicNav";
import ImmersiveChrome from "@/components/public/ImmersiveChrome";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImmersiveChrome>
      <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-[var(--stage-line)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-shell-text">Jeevant</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-shell-muted">
              AI systems, game tools, and full-stack products. The public repositories are the proof.
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
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-shell-text">More</h4>
            <div className="mt-4 grid gap-3 text-sm text-shell-muted">
              <Link href="/cv" className="transition hover:text-shell-text">CV</Link>
              <Link href="/contact" className="transition hover:text-shell-text">Contact</Link>
              <Link href="/login" className="transition hover:text-shell-text">Operator login</Link>
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

        <div className="border-t border-[var(--stage-line)] py-4 text-center text-xs uppercase tracking-[0.2em] text-[var(--stage-muted)]">
          © {new Date().getFullYear()} Jeevant Mudgil
        </div>
      </footer>
      </div>
    </ImmersiveChrome>
  );
}