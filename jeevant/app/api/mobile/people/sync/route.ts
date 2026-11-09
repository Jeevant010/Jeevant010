import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Contact } from "@/lib/database/models";
import { listMessages } from "@/lib/integrations/gmail-read";
import { listGoogleContacts } from "@/lib/integrations/google-contacts";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SKIP_EMAIL = /(no-?reply|do-?not-?reply|mailer-daemon|notifications?@|support@|info@|newsletter|updates@|bounce)/i;

function parseAddress(value: string): { name: string; email: string } | null {
  const text = String(value || "").trim();
  if (!text) return null;
  const angled = text.match(/^(.*?)<([^>]+)>/);
  if (angled) {
    const email = angled[2].trim().toLowerCase();
    const name = angled[1].replace(/^["']|["']$/g, "").trim();
    return email.includes("@") ? { name: name || email.split("@")[0], email } : null;
  }
  if (text.includes("@")) {
    const email = text.toLowerCase();
    const name = email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
    return { email, name };
  }
  return null;
}

async function upsert(input: { name?: string; email?: string; phone?: string; source: string }): Promise<boolean> {
  const email = String(input.email || "").trim().toLowerCase();
  const phone = String(input.phone || "").trim();
  const name = String(input.name || "").trim() || email.split("@")[0] || phone;
  if (!name && !email && !phone) return false;
  if (email && SKIP_EMAIL.test(email)) return false;

  const query = email ? { email } : phone ? { phone } : { name };
  const existing = await Contact.findOne(query);
  if (existing) {
    let changed = false;
    if (!existing.email && email) {
      existing.email = email;
      changed = true;
    }
    if (!existing.phone && phone) {
      existing.phone = phone;
      changed = true;
    }
    if (!existing.whatsapp && phone) {
      existing.whatsapp = phone;
      changed = true;
    }
    if (changed) await existing.save();
    return false;
  }

  await Contact.create({
    name,
    email,
    phone,
    whatsapp: phone,
    tags: [input.source],
  });
  return true;
}

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  await connectDB();

  const gmail = { ok: false, detail: "Gmail is not configured.", found: 0, created: 0 };
  const google = { ok: false, detail: "Google Contacts is not configured.", found: 0, created: 0 };

  // 1. Gmail senders and recipients.
  try {
    const mail = await listMessages({ query: "in:anywhere newer_than:180d", count: 50 });
    gmail.ok = mail.ok;
    gmail.detail = mail.detail;
    if (mail.ok) {
      const seen = new Set<string>();
      const self = String(process.env.GMAIL_SENDER || "").trim().toLowerCase();
      for (const message of mail.messages) {
        const parts = [message.from, ...String(message.to || "").split(",")]
          .map((value) => parseAddress(value))
          .filter((value): value is { name: string; email: string } => !!value);

        for (const part of parts) {
          if (!part.email || part.email === self || seen.has(part.email)) continue;
          seen.add(part.email);
          gmail.found += 1;
          if (await upsert({ name: part.name, email: part.email, source: "gmail" })) {
            gmail.created += 1;
          }
        }
      }
      gmail.detail = `${gmail.found} addresses, ${gmail.created} new.`;
    }
  } catch (error) {
    gmail.detail = (error as Error).message;
  }

  // 2. Google Contacts, including phone numbers.
  try {
    const contacts = await listGoogleContacts(200);
    google.ok = contacts.ok;
    google.detail = contacts.detail;
    if (contacts.ok) {
      for (const contact of contacts.contacts) {
        google.found += 1;
        if (await upsert({ ...contact, source: "google-contacts" })) {
          google.created += 1;
        }
      }
    }
  } catch (error) {
    google.detail = (error as Error).message;
  }

  return mobileJson(request, {
    ok: gmail.ok || google.ok,
    gmail,
    google,
    totalCreated: gmail.created + google.created,
    note: "WhatsApp does not expose its contact list to web apps. This imports Google Contacts and Gmail; use an Android build or a self-hosted WhatsApp bridge for WhatsApp-only contacts.",
  });
}
