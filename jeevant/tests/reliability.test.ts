import test from "node:test";
import assert from "node:assert/strict";
import { runGoldenEvals, GOLDEN_CASES } from "../lib/agent/evals";
import { isRetryableTool, p95 } from "../lib/agent/reliability";
import { retrieveTools, setDisabledTools } from "../lib/agent/registry";

test("golden command set covers at least 50 cases and all pass", () => {
  assert.ok(GOLDEN_CASES.length >= 50);
  const result = runGoldenEvals();
  assert.equal(result.hitRate, 1, JSON.stringify(result.misses, null, 2));
  assert.equal(result.passed, result.total);
});

test("only read-only tools are retried", () => {
  assert.equal(isRetryableTool("get_briefing"), true);
  assert.equal(isRetryableTool("list_tasks"), true);
  assert.equal(isRetryableTool("gmail_search"), true);
  assert.equal(isRetryableTool("send_message"), false);
  assert.equal(isRetryableTool("create_task"), false);
  assert.equal(isRetryableTool("delete_task"), false);
  assert.equal(isRetryableTool("schedule_block"), false);
  assert.equal(isRetryableTool("run_code"), false);
  assert.equal(isRetryableTool("ui_action"), false);
  assert.equal(isRetryableTool("github__list_issues"), false);
});

test("p95 ignores empty input and picks the tail", () => {
  assert.equal(p95([]), 0);
  assert.equal(p95([10]), 10);
  assert.equal(p95([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 10);
  assert.equal(p95([1, 2, 3, 100]), 100);
});

test("disabled tools leave the retrieval pool", () => {
  try {
    setDisabledTools(["get_briefing"]);
    const names = retrieveTools("brief me", 16).map((tool) => tool.name);
    assert.equal(names.includes("get_briefing"), false);
  } finally {
    setDisabledTools([]);
  }
});
