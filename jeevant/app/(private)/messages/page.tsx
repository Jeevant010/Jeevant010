import PrivateShell from "@/components/layout/PrivateShell";
import MessageComposer from "@/components/messages/MessageComposer";
import { getOutboundMessages } from "@/lib/actions/message.actions";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_STYLE: Record<string, string> = {
  whatsapp: "border-emerald-700/60 bg-emerald-950/20 text-emerald-300",
  sms: "border-sky-700/60 bg-sky-950/20 text-sky-300",
  call: "border-amber-700/60 bg-amber-950/20 text-amber-300",
};

export default async function MessagesPage() {
  const messages = await getOutboundMessages();

  return (
    <PrivateShell
      eyebrow="Comm center · messaging"
      title="Messages"
      description="WhatsApp, SMS, and calls. Every send is approval-gated by default."
      accent="emerald"
      icon={<MessageSquare className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <MessageComposer />

        <section className="panel-cyber p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-shell-muted">Outbound log</h2>
          <div className="mt-4 flex max-h-[60vh] flex-col gap-2 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && (
              <p className="py-6 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
                Nothing sent yet.
              </p>
            )}
            {messages.map((message: any) => (
              <div key={message._id} className="border-b border-white/5 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${CHANNEL_STYLE[message.channel] || ""}`}>
                    {message.channel}
                  </span>
                  <span className="text-xs text-shell-text">{message.to}</span>
                  <span className={`ml-auto text-[9px] uppercase tracking-widest ${message.status === "sent" ? "text-emerald-400" : "text-rose-400"}`}>
                    {message.status} · {message.mode}
                  </span>
                </div>
                {message.body && <p className="mt-1 line-clamp-2 text-[11px] text-shell-muted">{message.body}</p>}
                <p className="mt-1 text-[9px] uppercase tracking-widest text-shell-muted/60">
                  {new Date(message.createdAt).toLocaleString()} · {message.provider}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PrivateShell>
  );
}
