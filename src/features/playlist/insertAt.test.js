import { test } from "node:test";
import assert from "node:assert/strict";
import { insertAt } from "./insertAt.js";

test("chèn lại đúng vị trí cũ", () => {
  assert.deepEqual(insertAt(["a", "c"], "b", 1), ["a", "b", "c"]);
  assert.deepEqual(insertAt(["b", "c"], "a", 0), ["a", "b", "c"]);
});

test("vị trí vượt quá thì kẹp vào cuối, không đổi mảng gốc", () => {
  const src = ["a"];
  assert.deepEqual(insertAt(src, "z", 9), ["a", "z"]);
  assert.deepEqual(insertAt([], "x", 3), ["x"]);
  assert.deepEqual(src, ["a"]);
});
