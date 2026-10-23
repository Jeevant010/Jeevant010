"use client";

type Envelope<T> = {
  v: 1;
  exp: number | null;
  data: T;
};

const PREFIX = "jv:";
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

function store(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function fullKey(key: string): string {
  return `${PREFIX}${key}`;
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.v === 1 && "exp" in candidate && "data" in candidate;
}

function isExpired(envelope: Envelope<unknown>): boolean {
  return envelope.exp !== null && Date.now() > envelope.exp;
}

export function readState<T>(key: string, fallback: T): T {
  const storage = store();
  if (!storage) return fallback;

  const raw = storage.getItem(fullKey(key));
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isEnvelope(parsed) || isExpired(parsed)) {
      storage.removeItem(fullKey(key));
      return fallback;
    }
    return parsed.data as T;
  } catch {
    storage.removeItem(fullKey(key));
    return fallback;
  }
}

export function writeState<T>(key: string, data: T, ttlMs: number | null = DEFAULT_TTL): void {
  const storage = store();
  if (!storage) return;

  const envelope: Envelope<T> = {
    v: 1,
    exp: ttlMs === null ? null : Date.now() + Math.max(0, ttlMs),
    data,
  };

  const payload = JSON.stringify(envelope);
  try {
    storage.setItem(fullKey(key), payload);
  } catch {
    purgeExpired();
    try {
      storage.setItem(fullKey(key), payload);
    } catch {
      // Quota or storage blocked: browser state is best-effort by design.
    }
  }
}

export function removeState(key: string): void {
  store()?.removeItem(fullKey(key));
}

export function purgeExpired(): number {
  const storage = store();
  if (!storage) return 0;

  let removed = 0;
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(PREFIX)) continue;

    const raw = storage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isEnvelope(parsed) || isExpired(parsed)) {
        storage.removeItem(key);
        removed += 1;
      }
    } catch {
      storage.removeItem(key);
      removed += 1;
    }
  }
  return removed;
}

export function clearState(): number {
  const storage = store();
  if (!storage) return 0;

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && key.startsWith(PREFIX)) keys.push(key);
  }

  for (const key of keys) storage.removeItem(key);
  return keys.length;
}

export function stateStats(): { keys: number; bytes: number } {
  const storage = store();
  if (!storage) return { keys: 0, bytes: 0 };

  let keys = 0;
  let bytes = 0;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(PREFIX)) continue;
    keys += 1;
    bytes += key.length + (storage.getItem(key)?.length || 0);
  }
  return { keys, bytes };
}
