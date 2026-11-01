import assert from "node:assert/strict";
import test from "node:test";
import { clampNumber, sanitizeStr } from "../../shared/sanitize.js";

test("sanitizeStr: trims and strips control characters", () => {
  const input = "  Hello \x00\x08World\x1F! \t\n ";
  const result = sanitizeStr(input, 100);
  assert.equal(result, "Hello   World !");
});

test("sanitizeStr: handles null, undefined, numbers and booleans", () => {
  assert.equal(sanitizeStr(null), "");
  assert.equal(sanitizeStr(undefined), "");
  assert.equal(sanitizeStr(12345), "12345");
  assert.equal(sanitizeStr(true), "true");
});

test("sanitizeStr: enforces max length limit", () => {
  const longStr = "A".repeat(100);
  const sliced = sanitizeStr(longStr, 10);
  assert.equal(sliced.length, 10);
  assert.equal(sliced, "AAAAAAAAAA");
});

test("clampNumber: clamps within range correctly", () => {
  assert.equal(clampNumber(50, 0, 100), 50);
  assert.equal(clampNumber(-10, 0, 100), 0);
  assert.equal(clampNumber(150, 0, 100), 100);
});

test("clampNumber: handles string numbers, NaN, and fallbacks", () => {
  assert.equal(clampNumber("42", 0, 100), 42);
  assert.equal(clampNumber("not-a-number", 10, 100, 25), 25);
  assert.equal(clampNumber(NaN, 5, 50, 10), 10);
  assert.equal(clampNumber(Infinity, 0, 100, 0), 0);
});
