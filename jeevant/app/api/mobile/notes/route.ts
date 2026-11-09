import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Note } from "@/lib/database/models";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();

  const query = String(request.nextUrl.searchParams.get("q") || "").trim();
  const filter = query
    ? {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const notes = await Note.find(filter).sort({ updatedAt: -1 }).limit(200);
  return mobileJson(request, { notes: notes.map(plain) });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  if (!title) return mobileJson(request, { error: "A note needs a title." }, { status: 400 });

  await connectDB();
  const note = await Note.create({
    title,
    content: String(body?.content || ""),
    tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
    visibility: "private",
  });

  return mobileJson(request, { note: plain(note) }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (!id) return mobileJson(request, { error: "A note id is required." }, { status: 400 });

  await connectDB();
  const note = await Note.findByIdAndDelete(id);
  if (!note) return mobileJson(request, { error: "Note not found." }, { status: 404 });
  return mobileJson(request, { ok: true });
}
