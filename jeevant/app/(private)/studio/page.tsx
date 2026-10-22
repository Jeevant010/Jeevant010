import { getPosts } from "@/lib/actions/content.actions";
import Composer from "@/components/content/Composer";
import PostBoard from "@/components/content/PostBoard";
import PrivateShell from "@/components/layout/PrivateShell";
import { PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const posts = await getPosts();

  return (
    <PrivateShell
      eyebrow="Comm center · broadcast"
      title="Content Studio"
      description="Write once. Ship to WhatsApp, Telegram, X, LinkedIn, Reddit, and Gmail."
      accent="violet"
      icon={<PenLine className="h-6 w-6 text-violet-400" />}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Composer />
        <PostBoard posts={posts as any} />
      </div>
    </PrivateShell>
  );
}
