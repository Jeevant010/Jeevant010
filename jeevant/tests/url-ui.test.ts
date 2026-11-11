import test from "node:test";
import assert from "node:assert/strict";
import { htmlToText, isPrivateHost } from "../lib/agent/read-url";
import { describeUiSteps, normalizeApp, normalizeUiSteps } from "../lib/agent/ui";

test("strips scripts, styles, head, and tags from a page", () => {
  const result = htmlToText(
    "<html><head><title>Page Title</title><style>body{color:red}</style></head>" +
      "<body><h1>Hello</h1><script>steal()</script><p>A &amp; B</p><footer>foot</footer></body></html>"
  );
  assert.equal(result.title, "Page Title");
  assert.match(result.text, /Hello/);
  assert.match(result.text, /A & B/);
  assert.doesNotMatch(result.text, /steal|color:red|Page Title|foot/);
});

test("blocks private and link-local page hosts", () => {
  assert.equal(isPrivateHost("127.0.0.1"), true);
  assert.equal(isPrivateHost("localhost"), true);
  assert.equal(isPrivateHost("10.1.2.3"), true);
  assert.equal(isPrivateHost("172.20.1.1"), true);
  assert.equal(isPrivateHost("192.168.1.2"), true);
  assert.equal(isPrivateHost("169.254.169.254"), true);
  assert.equal(isPrivateHost("example.com"), false);
});

test("normalizes apps and bounded UI steps", () => {
  assert.equal(normalizeApp("WhatsApp").packageName, "com.whatsapp");
  assert.equal(normalizeApp("com.android.chrome").packageName, "com.android.chrome");
  assert.ok(normalizeApp("unknown app").error);

  const steps = normalizeUiSteps([
    { action: "tap", text: "Rahul" },
    { action: "type", text: "hello" },
    { action: "scroll", direction: "up" },
    { action: "wait", ms: 99999 },
    { action: "back" },
  ]);
  assert.equal(steps.error, undefined);
  assert.equal(steps.steps.length, 5);
  assert.equal(steps.steps[3].ms, 5000);
  assert.match(describeUiSteps(steps.steps), /tap "Rahul"/);

  assert.ok(normalizeUiSteps([]).error);
  assert.ok(normalizeUiSteps([{ action: "tap" }]).error);
  assert.ok(normalizeUiSteps([{ action: "launch" }]).error);
});
