import { getGoogleAccessToken, googleConfigured } from "./google";
import { safeFetch } from "@/lib/http/fetch";

export type Slot = { start: string; end: string };

export type BusyResult = { ok: boolean; detail: string; busy: Slot[] };
export type AvailabilityResult = { ok: boolean; detail: string; slot: Slot | null; busy: number };
export type ConflictResult = { ok: boolean; conflict: boolean; detail: string; busy: Slot[] };

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  htmlLink: string;
};

export type EventsResult = { ok: boolean; detail: string; events: CalendarEvent[] };

const TIMEZONE = process.env.GOOGLE_TIMEZONE || "Asia/Kolkata";

function calendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || "primary";
}

function scopeHint(status: number, body: string): string | null {
  if (status === 401) return "Google rejected the access token. Re-authorize the refresh token.";
  if (status === 403 && /insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient permission/i.test(body)) {
    return "This token has no Calendar scope. Re-authorize with https://www.googleapis.com/auth/calendar.";
  }
  return null;
}

export function calendarConfigured(): boolean {
  return googleConfigured();
}

export async function getBusy(timeMin: string, timeMax: string): Promise<BusyResult> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return { ok: false, detail: "Google Calendar is not configured.", busy: [] };
  }

  try {
    const res = await safeFetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        items: [{ id: calendarId() }],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, detail: scopeHint(res.status, text) || `Freebusy failed (${res.status}).`, busy: [] };
    }

    const json: any = await res.json();
    const blocks: any[] = json?.calendars?.[calendarId()]?.busy || [];
    const busy: Slot[] = blocks
      .map((block) => ({ start: String(block.start || ""), end: String(block.end || "") }))
      .filter((block) => block.start && block.end);

    return { ok: true, detail: `${busy.length} busy block(s).`, busy };
  } catch (cause) {
    return { ok: false, detail: `Calendar error: ${(cause as Error).message}`, busy: [] };
  }
}

function localHour(date: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "2-digit", hour12: false }).format(date)
  );
}

export async function findFreeSlot({
  start,
  end,
  minutes = 60,
  workStart = 9,
  workEnd = 18,
}: {
  start?: string;
  end?: string;
  minutes?: number;
  workStart?: number;
  workEnd?: number;
}): Promise<AvailabilityResult> {
  const length = Math.min(Math.max(Math.round(minutes), 15), 480);
  const from = start ? new Date(start) : new Date();
  const to = end ? new Date(end) : new Date(from.getTime() + 24 * 60 * 60_000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return { ok: false, detail: "The window needs a valid start and end.", slot: null, busy: 0 };
  }

  const busyResult = await getBusy(from.toISOString(), to.toISOString());
  if (!busyResult.ok) return { ok: false, detail: busyResult.detail, slot: null, busy: 0 };

  const busy = busyResult.busy
    .map((block) => ({ start: new Date(block.start).getTime(), end: new Date(block.end).getTime() }))
    .filter((block) => Number.isFinite(block.start) && Number.isFinite(block.end));

  const step = 15 * 60_000;
  const duration = length * 60_000;
  const first = Math.ceil(from.getTime() / step) * step;

  for (let cursor = first; cursor + duration <= to.getTime(); cursor += step) {
    const hour = localHour(new Date(cursor));
    if (hour < workStart || hour >= workEnd) continue;

    const collision = busy.some((block) => cursor < block.end && cursor + duration > block.start);
    if (collision) continue;

    return {
      ok: true,
      detail: `Free at ${new Date(cursor).toISOString()} for ${length} minutes (${TIMEZONE}).`,
      slot: { start: new Date(cursor).toISOString(), end: new Date(cursor + duration).toISOString() },
      busy: busy.length,
    };
  }

  return {
    ok: false,
    detail: `No free ${length}-minute slot between ${workStart}:00 and ${workEnd}:00 (${TIMEZONE}).`,
    slot: null,
    busy: busy.length,
  };
}

export async function checkConflicts(start: string, end: string): Promise<ConflictResult> {
  const from = new Date(start);
  const to = new Date(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return { ok: false, conflict: false, detail: "The block needs a valid start and end.", busy: [] };
  }

  const result = await getBusy(from.toISOString(), to.toISOString());
  if (!result.ok) return { ok: false, conflict: false, detail: result.detail, busy: [] };

  const conflict = result.busy.some((block) => {
    const busyStart = new Date(block.start).getTime();
    const busyEnd = new Date(block.end).getTime();
    return from.getTime() < busyEnd && to.getTime() > busyStart;
  });

  return {
    ok: true,
    conflict,
    detail: conflict ? "That block overlaps an existing event." : "No conflict in that block.",
    busy: result.busy,
  };
}

export async function listUpcoming({ days = 7, max = 20 }: { days?: number; max?: number } = {}): Promise<EventsResult> {
  const token = await getGoogleAccessToken();
  if (!token) return { ok: false, detail: "Google Calendar is not configured.", events: [] };

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + Math.min(Math.max(days, 1), 60) * 24 * 60 * 60_000).toISOString();
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events`
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", String(Math.min(Math.max(max, 1), 50)));

  try {
    const res = await safeFetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, detail: scopeHint(res.status, text) || `Calendar read failed (${res.status}).`, events: [] };
    }

    const json: any = await res.json();
    const items: any[] = Array.isArray(json?.items) ? json.items : [];
    const events: CalendarEvent[] = items.map((item) => ({
      id: String(item.id || ""),
      title: String(item.summary || "(untitled)"),
      start: String(item.start?.dateTime || item.start?.date || ""),
      end: String(item.end?.dateTime || item.end?.date || ""),
      location: String(item.location || ""),
      htmlLink: String(item.htmlLink || ""),
    }));

    return { ok: true, detail: `${events.length} event(s) in the next ${days} day(s).`, events };
  } catch (cause) {
    return { ok: false, detail: `Calendar error: ${(cause as Error).message}`, events: [] };
  }
}
