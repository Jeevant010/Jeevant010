// Tool registry for the operator agent.
// Every tool mutates the same MongoDB data the manual admin pages use.
// Destructive tools require an explicit `confirm: true` from the planner.

import connectDB from "@/lib/db";
import { Task, Note, Project, ContentPost, Achievement, Memory, Approval } from "@/lib/database/models";
import { evaluateExternalAction } from "@/lib/guardrails/policy";

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
remind             args: { what, when }         // when = ISO datetime
news               args: { count? }             // Hacker News top stories
list_tasks         args: {}
`.trim();

function includes(value: unknown, allowed: string[], fallback: string): string {
  const text = String(value || "");
  return allowed.includes(text) ? text : fallback;
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
        const res = await fetch(
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
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
          { cache: "no-store" }
        );
        const geo: any = await geoRes.json();
        const place = geo?.results?.[0];
        if (!place) return { ok: false, result: `Could not find "${city}".` };

        const weatherRes = await fetch(
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
        const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { cache: "no-store" });
        const ids: number[] = await idsRes.json();
        const items = await Promise.all(
          ids.slice(0, count).map(async (id) => {
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { cache: "no-store" });
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

    case "list_tasks": {
      const docs = await Task.find({ isCompleted: false }).sort({ createdAt: -1 }).limit(20);
      return {
        ok: true,
        result: docs.length ? `${docs.length} open task(s).` : "No open tasks.",
        data: docs.map((doc: any) => ({ id: String(doc._id), title: doc.title, priority: doc.priority })),
      };
    }

    default:
      return { ok: false, result: `Unknown tool "${tool}".` };
  }
}
