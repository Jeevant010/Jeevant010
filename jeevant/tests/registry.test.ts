import test from "node:test";
import assert from "node:assert/strict";
import {
  TOOL_CATALOG,
  TOOL_REGISTRY,
  catalogForTools,
  describeTool,
  retrieveTools,
  searchTools,
} from "../lib/agent/registry";

function names(query: string): string[] {
  return retrieveTools(query).map((entry) => entry.name);
}

test("retrieves contact/messaging tools for a call", () => {
  const result = names("call Rahul");
  assert.ok(result.includes("send_message_to"));
  assert.ok(result.includes("search_tools"));
  assert.ok(result.includes("describe_tool"));
});

test("retrieves mail tools for an inbox question", () => {
  const result = names("read my email inbox");
  assert.ok(result.includes("gmail_search") || result.includes("email_digest"));
});

test("retrieves calendar tools", () => {
  const result = names("when am I free on my calendar");
  assert.ok(result.includes("check_availability") || result.includes("upcoming_events"));
});

test("keeps the planner prompt small", () => {
  const result = retrieveTools("hello");
  assert.ok(result.length <= 16, `expected <= 16, got ${result.length}`);
  assert.ok(result.length < TOOL_REGISTRY.length);
  assert.ok(result.some((entry) => entry.name === "search_tools"));
  assert.ok(catalogForTools(result).length < TOOL_CATALOG.length);
});

test("search_tools finds capabilities outside the initial subset", () => {
  const result = searchTools("calendar");
  const found = result.map((entry) => entry.name);
  assert.ok(found.includes("check_availability") || found.includes("upcoming_events"));
});

test("describe_tool exposes the argument schema", () => {
  const entry = describeTool("create_task");
  assert.ok(entry);
  assert.match(entry?.args || "", /title/);
  assert.equal(describeTool("does_not_exist"), null);
});

test("meta-tools are registered", () => {
  assert.ok(TOOL_REGISTRY.some((entry) => entry.name === "search_tools"));
  assert.ok(TOOL_REGISTRY.some((entry) => entry.name === "describe_tool"));
});
