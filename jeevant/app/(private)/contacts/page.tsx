import PrivateShell from "@/components/layout/PrivateShell";
import { createContactAction, deleteContactAction, getContacts } from "@/lib/actions/contact-book.actions";
import { Users, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <PrivateShell
      eyebrow="Comm center · people"
      title="Contacts"
      description="Resolve names to numbers so “message xyz” works without typing digits."
      accent="emerald"
      icon={<Users className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="panel-cyber h-fit p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Add contact</h2>
          <form action={createContactAction} className="mt-4 flex flex-col gap-3">
            <input name="name" required placeholder="Name (as you'll say it)" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="phone" placeholder="Phone (+91…)" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="whatsapp" placeholder="WhatsApp (if different)" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="email" placeholder="Email" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="instagram" placeholder="Instagram handle" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="linkedin" placeholder="LinkedIn URL" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <input name="tags" placeholder="tags, comma, separated" className="border border-shell-border bg-black px-3 py-2 text-sm text-shell-text outline-none focus:border-[#c8b48a]" />
            <button type="submit" className="border border-[#c8b48a]/50 bg-[#c8b48a]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/20">
              Save contact
            </button>
          </form>
        </aside>

        <section className="space-y-3">
          {contacts.length === 0 && (
            <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
              No contacts yet.
            </div>
          )}
          {contacts.map((contact: any) => (
            <article key={contact._id} className="panel-cyber flex flex-wrap items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-shell-text">{contact.name}</h3>
                <p className="mt-1 text-[11px] text-shell-muted">
                  {[contact.phone, contact.whatsapp, contact.email, contact.instagram, contact.linkedin]
                    .filter(Boolean)
                    .join(" · ") || "no details"}
                </p>
                {contact.tags?.length > 0 && (
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#c8b48a]">
                    {contact.tags.map((tag: string) => `#${tag}`).join(" ")}
                  </p>
                )}
              </div>
              <form action={deleteContactAction}>
                <input type="hidden" name="id" value={contact._id} />
                <button className="flex items-center gap-2 border border-rose-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/30">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </form>
            </article>
          ))}
        </section>
      </div>
    </PrivateShell>
  );
}
