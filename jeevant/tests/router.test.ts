import test from "node:test";
import assert from "node:assert/strict";
import { routeIntent } from "../lib/agent/router";

function tool(prompt: string): string | undefined {
  return routeIntent(prompt)?.actions[0]?.tool;
}

test("routes fixed commands without an LLM", () => {
  assert.equal(tool("list tasks"), "list_tasks");
  assert.equal(tool("brief me"), "get_briefing");
  assert.equal(tool("open tracker"), "open_page");
  assert.equal(tool("open inbox"), "open_page");
  assert.equal(tool("open plan"), "open_page");
  assert.equal(tool("open people"), "open_page");
  assert.equal(tool("start focus on the router"), "start_focus");
  assert.equal(tool("stop tracking"), "stop_activity");
});

test("routes task and note commands with their arguments", () => {
  const add = routeIntent("add task: ship the bridge");
  assert.equal(add?.actions[0]?.tool, "create_task");
  assert.equal(add?.actions[0]?.args.title, "ship the bridge");

  const remove = routeIntent("delete task: old thing");
  assert.equal(remove?.actions[0]?.tool, "delete_task");
  assert.equal(remove?.actions[0]?.args.confirm, false);

  const confirm = routeIntent("confirm delete task: old thing");
  assert.equal(confirm?.actions[0]?.args.confirm, true);

  const note = routeIntent("note: standup | blocked on auth");
  assert.equal(note?.actions[0]?.tool, "create_note");
  assert.equal(note?.actions[0]?.args.title, "standup");
});

test("parses time logs and messages", () => {
  const log = routeIntent("log 30m waste: scrolling");
  assert.equal(log?.actions[0]?.tool, "log_activity");
  assert.equal(log?.actions[0]?.args.minutes, 30);
  assert.equal(log?.actions[0]?.args.kind, "waste");
  assert.equal(log?.actions[0]?.args.label, "scrolling");

  const message = routeIntent("message Rahul: running 10 minutes late");
  assert.equal(message?.actions[0]?.tool, "send_message_to");
  assert.equal(message?.actions[0]?.args.name, "Rahul");
  assert.equal(message?.actions[0]?.args.body, "running 10 minutes late");

  const tracking = routeIntent("start tracking deep work: coding");
  assert.equal(tracking?.actions[0]?.tool, "start_activity");
  assert.equal(tracking?.actions[0]?.args.kind, "deep work");
  assert.equal(tracking?.actions[0]?.args.label, "coding");
});

test("routes calls and channel-specific messages by name", () => {
  const call = routeIntent("call Rahul");
  assert.equal(call?.actions[0]?.tool, "send_message_to");
  assert.equal(call?.actions[0]?.args.channel, "call");
  assert.equal(call?.actions[0]?.args.name, "Rahul");

  const sms = routeIntent("sms Rahul: running late");
  assert.equal(sms?.actions[0]?.args.channel, "sms");
  assert.equal(sms?.actions[0]?.args.body, "running late");

  const whatsapp = routeIntent("whatsapp Rahul: on my way");
  assert.equal(whatsapp?.actions[0]?.args.channel, "whatsapp");
  assert.equal(whatsapp?.actions[0]?.args.body, "on my way");

  const numbered = routeIntent("call Astra3D");
  assert.equal(numbered?.actions[0]?.args.channel, "call");
  assert.equal(numbered?.actions[0]?.args.name, "Astra3D");
});

test("escalates ambiguous language instead of guessing", () => {
  assert.equal(routeIntent("open the pod bay doors"), null);
  assert.equal(routeIntent("what should I do about the launch?"), null);
  assert.equal(routeIntent("help me plan next week"), null);
});
