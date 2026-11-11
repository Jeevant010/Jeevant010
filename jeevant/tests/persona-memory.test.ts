import test from "node:test";
import assert from "node:assert/strict";
import { normalizePersona, personaPrompt, ttsLocale } from "../lib/agent/persona";
import { rankConversation, rankMemories, type MemoryRow } from "../lib/agent/memory";

test("normalizes persona fields and defaults", () => {
  assert.deepEqual(normalizePersona({}), { name: "Jeevant", tone: "direct", language: "auto" });
  assert.deepEqual(normalizePersona({ name: "  Nova  ", tone: "warm", language: "hinglish" }), {
    name: "Nova",
    tone: "warm",
    language: "hinglish",
  });
  assert.deepEqual(normalizePersona({ name: "", tone: "rude", language: "klingon" }), {
    name: "Jeevant",
    tone: "direct",
    language: "auto",
  });
  assert.equal(ttsLocale(normalizePersona({ language: "english" })), "en-US");
  assert.equal(ttsLocale(normalizePersona({ language: "auto" })), "en-IN");
});

test("persona prompt carries identity, tone, and language", () => {
  const prompt = personaPrompt({ name: "Nova", tone: "warm", language: "hinglish" });
  assert.match(prompt, /Nova/);
  assert.match(prompt, /Calm, supportive/);
  assert.match(prompt, /Hinglish/);
  assert.match(prompt, /1-3 short sentences/);
});

test("memory ranking prefers relevant facts over merely recent ones", () => {
  const rows: MemoryRow[] = [
    { text: "Loves filter coffee with less sugar", tags: ["coffee", "food"], createdAt: 1 },
    { text: "Goes to the gym at 7am", tags: ["fitness"], createdAt: 2 },
    { text: "Working on a personal mobile OS", tags: ["work"], createdAt: 3 },
    { text: "Prefers morning deep work", tags: ["focus"], createdAt: 4 },
    { text: "Uses a Pixel phone", tags: ["device"], createdAt: 5 },
  ];
  const result = rankMemories("what coffee do I like", rows, 4);
  assert.equal(result[0], "Loves filter coffee with less sugar");
  assert.ok(result.length <= 4);
  assert.equal(new Set(result).size, result.length);
});

test("memory ranking falls back to recent items without a query", () => {
  const rows: MemoryRow[] = [
    { text: "old", createdAt: 1 },
    { text: "new", createdAt: 2 },
    { text: "newest", createdAt: 3 },
  ];
  assert.deepEqual(rankMemories("", rows, 2), ["newest", "new"]);
});

test("conversation ranking keeps relevant turns and recent context in order", () => {
  const rows = [
    { role: "user", content: "we discussed the router bug", createdAt: 1 },
    { role: "assistant", content: "the router now handles contacts", createdAt: 2 },
    { role: "user", content: "unrelated lunch plan", createdAt: 3 },
    { role: "assistant", content: "sure", createdAt: 4 },
    { role: "user", content: "what did we decide about the router", createdAt: 5 },
    { role: "assistant", content: "the planner keeps a fallback parser", createdAt: 6 },
  ];
  const result = rankConversation("router", rows, 6);
  assert.ok(result.some((row) => row.content.includes("router bug")));
  assert.ok(result.some((row) => row.content.includes("unrelated lunch plan")));
  for (let index = 1; index < result.length; index++) {
    assert.ok(Number(result[index].createdAt) >= Number(result[index - 1].createdAt));
  }
});
