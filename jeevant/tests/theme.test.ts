import test from "node:test";
import assert from "node:assert/strict";
import { themeForPath } from "../lib/theme/themes";

test("maps pages to their theme", () => {
  assert.equal(themeForPath("/"), "tactical");
  assert.equal(themeForPath("/projects"), "biohazard");
  assert.equal(themeForPath("/projects/foo"), "biohazard");
  assert.equal(themeForPath("/journey"), "requiem");
  assert.equal(themeForPath("/about"), "brightfalls");
  assert.equal(themeForPath("/voice"), "brightfalls");
  assert.equal(themeForPath("/assistant"), "tactical");
});

test("falls back to tactical for unknown paths", () => {
  assert.equal(themeForPath("/does-not-exist"), "tactical");
});
