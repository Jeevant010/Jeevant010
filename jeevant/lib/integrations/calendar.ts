// Google Calendar event creation via OAuth refresh token.
// Without credentials the caller falls back to the local Schedule collection.

import { getGoogleAccessToken, googleConfigured } from "./google";

export function calendarConfigured(): boolean {
  return googleConfigured();
}

export interface EventResult {
  ok: boolean;
  mode: string;
  detail: string;
  id?: string;
  htmlLink?: string;
}

export async function createEvent({
  title,
  start,
  end,
  notes,
}: {
  title: string;
  start?: string;
  end?: string;
  notes?: string;
}): Promise<EventResult> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return { ok: false, mode: "local", detail: "Google Calendar not configured — saved to the local schedule." };
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000);

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          summary: title,
          description: notes || "",
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        }),
      }
    );

    if (!res.ok) {
      return {
        ok: false,
        mode: "failed",
        detail: `Calendar insert failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 160)}`,
      };
    }
    const json: any = await res.json();
    return { ok: true, mode: "direct", detail: "Event created in Google Calendar.", id: json?.id, htmlLink: json?.htmlLink };
  } catch (error) {
    return { ok: false, mode: "failed", detail: `Calendar error: ${(error as Error).message}` };
  }
}
