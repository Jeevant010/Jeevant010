import test from "node:test";
import assert from "node:assert/strict";
import { groqKeys, groqKeyCount, groqConfigured } from "../lib/integrations/groq";

function setKeys(pool: string | undefined, single: string | undefined) {
  if (pool === undefined) delete process.env.GROQ_API_KEYS;
  else process.env.GROQ_API_KEYS = pool;
  if (single === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = single;
}

test("parses a comma-separated pool and trims/drops blanks", () => {
  setKeys("key-a, key-b ,, key-c", undefined);
  assert.deepEqual(groqKeys(), ["key-a", "key-b", "key-c"]);
  assert.equal(groqKeyCount(), 3);
  assert.equal(groqConfigured(), true);
});

test("appends the legacy single key without duplicating it", () => {
  setKeys("key-a,key-b", "key-c");
  assert.deepEqual(groqKeys(), ["key-a", "key-b", "key-c"]);

  setKeys("key-a,key-b", "key-b");
  assert.deepEqual(groqKeys(), ["key-a", "key-b"]);
});

test("falls back to a single key and reports unconfigured when empty", () => {
  setKeys(undefined, "only-key");
  assert.deepEqual(groqKeys(), ["only-key"]);

  setKeys(undefined, undefined);
  assert.deepEqual(groqKeys(), []);
  assert.equal(groqConfigured(), false);
});
