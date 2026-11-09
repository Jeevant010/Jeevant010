// Tool registry for the operator agent.
// Every tool mutates the same MongoDB data the manual admin pages use.
// Destructive tools require an explicit `confirm: true` from the planner.

import connectDB from "@/lib/db";
import { Task, Note, Project, ContentPost, Achievement, Memory, Approval, Contact, Activity, FocusSession, Template } from "@/lib/database/models";
import { evaluateExternalAction } from "@/lib/guardrails/policy";
import { getStyleGuide } from "@/lib/style";
import { groqChat, groqConfigured } from "@/lib/integrations/groq";
import { getBriefing } from "@/lib/agent/briefing";
import { draftReply, getMessage, listMessages, summarizeMessage, summarizeMessages } from "@/lib/integrations/gmail-read";
import { checkConflicts, findFreeSlot, listUpcoming } from "@/lib/integrations/calendar-read";
import { safeFetch } from "@/lib/http/fetch";

export type ToolResult = {
  ok: boolean;
  result: string;
  needsConfirm?: boolean;
  data?: unknown;
};

export const TOOL_CATALOG = `
create_task        args: { title, priority?: "low"|"medium"|"high", dueDate?: ISO }
complete_task      args: { query }           // marks the first matching task done
delete_task        args: { query, confirm }  // confirm must be true; otherwise ask the user
create_note        args: { title, content, tags?: string[] }
delete_note        args: { query, confirm }
search_notes       args: { query }
create_project     args: { title, description, techStack?: string[], status?: "building"|"live"|"planned"|"stopped" }
create_post        args: { title, body, channels?: string[] }
add_achievement    args: { title, description?: string, when?: string }
remember           args: { text, tags?: string[] }   // durable memory about the user
recall             args: { query? }                  // search memories
web_search         args: { query }             // free instant-answer search
weather            args: { city }
send_message       args: { channel: "whatsapp"|"sms"|"call", to, body }
send_message_to    args: { name, channel: "whatsapp"|"sms"|"call", body }  // resolves a saved contact
remind             args: { what, when }         // when = ISO datetime
news               args: { count? }             // Hacker News top stories
summarize          args: { text }               // 3-bullet summary of an email/message
suggest_reply      args: { text, tone? }        // reply drafted in your learned style
log_activity       args: { kind, label, minutes, intended? }
start_activity     args: { kind, label }
stop_activity      args: { }
day_summary        args: { }
list_templates     args: { kind? }
list_tasks         args: {}
get_briefing       args: {}                  // live state: tasks, approvals, focus, activity
list_approvals     args: {}                  // pending approvals waiting on the user
start_focus        args: { intent }          // start a focus session
end_focus          args: {}                  // close the active focus session
open_page          args: { page }            // navigate: home, projects, journey, cv, research, library, contact, dashboard, planner, notes, career, learning, approvals, studio, voice, tracker, messages, contacts, integrations, automations, guardrails, arsenal, media, templates, style
gmail_search       args: { query, count? }        // read-only Gmail search
read_email         args: { id }                   // full message body
summarize_email    args: { id }                   // 3 bullets + the action it needs
email_digest       args: { query?, count? }       // one summary of recent mail
draft_email_reply  args: { id, instruction? }     // queues a Gmail draft approval
check_availability args: { start?, end?, minutes?, workStart?, workEnd? }  // real free/busy
upcoming_events    args: { days?, max? }          // next events from Google Calendar
schedule_block     args: { title, start, minutes?, notes? }  // queues a calendar approval
`.trim();

