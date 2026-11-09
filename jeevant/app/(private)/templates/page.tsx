import PrivateShell from "@/components/layout/PrivateShell";
import TemplateList from "@/components/templates/TemplateList";
import { createTemplateAction, getTemplates } from "@/lib/actions/template.actions";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <PrivateShell
      eyebrow="Comm center · shortcuts"
      title="Templates"
      description="Copy-paste replies, emails, posts, and meeting notes. One tap to clipboard."
      accent="emerald"
      icon={<ClipboardList className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">New template</h2>
          <form action={createTemplateAction} className="mt-4 flex flex-col gap-3">
            <input name="name" required placeholder="Name" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <select name="kind" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]">
              {["email", "linkedin", "whatsapp", "post", "reply", "meeting", "other"].map((kind) => (
                <option key={kind} value={kind}>{kind}</option>
              ))}
            </select>
            <textarea
              name="body"
              rows={8}
              required
              placeholder="Subject / body / placeholders like {{name}}"
              className="resize-y border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a] custom-scrollbar"
            />
            <input name="tags" placeholder="tags, comma, separated" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <button type="submit" className="border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
              Save template
            </button>
          </form>
        </aside>

        <section>
          <TemplateList templates={templates} />
        </section>
      </div>
    </PrivateShell>
  );
}
