type Breaker = { failures: number; openUntil: number };

const breakers = new Map<string, Breaker>();
const FAILURE_THRESHOLD = 5;
const OPEN_MS = 30_000;

function keyFor(input: string | URL): string {
  try {
    return new URL(String(input)).hostname;
  } catch {
    return "unknown";
  }
}

function recordFailure(key: string): void {
  const current = breakers.get(key) || { failures: 0, openUntil: 0 };
  current.failures += 1;
  if (current.failures >= FAILURE_THRESHOLD) {
    current.openUntil = Date.now() + OPEN_MS;
    current.failures = 0;
  }
  breakers.set(key, current);
}

function recordSuccess(key: string): void {
  breakers.delete(key);
}

export type SafeFetchOptions = {
  timeoutMs?: number;
  breakerKey?: string;
};

export async function safeFetch(
  input: string | URL,
  init: RequestInit = {},
  options: SafeFetchOptions = {}
): Promise<Response> {
  const key = options.breakerKey || keyFor(input);
  const breaker = breakers.get(key);
  const now = Date.now();

  if (breaker && breaker.openUntil > now) {
    const seconds = Math.max(1, Math.ceil((breaker.openUntil - now) / 1000));
    throw new Error(`${key} is temporarily unavailable (retry in ${seconds}s).`);
  }

  try {
    const response = await fetch(input, {
      ...init,
      signal: init.signal || AbortSignal.timeout(options.timeoutMs ?? 10_000),
    });

    if (response.status >= 500) recordFailure(key);
    else recordSuccess(key);

    return response;
  } catch (error) {
    recordFailure(key);
    throw error;
  }
}

export function resetBreakers(): void {
  breakers.clear();
}
