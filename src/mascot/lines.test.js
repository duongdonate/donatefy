// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { pickLine, LANDING_LINES, AUTH_LINES } from "./lines.js";

test("không bao giờ trả lại câu vừa nói", () => {
  const lines = ["a", "b", "c", "d"];
  let last = -1;
  for (let n = 0; n < 1000; n++) {
    const i = pickLine(lines, last);
    assert.notEqual(i, last);
    assert.ok(i >= 0 && i < 4);
    last = i;
  }
});

test("biên: 1 câu và rỗng", () => {
  assert.equal(pickLine(["x"], 0), 0);
  assert.equal(pickLine([], -1), -1);
});

test("rand ở hai đầu không vượt biên", () => {
  assert.equal(pickLine(["a", "b", "c"], 0, () => 0), 1);
  assert.equal(pickLine(["a", "b", "c"], 2, () => 0.999), 1);
});

test("LANDING_LINES có 3 nhóm, mỗi nhóm 5 câu", () => {
  assert.equal(LANDING_LINES.length, 3);
  LANDING_LINES.forEach((g) => assert.equal(g.length, 5));
});

test("AUTH_LINES có 5 câu, giọng mascot kết bằng ~", () => {
  assert.equal(AUTH_LINES.length, 5);
  AUTH_LINES.forEach((l) => assert.ok(l.endsWith("~"), l));
});

