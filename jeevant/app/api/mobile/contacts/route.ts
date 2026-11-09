import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Contact } from "@/lib/database/models";
import { mobileJson, mobileOptions, plain, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function exactName(name: string): RegExp {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const contacts = await Contact.find({}).sort({ name: 1 }).limit(300);
  return mobileJson(request, { contacts: contacts.map(plain) });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (!name) return mobileJson(request, { error: "A contact needs a name." }, { status: 400 });

  const fields = {
    name,
    phone: String(body?.phone || "").trim(),
    whatsapp: String(body?.whatsapp || "").trim(),
    email: String(body?.email || "").trim(),
    instagram: String(body?.instagram || "").trim(),
    linkedin: String(body?.linkedin || "").trim(),
    tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
  };

  await connectDB();
  const existing = await Contact.findOne({ name: exactName(name) });
  if (existing) {
    Object.assign(existing, fields);
    await existing.save();
    return mobileJson(request, { contact: plain(existing) });
  }

  const contact = await Contact.create(fields);
  return mobileJson(request, { contact: plain(contact) }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (!id) return mobileJson(request, { error: "A contact id is required." }, { status: 400 });

  await connectDB();
  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) return mobileJson(request, { error: "Contact not found." }, { status: 404 });
  return mobileJson(request, { ok: true });
}
