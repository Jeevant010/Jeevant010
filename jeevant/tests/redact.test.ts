import test from "node:test";
import assert from "node:assert/strict";
import { redact } from "../lib/logging/redact";

test("redacts bridge tokens", () => {
  assert.match(redact("link jv_abcdefghijklmnopqrstuvwxyz"), /jv_\[redacted\]/);
});

test("redacts bearer and query tokens", () => {
  const output = redact("Authorization: Bearer abc.def token=xyz secret=qwerty");
  assert.doesNotMatch(output, /abc\.def/);
  assert.doesNotMatch(output, /xyz/);
  assert.doesNotMatch(output, /qwerty/);
});

test("redacts telegram bot tokens", () => {
  assert.match(redact("bot123456:ABCDEFGHIJKLMNOP"), /bot\[redacted\]/);
});

test("redacts long phone numbers", () => {
  assert.match(redact("call +919876543210"), /\[redacted-number\]/);
});
