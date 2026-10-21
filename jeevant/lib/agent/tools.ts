// Tool registry for the operator agent.
// Every tool mutates the same MongoDB data the manual admin pages use.
// Destructive tools require an explicit `confirm: true` from the planner.

import connectDB from "@/lib/db";
import { Task, Note, Project } from "@/lib/database/models";

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
search_notes       args: { query }
create_project     args: { title, description, techStack?: string[], status?: "building"|"live"|"planned"|"stopped" }
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
