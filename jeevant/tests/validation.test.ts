import test from "node:test";
import assert from "node:assert/strict";
import { getActionMeta, validateActionArgs } from "../lib/bridge/catalog";

const task = getActionMeta("create_task");
const block = getActionMeta("block_time");

test("validation drops unknown fields and applies defaults", () => {
  assert.ok(task);
  const result = validateActionArgs(task, { title: "Ship bridge", extra: "drop me" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.args.title, "Ship bridge");
    assert.equal(result.args.priority, "medium");
    assert.equal("extra" in result.args, false);
  }
});

test("validation rejects missing required fields", () => {
  assert.ok(task);
  const result = validateActionArgs(task, { priority: "high" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /Title/);
});

test("validation rejects invalid select options", () => {
  assert.ok(task);
  const result = validateActionArgs(task, { title: "x", priority: "urgent" });
  assert.equal(result.ok, false);
});

test("validation enforces numeric bounds", () => {
  assert.ok(block);
  const result = validateActionArgs(block, {
    title: "x",
    start: new Date().toISOString(),
    minutes: 1,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /at least 5/);
});

test("validation rejects invalid dates", () => {
  assert.ok(block);
  const result = validateActionArgs(block, { title: "x", start: "tomorrow" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /valid date/);
});

test("validation rejects unknown actions", () => {
  assert.equal(getActionMeta("rm_rf"), undefined);
});
