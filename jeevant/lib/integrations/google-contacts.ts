// Google Contacts (People API). Used by the mobile "Sync people" action so the
// user does not have to type names and numbers by hand.
//
// Requires the extra scope:
//   https://www.googleapis.com/auth/contacts.readonly
// Gmail import still works with gmail.readonly even when this scope is missing.

import { getGoogleAccessToken } from "./google";
import { safeFetch } from "@/lib/http/fetch";

export type GoogleContact = {
  name: string;
  email: string;
  phone: string;
};

export type GoogleContactsResult = {
  ok: boolean;
  detail: string;
  contacts: GoogleContact[];
};

export async function listGoogleContacts(max = 200): Promise<GoogleContactsResult> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return { ok: false, detail: "Google is not configured.", contacts: [] };
  }

  const url = new URL("https://people.googleapis.com/v1/people/me/connections");
  url.searchParams.set("personFields", "names,emailAddresses,phoneNumbers");
  url.searchParams.set("pageSize", String(Math.min(Math.max(max, 1), 1000)));

  try {
    const res = await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const apiDisabled = /has not been used|is disabled|SERVICE_DISABLED|enable it/i.test(text);
      const scopeHint = apiDisabled
        ? " Enable the People API in Google Cloud Console for this project."
        : /insufficient|scope|permission|403/i.test(`${res.status} ${text}`)
        ? " Re-authorize the Google token with https://www.googleapis.com/auth/contacts.readonly."
        : "";
      return {
        ok: false,
        detail: `Google Contacts failed (${res.status}).${scopeHint}`,
        contacts: [],
      };
    }

    const json: any = await res.json();
    const contacts: GoogleContact[] = [];
    for (const person of Array.isArray(json?.connections) ? json.connections : []) {
      const name = String(person?.names?.[0]?.displayName || "").trim();
      const email = String(person?.emailAddresses?.[0]?.value || "").trim().toLowerCase();
      const phone = String(person?.phoneNumbers?.[0]?.value || "").trim();
      if (name || email || phone) {
        contacts.push({ name: name || email || phone, email, phone });
      }
    }

    return {
      ok: true,
      detail: `${contacts.length} Google contact${contacts.length === 1 ? "" : "s"}.`,
      contacts,
    };
  } catch (error) {
    return { ok: false, detail: (error as Error).message, contacts: [] };
  }
}
