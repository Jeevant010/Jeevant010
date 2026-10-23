import Link from "next/link";
import { getLife } from "@/lib/catalog/live";
import { CV } from "@/lib/catalog/cv";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Research · Jeevant Mudgil",
  description: "Two papers in progress: agentic control of Unreal Engine 5, and privacy-preserving gunshot detection on edge devices.",
};

export default async function ResearchPage() {
  const life = await getLife();

  return (
    <div className="notebook min-h-screen text-[#e8e4da]">
      <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <header className="grid gap-10 border-b border-[rgba(243,239,230,0.12)] pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b45c46]">Lab notebook · two papers</p>
            <h1 className="mt-5 font-serif text-[clamp(3.4rem,10vw,7rem)] leading-[0.86] tracking-[-0.055em]">
              Research<span className="text-[#b45c46]">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#a9a49b]">
              A fourth-year student writing a first pair of papers. This page tracks only what is actually being
              written, with the open questions and the measurements still missing.
            </p>
          </div>
          <div className="border border-[rgba(243,239,230,0.12)] p-5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#a9a49b]">Status</p>
            <p className="mt-2 font-serif text-2xl">{CV.research.filter((item) => item.status === "writing").length} in writing</p>
            <p className="mt-2 text-xs leading-6 text-[#a9a49b]">
              No published results yet. Drafts and negative results are part of the record.
            </p>
          </div>
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[13rem_1fr]">
          <aside className="h-fit lg:sticky lg:top-24">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#a9a49b]">In this notebook</p>
            <ol className="mt-4 space-y-3 text-sm">
              {CV.research.map((item, index) => (
                <li key={item.title} className="text-[#a9a49b]">
                  <span className="mr-2 font-serif text-[#b45c46]">{String(index + 1).padStart(2, "0")}</span>
                  {item.title.split(":")[0]}
                </li>
              ))}
              <li className="text-[#a9a49b]">
                <span className="mr-2 font-serif text-[#b45c46]">03</span>
                Reading that fed the work
              </li>
            </ol>
          </aside>

          <main>
            {CV.research.map((item, index) => (
              <article key={item.title} className="notebook-margin mb-12 pl-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-[#b45c46]">
                    Paper {String(index + 1).padStart(2, "0")} · {item.status}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#a9a49b]">{item.when}</p>
                </div>
                <h2 className="mt-3 font-serif text-[clamp(1.9rem,4vw,3rem)] leading-[1.02] tracking-[-0.04em]">
                  {item.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9a49b]">{item.detail}</p>
                <div className="mt-5 border border-[rgba(243,239,230,0.1)] bg-black/20 p-4">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#a9a49b]">Open questions</p>
                  <p className="mt-2 text-sm leading-6 text-[#d8d3c8]">
                    {index === 0
                      ? "How does the tool boundary stay safe when the editor is mid-compile? What is the latency budget for a round trip from prompt to viewport?"
                      : "Can a quantized model hold recall on a microcontroller without leaking raw audio? What is the cost of a false negative in a real deployment?"}
                  </p>
                </div>
              </article>
            ))}

            <section className="border-t border-[rgba(243,239,230,0.12)] pt-10">
              <h2 className="text-[9px] uppercase tracking-[0.28em] text-[#b45c46]">Reading that fed the work</h2>
              <ul className="mt-5 grid gap-2">
                {CV.reading.map((title) => (
                  <li key={title} className="flex gap-3 border-b border-[rgba(243,239,230,0.08)] pb-2 text-sm text-[#a9a49b]">
                    <span className="text-[#b45c46]">—</span>
                    {title}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-12 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="border border-[rgba(243,239,230,0.25)] px-4 py-3 text-[10px] uppercase tracking-[0.2em] transition hover:border-[#b45c46] hover:text-[#b45c46]"
              >
                See the work behind the papers
              </Link>
              <a
                href={`mailto:${life.profile.email}`}
                className="bg-[#b45c46] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-[#0a0a0b] transition hover:bg-[#d0745c]"
              >
                Collaborate
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