const PAGES: Record<string, { path: string; label: string }> = {
  home: { path: "/", label: "home" },
  record: { path: "/projects", label: "the record" },
  projects: { path: "/projects", label: "the record" },
  journey: { path: "/journey", label: "the journey" },
  inbox: { path: "/inbox", label: "the inbox" },
  plan: { path: "/planner/daily", label: "the daily plan" },
  people: { path: "/contacts", label: "people" },
  content: { path: "/studio", label: "content" },
  about: { path: "/about", label: "the profile" },
  profile: { path: "/about", label: "the profile" },
  cv: { path: "/cv", label: "the CV" },
  research: { path: "/research", label: "research" },
  library: { path: "/library", label: "the library" },
  contact: { path: "/contact", label: "contact" },
  assistant: { path: "/assistant", label: "the assistant" },
  agent: { path: "/agent", label: "the agent console" },
  dashboard: { path: "/dashboard", label: "the dashboard" },
  overview: { path: "/dashboard", label: "the dashboard" },
  planner: { path: "/planner/daily", label: "the daily planner" },
  agenda: { path: "/planner/daily", label: "the daily planner" },
  notes: { path: "/brain", label: "notes" },
  brain: { path: "/brain", label: "notes" },
  career: { path: "/career", label: "career" },
  learning: { path: "/learning", label: "learning" },
  approvals: { path: "/approvals", label: "approvals" },
  studio: { path: "/studio", label: "the studio" },
  voice: { path: "/voice", label: "the voice inbox" },
  tracker: { path: "/tracker", label: "the tracker" },
  messages: { path: "/messages", label: "messages" },
  contacts: { path: "/contacts", label: "contacts" },
  integrations: { path: "/integrations", label: "integrations" },
  automations: { path: "/automations", label: "automations" },
  guardrails: { path: "/guardrails", label: "guardrails" },
  arsenal: { path: "/arsenal", label: "the arsenal" },
  media: { path: "/media", label: "media" },
  templates: { path: "/templates", label: "templates" },
  style: { path: "/style", label: "the style profile" },
};

function includes(value: unknown, allowed: string[], fallback: string): string {
  const text = String(value || "");
  return allowed.includes(text) ? text : fallback;
}

const ACTIVITY_KINDS = ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"];

function activityKind(value: unknown): string {
  const text = String(value || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    work: "deep_work",
    coding: "deep_work",
    code: "deep_work",
    study: "deep_work",
    studying: "deep_work",
    focus: "deep_work",
    eat: "eating",
    food: "eating",
    meal: "eating",
    nap: "sleep",
    sleeping: "sleep",
    gym: "exercise",
    workout: "exercise",
    distraction: "waste",
    distracted: "waste",
    scrolling: "waste",
    rest: "break",
  };
  const normalized = aliases[text] || text;
  return ACTIVITY_KINDS.includes(normalized) ? normalized : "other";
}

