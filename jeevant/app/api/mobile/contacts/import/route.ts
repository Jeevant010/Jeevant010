import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Contact } from "@/lib/database/models";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Incoming = { name?: string; phone?: string; email?: string };

function digits(value: unknown): string {
  return String(value || "").replace(/\D/g, "");
}

function email(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const body = await request.json().catch(() => null);
  const incoming = Array.isArray(body?.contacts) ? (body.contacts as Incoming[]) : [];
  if (!incoming.length) {
    return mobileJson(request, { error: "contacts[] is required." }, { status: 400 });
  }

  await connectDB();
  const existing = await Contact.find({}).limit(5000);

  const byPhone = new Map<string, any>();
  const byEmail = new Map<string, any>();
  const byName = new Map<string, any>();
  for (const contact of existing as any[]) {
    const phone = digits(contact.phone) || digits(contact.whatsapp);
    if (phone) byPhone.set(phone, contact);
    if (contact.email) byEmail.set(email(contact.email), contact);
    if (contact.name) byName.set(String(contact.name).toLowerCase(), contact);
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const seen = new Set<string>();

  for (const item of incoming.slice(0, 1000)) {
    const name = String(item?.name || "").trim();
    const phone = String(item?.phone || "").trim();
    const mail = email(item?.email);
    const phoneKey = digits(phone);

    if (!name && !phoneKey && !mail) {
      skipped += 1;
      continue;
    }

    const key = phoneKey || mail || name.toLowerCase();
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);

    const match =
      (phoneKey && byPhone.get(phoneKey)) ||
      (mail && byEmail.get(mail)) ||
      (name && byName.get(name.toLowerCase())) ||
      null;

    if (match) {
      let changed = false;
      if (!match.phone && phone) {
        match.phone = phone;
        changed = true;
      }
      if (!match.whatsapp && phone) {
        match.whatsapp = phone;
        changed = true;
      }
      if (!match.email && mail) {
        match.email = mail;
        changed = true;
      }
      if (changed) {
        await match.save();
        updated += 1;
        if (phoneKey) byPhone.set(phoneKey, match);
        if (mail) byEmail.set(mail, match);
      } else {
        skipped += 1;
      }
      continue;
    }

    const created = await Contact.create({
      name: name || phone || mail,
      phone,
      whatsapp: phone,
      email: mail,
      tags: ["phone-contacts"],
    });
    imported += 1;
    if (phoneKey) byPhone.set(phoneKey, created);
    if (mail) byEmail.set(mail, created);
    if (name) byName.set(name.toLowerCase(), created);
  }

  return mobileJson(request, { ok: true, imported, updated, skipped, total: incoming.length });
}
