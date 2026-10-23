import ContactForm from "@/components/public/ContactForm";
import { getLife } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact · Jeevant Mudgil",
  description: "Start a conversation about roles, freelance builds, research, or hard problems.",
};

export default async function ContactPage() {
  const life = await getLife();
  const { profile } = life;

  const channels = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    ...profile.links.slice(0, 4).map((link) => ({
      label: link.label,
      value: link.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: link.href,
    })),
  ];

  return <ContactForm channels={channels} availability={`${profile.location} · ${profile.availability}`} />;
}