export async function executeTool(tool: string, args: any): Promise<ToolResult> {
  try {
    await connectDB();
  } catch (error) {
    return { ok: false, result: `Database unavailable: ${(error as Error).message}` };
  }

  switch (tool) {
    case "create_task": {
      const title = String(args?.title || "").trim();
      if (!title) return { ok: false, result: "A task needs a title." };
      const doc = await Task.create({
        title,
        scope: "daily",
        priority: includes(args?.priority, ["low", "medium", "high"], "medium"),
        dueDate: args?.dueDate ? new Date(String(args.dueDate)) : undefined,
      });
      return { ok: true, result: `Created task "${doc.title}".` };
    }

    case "complete_task": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Tell me which task to complete." };
      const doc = await Task.findOneAndUpdate(
        { title: { $regex: query, $options: "i" } },
        { isCompleted: true },
        { new: true }
      );
      return doc
        ? { ok: true, result: `Marked "${doc.title}" complete.` }
        : { ok: false, result: `No task matched "${query}".` };
    }

    case "delete_task": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Tell me which task to delete." };
      const target = await Task.findOne({ title: { $regex: query, $options: "i" } });
      if (!target) return { ok: false, result: `No task matched "${query}".` };
      if (args?.confirm !== true) {
        return {
          ok: false,
          needsConfirm: true,
          result: `Deleting "${target.title}" needs confirmation. Nothing was removed.`,
        };
      }
      await Task.findByIdAndDelete(target._id);
      return { ok: true, result: `Deleted task "${target.title}".` };
    }

    case "create_note": {
      const title = String(args?.title || "").trim();
      const content = String(args?.content || "").trim();
      if (!title) return { ok: false, result: "A note needs a title." };
      const doc = await Note.create({
        title,
        content,
        tags: Array.isArray(args?.tags) ? args.tags.map(String) : [],
        visibility: "private",
      });
      return { ok: true, result: `Saved note "${doc.title}".` };
    }

    case "search_notes": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Give me something to search for." };
      const docs = await Note.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(5);
      return {
        ok: true,
        result: docs.length ? `Found ${docs.length} note(s).` : `No notes matched "${query}".`,
        data: docs.map((doc: any) => ({ id: String(doc._id), title: doc.title })),
      };
    }

    case "create_project": {
      const title = String(args?.title || "").trim();
      const description = String(args?.description || "").trim();
      if (!title || !description) return { ok: false, result: "A project needs a title and description." };
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `project-${Date.now()}`;
      const doc = await Project.create({
        title,
        slug,
        description,
        techStack: Array.isArray(args?.techStack) ? args.techStack.map(String) : [],
        status: includes(args?.status, ["building", "live", "planned", "stopped"], "planned"),
        visibility: "private",
      });
      return { ok: true, result: `Created project "${doc.title}" (slug: ${doc.slug}).` };
    }

    case "delete_note": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Tell me which note to delete." };
      const target = await Note.findOne({ title: { $regex: query, $options: "i" } });
      if (!target) return { ok: false, result: `No note matched "${query}".` };
      if (args?.confirm !== true) {
        return {
          ok: false,
          needsConfirm: true,
          result: `Deleting note "${target.title}" needs confirmation. Nothing was removed.`,
        };
      }
      await Note.findByIdAndDelete(target._id);
      return { ok: true, result: `Deleted note "${target.title}".` };
    }

    case "create_post": {
      const body = String(args?.body || "").trim();
      if (!body) return { ok: false, result: "A post needs a body." };
      const doc = await ContentPost.create({
        title: String(args?.title || ""),
        body,
        channels: Array.isArray(args?.channels) ? args.channels.map(String) : [],
        source: "ai",
        status: "draft",
      });
      return { ok: true, result: `Saved post draft "${doc.title || doc._id}".` };
    }

    case "add_achievement": {
      const title = String(args?.title || "").trim();
      if (!title) return { ok: false, result: "An achievement needs a title." };
      const doc = await Achievement.create({
        title,
        description: String(args?.description || ""),
        date: args?.when ? new Date(String(args.when)) : new Date(),
        visibility: "private",
      });
      return { ok: true, result: `Added achievement "${doc.title}".` };
    }

    case "remember": {
      const text = String(args?.text || "").trim();
      if (!text) return { ok: false, result: "Nothing to remember." };
      const doc = await Memory.create({
        text,
        tags: Array.isArray(args?.tags) ? args.tags.map(String) : [],
        source: "agent",
      });
      return { ok: true, result: `Remembered: ${doc.text}` };
    }

    case "recall": {
      const query = String(args?.query || "").trim();
      const filter = query ? { text: { $regex: query, $options: "i" } } : {};
      const docs = await Memory.find(filter).sort({ createdAt: -1 }).limit(10);
      return {
        ok: true,
        result: docs.length ? `Recalled ${docs.length} memory item(s).` : "No memories matched.",
        data: docs.map((doc: any) => ({ id: String(doc._id), text: doc.text })),
      };
    }

    case "request_approval": {
      const title = String(args?.title || "").trim();
      if (!title) return { ok: false, result: "An approval needs a title." };
      const kind = includes(
        args?.kind,
        ["email", "post", "calendar", "whatsapp", "sms", "call", "delete", "generic"],
        "generic"
      );

      // If a model falls back to a generic approval that is clearly a message,
      // convert it into an executable message approval.
      if (kind === "generic") {
        const detail = String(args?.detail || "");
        const haystack = `${title} ${detail}`.toLowerCase();
        const guess = haystack.includes("whatsapp")
          ? "whatsapp"
          : haystack.includes("sms")
          ? "sms"
          : /\bcall\b/.test(haystack)
          ? "call"
          : "";
        const phone = detail.match(/\+?\d[\d\s-]{7,}\d/);

        if (guess && phone) {
          const to = phone[0].replace(/[^0-9+]/g, "");
          const saying = detail.match(/saying[:\s]+["']?(.+?)["']?$/i);
          const body = saying ? saying[1] : detail;
          const guard = await evaluateExternalAction({ kind: guess, target: to, meta: { via: "request_approval" } });
          if (!guard.allowed) return { ok: false, result: guard.reason };
          const doc = await Approval.create({
            kind: guess,
            title: `${guess}: ${to}`,
            detail: body,
            payload: { to, body },
            status: "pending",
          });
          return { ok: true, result: `Queued ${guess} "${doc.title}" for approval. Nothing sent yet.` };
        }
      }

      // Accept the generic tool as a message request too, so a model that picks
      // request_approval still produces an approval that can actually be executed.
      if (["whatsapp", "sms", "call"].includes(kind)) {
        const payload = (args?.payload || {}) as any;
        const to = String(args?.to || payload.to || "").trim();
        const body = String(args?.body || payload.body || args?.detail || "").trim();
        if (!to) return { ok: false, result: "A recipient is required." };

        const guard = await evaluateExternalAction({ kind, target: to, meta: { via: "request_approval" } });
        if (!guard.allowed) return { ok: false, result: guard.reason };

        const doc = await Approval.create({
          kind,
          title,
          detail: body || "Outbound call",
          payload: { to, body },
          status: "pending",
        });
        return { ok: true, result: `Queued ${kind} "${doc.title}" for approval. Nothing sent yet.` };
      }

      const doc = await Approval.create({
        kind,
        title,
        detail: String(args?.detail || ""),
        payload: args?.payload || {},
        status: "pending",
      });
      return { ok: true, result: `Queued approval "${doc.title}" — nothing sent yet.` };
    }

    case "web_search": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Give me something to search for." };
      try {
        const res = await safeFetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
          { cache: "no-store" }
        );
        const data: any = await res.json();
        const parts = [
          data?.AbstractText,
          ...(Array.isArray(data?.RelatedTopics) ? data.RelatedTopics.slice(0, 3).map((topic: any) => topic?.Text) : []),
        ].filter(Boolean);
        return {
          ok: true,
          result: parts.length ? parts.join(" | ") : `No instant answer for "${query}".`,
        };
      } catch (error) {
        return { ok: false, result: (error as Error).message };
      }
    }

    case "weather": {
      const city = String(args?.city || "Surat").trim();
      try {
        const geoRes = await safeFetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
          { cache: "no-store" }
        );
        const geo: any = await geoRes.json();
        const place = geo?.results?.[0];
        if (!place) return { ok: false, result: `Could not find "${city}".` };

        const weatherRes = await safeFetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code&timezone=auto`,
          { cache: "no-store" }
        );
        const weather: any = await weatherRes.json();
        const current = weather?.current;
        if (!current) return { ok: false, result: "Weather unavailable." };

        return {
          ok: true,
          result: `${place.name}: ${current.temperature_2m}°C (feels ${current.apparent_temperature}°C), precipitation ${current.precipitation}mm, code ${current.weather_code}.`,
        };
      } catch (error) {
        return { ok: false, result: (error as Error).message };
      }
    }

    case "send_message": {
      const channel = includes(args?.channel, ["whatsapp", "sms", "call"], "");
      if (!channel) return { ok: false, result: "Channel must be whatsapp, sms, or call." };
      const to = String(args?.to || "").trim();
      const body = String(args?.body || "").trim();
      if (!to) return { ok: false, result: "A recipient is required." };

      const guard = await evaluateExternalAction({ kind: channel, target: to, meta: { via: "agent" } });
      if (!guard.allowed) return { ok: false, result: guard.reason };

      const doc = await Approval.create({
        kind: channel,
        title: `${channel === "call" ? "Call" : channel === "sms" ? "SMS" : "WhatsApp"}: ${to}`,
        detail: body || "Outbound call",
        payload: { to, body },
        status: "pending",
      });
      return { ok: true, result: `Queued ${channel} "${doc.title}" for approval. Nothing sent yet.` };
    }

    case "send_message_to": {
      const name = String(args?.name || "").trim();
      const channel = includes(args?.channel, ["whatsapp", "sms", "call"], "whatsapp");
      const body = String(args?.body || "").trim();
      if (!name) return { ok: false, result: "Which contact?" };

      const contact: any = await Contact.findOne({ name: { $regex: name, $options: "i" } });
      if (!contact) return { ok: false, result: `No contact named "${name}". Add them in /contacts.` };

      const to =
        channel === "whatsapp"
          ? contact.whatsapp || contact.phone
          : contact.phone || contact.whatsapp;
      if (!to) return { ok: false, result: `"${contact.name}" has no phone number saved.` };

      const guard = await evaluateExternalAction({ kind: channel, target: to, meta: { contact: contact.name } });
      if (!guard.allowed) return { ok: false, result: guard.reason };

      const doc = await Approval.create({
        kind: channel,
        title: `${channel === "call" ? "Call" : channel === "sms" ? "SMS" : "WhatsApp"} ${contact.name}: ${to}`,
        detail: body || "Outbound call",
        payload: { to, body },
        status: "pending",
      });
      return { ok: true, result: `Queued ${channel} to ${contact.name} for approval. Nothing sent yet.` };
    }

    case "remind": {
      const what = String(args?.what || "").trim();
      if (!what) return { ok: false, result: "What should I remind you about?" };
      const due = args?.when ? new Date(String(args.when)) : new Date(Date.now() + 60 * 60 * 1000);
      if (Number.isNaN(due.getTime())) return { ok: false, result: "That date could not be parsed." };
      const doc = await Task.create({
        title: `Reminder: ${what}`,
        scope: "daily",
        dueDate: due,
        priority: "medium",
      });
      return { ok: true, result: `Reminder set for ${due.toLocaleString()} ("${doc.title}").` };
    }

    case "news": {
      const count = Math.min(Math.max(Number(args?.count || 5), 1), 10);
      try {
        const idsRes = await safeFetch("https://hacker-news.firebaseio.com/v0/topstories.json", { cache: "no-store" });
        const ids: number[] = await idsRes.json();
        const items = await Promise.all(
          ids.slice(0, count).map(async (id) => {
            const res = await safeFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { cache: "no-store" });
            return res.json();
          })
        );
        const lines = items
          .filter((item: any) => item && item.title)
          .map((item: any) => `${item.title} (${item.score} points)`);
        return { ok: true, result: lines.length ? lines.join(" | ") : "No stories available." };
      } catch (error) {
        return { ok: false, result: (error as Error).message };
      }
    }

    case "summarize": {
      const text = String(args?.text || "").trim();
      if (!text) return { ok: false, result: "Paste the text to summarize." };
      if (!groqConfigured()) return { ok: false, result: "Set GROQ_API_KEYS / GROQ_API_KEY to enable summaries." };
      const summary = await groqChat(
        "Summarize the message in at most 3 short bullets. Then state the one action it needs, if any.",
        text,
        false
      );
      return summary
        ? { ok: true, result: summary }
        : { ok: false, result: "The summarizer returned nothing." };
    }

    case "suggest_reply": {
      const text = String(args?.text || "").trim();
      if (!text) return { ok: false, result: "Paste the message to reply to." };
      if (!groqConfigured()) return { ok: false, result: "Set GROQ_API_KEYS / GROQ_API_KEY to enable reply drafting." };
      const style = await getStyleGuide();
      const tone = String(args?.tone || "").trim();
      const reply = await groqChat(
        [
          "Write a reply to the message. Output only the reply text.",
          style ? `Match this writing style:\n${style}` : "",
          tone ? `Tone: ${tone}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        text,
        false
      );
      return reply ? { ok: true, result: reply } : { ok: false, result: "No reply generated." };
    }

    case "log_activity": {
      const label = String(args?.label || "").trim();
      const minutes = Math.max(1, Number(args?.minutes || 0));
      if (!label || !minutes) return { ok: false, result: "Activity needs a label and minutes." };
      const kind = activityKind(args?.kind);
      const end = new Date();
      const doc = await Activity.create({
        kind,
        label,
        start: new Date(end.getTime() - minutes * 60_000),
        end,
        intended: args?.intended !== false,
      });
      return { ok: true, result: `Logged ${minutes}m of ${kind}: ${doc.label}.` };
    }

    case "start_activity": {
      const label = String(args?.label || "").trim();
      if (!label) return { ok: false, result: "What are you starting?" };
      const kind = activityKind(args?.kind);
      await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
      const doc = await Activity.create({ kind, label, start: new Date(), intended: true });
      return { ok: true, result: `Tracking "${doc.label}" (${kind}).` };
    }

    case "stop_activity": {
      const open = await Activity.findOne({ end: null }).sort({ start: -1 });
      if (!open) return { ok: false, result: "Nothing is being tracked." };
      await Activity.updateMany({ end: null }, { $set: { end: new Date() } });
      return { ok: true, result: `Stopped "${open.label}".` };
    }

    case "day_summary": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const activities = await Activity.find({ start: { $gte: start } }).lean();
      const totals: Record<string, number> = {};
      for (const activity of activities as any[]) {
        const end = activity.end ? new Date(activity.end).getTime() : Date.now();
        const minutes = Math.max(0, Math.round((end - new Date(activity.start).getTime()) / 60_000));
        totals[activity.kind] = (totals[activity.kind] || 0) + minutes;
      }
      const focus: any = await FocusSession.findOne({ status: "active" }).lean();
      const parts = Object.entries(totals).map(([kind, minutes]) => `${kind} ${minutes}m`);
      return {
        ok: true,
        result: `${parts.length ? parts.join(", ") : "Nothing logged today"}.${
          focus ? ` Active focus: ${focus.intent}.` : ""
        }`,
      };
    }

    case "list_templates": {
      const kind = String(args?.kind || "").trim();
      const filter = kind
        ? { kind: ["email", "linkedin", "whatsapp", "post", "reply", "meeting", "other"].includes(kind) ? kind : "other" }
        : {};
      const docs = await Template.find(filter as any).limit(20);
      return {
        ok: true,
        result: docs.length ? docs.map((doc: any) => `${doc.name} (${doc.kind})`).join(" | ") : "No templates.",
        data: docs.map((doc: any) => ({ id: String(doc._id), name: doc.name, kind: doc.kind })),
      };
    }

    case "list_tasks": {
      const docs = await Task.find({ isCompleted: false }).sort({ createdAt: -1 }).limit(20);
      return {
        ok: true,
        result: docs.length ? `${docs.length} open task(s).` : "No open tasks.",
        data: docs.map((doc: any) => ({
          id: String(doc._id),
          title: doc.title,
          priority: doc.priority,
          due: doc.dueDate ? new Date(doc.dueDate).toISOString() : null,
        })),
      };
    }

    case "get_briefing": {
      const briefing = await getBriefing();
      return {
        ok: true,
        result: `${briefing.greeting}. ${briefing.line}`,
        data: briefing,
      };
    }

    case "list_approvals": {
      const docs = await Approval.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10).lean();
      return {
        ok: true,
        result: docs.length ? `${docs.length} approval(s) waiting: ${docs.map((doc: any) => doc.title).join(" | ")}` : "No approvals waiting.",
        data: docs.map((doc: any) => ({ id: String(doc._id), title: doc.title, kind: doc.kind, detail: doc.detail })),
      };
    }

    case "start_focus": {
      const intent = String(args?.intent || "").trim();
      if (!intent) return { ok: false, result: "What is the focus for this session?" };
      await FocusSession.updateMany({ status: "active" }, { $set: { status: "done", endedAt: new Date() } });
      const doc = await FocusSession.create({ intent, status: "active", startedAt: new Date() });
      return { ok: true, result: `Focus started: ${doc.intent}.` };
    }

    case "end_focus": {
      const active: any = await FocusSession.findOne({ status: "active" }).sort({ startedAt: -1 });
      if (!active) return { ok: false, result: "No focus session is active." };
      active.status = "done";
      active.endedAt = new Date();
      await active.save();
      const minutes = Math.max(0, Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60_000));
      return { ok: true, result: `Focus closed after ${minutes}m: ${active.intent}.` };
    }

    case "gmail_search": {
      const query = String(args?.query || "").trim();
      if (!query) return { ok: false, result: "Give me something to search for." };
      const found = await listMessages({ query, count: Number(args?.count) || 8 });
      return {
        ok: found.ok,
        result: found.ok
          ? `${found.detail} ${found.messages.map((message) => `${message.from}: ${message.subject}`).join(" | ")}`
          : found.detail,
        data: found.messages,
      };
    }

    case "read_email": {
      const id = String(args?.id || "").trim();
      if (!id) return { ok: false, result: "I need a message id." };
      const message = await getMessage(id);
      if (!message.ok || !message.message) return { ok: false, result: message.detail };
      return {
        ok: true,
        result: `${message.message.subject} — ${message.message.from}\n${message.message.body.slice(0, 1500)}`,
        data: { id: message.message.id, subject: message.message.subject, from: message.message.from },
      };
    }

    case "summarize_email": {
      const id = String(args?.id || "").trim();
      if (!id) return { ok: false, result: "I need a message id." };
      const message = await getMessage(id);
      if (!message.ok || !message.message) return { ok: false, result: message.detail };
      const summary = await summarizeMessage(message.message);
      return { ok: summary.ok, result: summary.detail, data: { id } };
    }

    case "email_digest": {
      const found = await listMessages({ query: String(args?.query || "in:inbox"), count: Number(args?.count) || 8 });
      if (!found.ok) return { ok: false, result: found.detail };
      const summary = await summarizeMessages(found.messages);
      return { ok: summary.ok, result: summary.detail, data: found.messages };
    }

    case "draft_email_reply": {
      const id = String(args?.id || "").trim();
      if (!id) return { ok: false, result: "I need a message id." };
      const message = await getMessage(id);
      if (!message.ok || !message.message) return { ok: false, result: message.detail };

      const draft = await draftReply({ message: message.message, instruction: String(args?.instruction || "") });
      if (!draft.ok) return { ok: false, result: draft.detail };

      const guard = await evaluateExternalAction({ kind: "email", target: message.message.replyTo });
      if (!guard.allowed) return { ok: false, result: guard.reason };

      const doc = await Approval.create({
        kind: "email",
        title: `Reply to ${message.message.replyTo}`,
        detail: draft.text,
        payload: {
          to: message.message.replyTo,
          subject: `Re: ${message.message.subject}`,
          body: draft.text,
          threadId: message.message.threadId,
          inReplyTo: message.message.messageIdHeader,
          references: message.message.references,
        },
        status: "pending",
      });

      return {
        ok: true,
        result: "Queued reply draft for approval. Nothing has been sent.",
        data: { id: String(doc._id) },
      };
    }

    case "check_availability": {
      const result = await findFreeSlot({
        start: args?.start ? String(args.start) : undefined,
        end: args?.end ? String(args.end) : undefined,
        minutes: Number(args?.minutes) || 60,
        workStart: Number.isFinite(Number(args?.workStart)) ? Number(args?.workStart) : 9,
        workEnd: Number.isFinite(Number(args?.workEnd)) ? Number(args?.workEnd) : 18,
      });
      return { ok: result.ok, result: result.detail, data: result.slot };
    }

    case "upcoming_events": {
      const result = await listUpcoming({ days: Number(args?.days) || 7, max: Number(args?.max) || 10 });
      return {
        ok: result.ok,
        result: result.ok
          ? `${result.detail} ${result.events.map((event) => `${event.start}: ${event.title}`).join(" | ")}`
          : result.detail,
        data: result.events,
      };
    }

    case "schedule_block": {
      const title = String(args?.title || "").trim();
      if (!title) return { ok: false, result: "A block needs a title." };
      const start = args?.start ? new Date(String(args.start)) : new Date();
      if (Number.isNaN(start.getTime())) return { ok: false, result: "That start time could not be parsed." };

      const minutes = Math.min(Math.max(Number(args?.minutes) || 60, 15), 480);
      const end = new Date(start.getTime() + minutes * 60_000);

      const conflict = await checkConflicts(start.toISOString(), end.toISOString());
      const warning = conflict.ok && conflict.conflict ? " It overlaps an existing event." : "";

      const guard = await evaluateExternalAction({ kind: "calendar", target: title });
      if (!guard.allowed) return { ok: false, result: guard.reason };

      const doc = await Approval.create({
        kind: "calendar",
        title,
        detail: String(args?.notes || ""),
        payload: {
          start: start.toISOString(),
          end: end.toISOString(),
          notes: String(args?.notes || ""),
        },
        status: "pending",
      });

      return {
        ok: true,
        result: `Queued calendar block "${title}" for approval. Nothing written to Google yet.${warning}`,
        data: { id: String(doc._id), start: start.toISOString(), end: end.toISOString() },
      };
    }

    case "open_page": {
      const raw = String(args?.page || "").trim().toLowerCase().replace(/^\/+/, "");
      const page = PAGES[raw];
      if (!page) {
        return {
          ok: false,
          result: `I do not have a page called "${raw}". Try: ${Object.keys(PAGES).slice(0, 12).join(", ")}.`,
        };
      }
      return { ok: true, result: `Opening ${page.label}.`, data: { path: page.path } };
    }

    default:
      return { ok: false, result: `Unknown tool "${tool}".` };
  }
}
