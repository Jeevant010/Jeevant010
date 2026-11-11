import test from "node:test";
import assert from "node:assert/strict";
import {
  codeExecutionAvailable,
  executeCode,
  normalizeCodeLanguage,
} from "../lib/agent/code-run";

test("normalizes code languages", () => {
  assert.equal(normalizeCodeLanguage("js"), "javascript");
  assert.equal(normalizeCodeLanguage("TypeScript"), "javascript");
  assert.equal(normalizeCodeLanguage("python3"), "python");
  assert.equal(normalizeCodeLanguage("ruby"), null);
});

test("runs javascript with stdout", async () => {
  if (!codeExecutionAvailable()) return;
  const result = await executeCode("javascript", "console.log(2 + 2);");
  assert.equal(result.ok, true);
  assert.equal(result.result.trim(), "4");
});

test("javascript cannot read host files or use the network", async () => {
  if (!codeExecutionAvailable()) return;
  const fs = await executeCode(
    "javascript",
    "try { console.log(require('fs').readFileSync('/etc/passwd','utf8').slice(0,20)); } catch (e) { console.log('DENIED', e.code); }"
  );
  assert.match(fs.result, /DENIED/);
  assert.doesNotMatch(fs.result, /root:/);

  const network = await executeCode(
    "javascript",
    "fetch('https://example.com').then(r => console.log('NET', r.status)).catch(e => console.log('NET_DENIED', e.message));"
  );
  assert.match(network.result, /NET_DENIED/);
});

test("runs python and blocks host files and network", async () => {
  if (!codeExecutionAvailable()) return;
  const basic = await executeCode("python", "print(2 + 2)");
  assert.equal(basic.ok, true);
  assert.equal(basic.result.trim(), "4");

  const fs = await executeCode(
    "python",
    "try:\n print(open('/etc/passwd').read()[:20])\nexcept Exception as e:\n print('DENIED', e)"
  );
  assert.match(fs.result, /DENIED/);
  assert.doesNotMatch(fs.result, /root:/);

  const network = await executeCode(
    "python",
    "import urllib.request\ntry:\n print(urllib.request.urlopen('https://example.com', timeout=3).status)\nexcept Exception as e:\n print('NET_DENIED', e)"
  );
  assert.match(network.result, /NET_DENIED/);
});
