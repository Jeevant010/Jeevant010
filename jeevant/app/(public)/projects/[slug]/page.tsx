import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { formatWhen, getLife, getProject } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const life = await getLife();
  const project = getProject(life, slug);
  return project
    ? { title: `${project.title} · Jeevant Mudgil`, description: project.description }
    : { title: "Project not found" };
}

export default async function ProjectDossier({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const life = await getLife();
  const project = getProject(life, slug);

  if (!project) notFound();

  const index = life.projects.findIndex((item) => item.slug === project.slug);
  const next = life.projects[(index + 1) % life.projects.length];
  const prev = life.projects[(index - 1 + life.projects.length) % life.projects.length];

  return (
    <div className="palace relative min-h-screen">
      <div className="palace-stars opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-[1100px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--paper)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the record
        </Link>

        <header className="mt-12 border-b border-[var(--line)] pb-12">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
            <span className="text-[var(--signal)]">{project.lane}</span>
            <span className="h-3 w-px bg-[var(--line)]" />
            <span>{project.status}</span>
            <span className="h-3 w-px bg-[var(--line)]" />
            <span>{project.language}</span>
            {project.start && (
              <>
                <span className="h-3 w-px bg-[var(--line)]" />
                <span>{formatWhen(project.start)}</span>
              </>
            )}
          </div>

          <h1 className="mt-5 font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.88] tracking-[-0.055em]">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--paper)]/80">{project.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer" className="palace-cta palace-cta-solid">
                <Github className="h-4 w-4" /> Open repository
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" className="palace-cta">
                Open live <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            <Link href="/contact" className="palace-cta">
              Ask about this
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_16rem]">
          <article className="chat-md max-w-none text-[15px] leading-8 text-[var(--muted)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.detail || project.description}
            </ReactMarkdown>
          </article>

          <aside className="h-fit border border-[var(--line)] p-5">
            <p className="text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">Record</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Status</dt>
                <dd className="mt-1 text-[var(--paper)]">{project.status}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Started</dt>
                <dd className="mt-1 text-[var(--paper)]">{project.start ? formatWhen(project.start) : "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Language</dt>
                <dd className="mt-1 text-[var(--paper)]">{project.language}</dd>
              </div>
            </dl>

            {project.stack.length > 0 && (
              <>
                <p className="mt-6 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">Built with</p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {project.stack.map((tech) => (
                    <li key={tech} className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      {tech}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>

        <nav className="mt-20 grid gap-4 border-t border-[var(--line)] pt-8 sm:grid-cols-2">
          <Link href={`/projects/${encodeURIComponent(prev.slug)}`} className="group border border-[var(--line)] p-5 transition hover:border-[var(--signal)]">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Previous</p>
            <p className="mt-2 font-serif text-2xl leading-tight tracking-[-0.03em] transition group-hover:text-[var(--signal)]">
              {prev.title}
            </p>
          </Link>
          <Link href={`/projects/${encodeURIComponent(next.slug)}`} className="group border border-[var(--line)] p-5 text-right transition hover:border-[var(--signal)]">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Next</p>
            <p className="mt-2 font-serif text-2xl leading-tight tracking-[-0.03em] transition group-hover:text-[var(--signal)]">
              {next.title}
            </p>
          </Link>
        </nav>
      </div>
    </div>
  );
}
