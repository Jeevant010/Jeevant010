"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Loader2, Send } from "lucide-react";
import { sendMessage } from "@/lib/actions/contact.actions";

type Channel = { label: string; value: string; href: string };

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm({
  channels,
  availability,
}: {
  channels: Channel[];
  availability: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get("senderName") || !data.get("senderContact") || !data.get("content")) return;

    setStatus("sending");
    setError("");
    try {
      await sendMessage(data);
      setStatus("sent");
      form.reset();
    } catch (cause) {
      setStatus("error");
      setError((cause as Error).message || "The message could not be saved.");
    }
  }

  return (
    <div className="palace relative min-h-screen">
      <div className="palace-aurora opacity-50" aria-hidden />
      <div className="relative mx-auto grid max-w-[1200px] gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="palace-kicker">Contact · open channel</p>
          <h1 className="mt-5 font-serif text-[clamp(3.6rem,9vw,7rem)] leading-[0.86] tracking-[-0.06em]">
            Say the
            <br />
            thing<span className="text-[var(--signal)]">.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--muted)]">
            Full-time roles, freelance builds, research collaborations, or a hard problem that needs another brain.
            The message lands in the same database the assistant reads, so it will not be lost in an inbox.
          </p>

          <div className="mt-10">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center justify-between border-t border-[var(--line)] py-4"
              >
                <span className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">{channel.label}</span>
                <span className="flex items-center gap-2 text-sm text-[var(--paper)] transition group-hover:text-[var(--signal)]">
                  {channel.value}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="live-dot" />
            {availability}
          </div>
        </div>

        <div className="border border-[var(--line)] bg-black/25 p-6 backdrop-blur sm:p-8">
          {status === "sent" ? (
            <div className="flex min-h-[28rem] flex-col items-start justify-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--signal)] text-[var(--signal)]">
                <Check className="h-6 w-6" />
              </span>
              <h2 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.04em]">Message stored.</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--muted)]">
                It is in the database now. Jeevant will see it in the admin console, and the assistant can read it
                back. No forms disappearing into a void.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-7 text-[10px] uppercase tracking-[0.22em] text-[var(--signal)] underline underline-offset-4"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="senderName" className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  Your name
                </label>
                <input
                  id="senderName"
                  name="senderName"
                  required
                  autoComplete="name"
                  placeholder="Who is writing?"
                  className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 text-sm text-[var(--paper)] outline-none transition placeholder:text-[var(--muted)]/50 focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label htmlFor="senderContact" className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  Email or phone
                </label>
                <input
                  id="senderContact"
                  name="senderContact"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 text-sm text-[var(--paper)] outline-none transition placeholder:text-[var(--muted)]/50 focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label htmlFor="content" className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  The message
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={7}
                  placeholder="What are we making, fixing, or figuring out?"
                  className="mt-2 w-full resize-none border-b border-[var(--line)] bg-transparent py-3 text-sm leading-7 text-[var(--paper)] outline-none transition placeholder:text-[var(--muted)]/50 focus:border-[var(--signal)]"
                />
              </div>

              <fieldset>
                <legend className="text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Priority</legend>
                <div className="mt-3 flex gap-2">
                  {[
                    { value: "low", label: "Normal" },
                    { value: "high", label: "Urgent" },
                  ].map((option, index) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 border border-[var(--line)] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition has-[:checked]:border-[var(--signal)] has-[:checked]:text-[var(--signal)]"
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={option.value}
                        defaultChecked={index === 0}
                        className="accent-[var(--signal)]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {status === "error" && (
                <p className="border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs text-rose-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="palace-cta palace-cta-solid w-full justify-center disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Storing
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send the message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
