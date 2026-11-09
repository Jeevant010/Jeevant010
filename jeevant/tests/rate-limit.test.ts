import test from "node:test";
import assert from "node:assert/strict";
import { rateLimit, resetRateLimits } from "../lib/security/rate-limit";

test("allows up to the limit then blocks", () => {
  resetRateLimits();
  assert.equal(rateLimit("k", 3, 1000).ok, true);
  assert.equal(rateLimit("k", 3, 1000).ok, true);
  assert.equal(rateLimit("k", 3, 1000).ok, true);

  const blocked = rateLimit("k", 3, 1000);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
});

test("isolates keys", () => {
  resetRateLimits();
  assert.equal(rateLimit("a", 1, 1000).ok, true);
  assert.equal(rateLimit("a", 1, 1000).ok, false);
  assert.equal(rateLimit("b", 1, 1000).ok, true);
});

test("resets after the window", async () => {
  resetRateLimits();
  assert.equal(rateLimit("w", 1, 30).ok, true);
  assert.equal(rateLimit("w", 1, 30).ok, false);
  await new Promise((resolve) => setTimeout(resolve, 45));
  assert.equal(rateLimit("w", 1, 30).ok, true);
});
