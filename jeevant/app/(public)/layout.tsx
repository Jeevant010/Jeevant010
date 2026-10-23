import Link from "next/link";
import PublicNav from "@/components/layout/PublicNav";
import ImmersiveChrome from "@/components/public/ImmersiveChrome";
import { getLife } from "@/lib/catalog/live";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const life = await getLife();

  return (
    <ImmersiveChrome>
      <div className="stage flex min-h-screen flex-col">
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
            <p className="mt-4 text-sm leading-6 text-shell-muted">{life.profile.availability}</p>
            <a
              href={`mailto:${life.profile.email}`}
              className="mt-2 block text-sm text-shell-text underline-offset-4 hover:underline"
            >
              {life.profile.email}
            </a>
            <Link href="/contact" className="mt-4 inline-flex rounded-full border border-shell-border bg-shell-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-shell-text transition hover:border-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/10 hover:shadow-[0_0_15px_var(--cinematic-glow)]">
              Send a message
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--stage-line)] px-4 py-4 text-xs uppercase tracking-[0.2em] text-[var(--stage-muted)] sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} {life.profile.name}</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a8c49a]" />
            {life.live ? `${life.projects.length} live records · ${life.profile.location}` : "Archive mode · database offline"}
          </span>
        </div>
      </footer>
      </div>
    </ImmersiveChrome>
  );
}