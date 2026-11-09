import test from "node:test";
import assert from "node:assert/strict";
import { isSecretEnvelope, openSecrets, sealSecrets } from "../lib/crypto/secrets";

process.env.ADMIN_SECRET = "test-secret-at-least-16-chars";

test("seals and opens secrets", () => {
  const sealed = sealSecrets({ token: "supersecret", botToken: "123:ABC" });
  assert.equal(isSecretEnvelope(sealed), true);
  const opened = openSecrets(sealed);
  assert.deepEqual(opened, { token: "supersecret", botToken: "123:ABC" });
});

test("reads legacy plaintext secrets", () => {
  assert.deepEqual(openSecrets({ token: "legacy" }), { token: "legacy" });
});

test("returns empty on a tampered envelope", () => {
  const sealed = sealSecrets({ token: "abc" });
  assert.equal(isSecretEnvelope(sealed), true);
  const tampered = { ...(sealed as Record<string, unknown>), tag: "0".repeat(32) };
  assert.deepEqual(openSecrets(tampered), {});
});

test("empty secrets stay empty and unencrypted", () => {
  const sealed = sealSecrets({});
  assert.deepEqual(sealed, {});
  assert.equal(isSecretEnvelope(sealed), false);
});
