import test from "node:test";
import assert from "node:assert/strict";
import { libraryOrder, fanTransform, totalDuration } from "./libraryMath.js";

test("libraryOrder: đang phát lên đầu, rồi mới nhất", () => {
  const p = [{ _id: "a", createdAt: "2026-01-01" }, { _id: "b", createdAt: "2026-03-01" }, { _id: "c", createdAt: "2026-02-01" }];
  assert.deepEqual(libraryOrder(p, "a").map((x) => x._id), ["a", "b", "c"]);
  assert.deepEqual(libraryOrder(p, null).map((x) => x._id), ["b", "c", "a"]);
  assert.deepEqual(p.map((x) => x._id), ["a", "b", "c"]);
});
test("fanTransform", () => {
  assert.equal(fanTransform(0), "translateX(0cqw) translateY(0cqw) rotate(0deg) scale(1)");
  assert.equal(fanTransform(-1), "translateX(-15cqw) translateY(1.6cqw) rotate(-5deg) scale(0.86)");
  assert.equal(fanTransform(4), "translateX(60cqw) translateY(6.4cqw) rotate(20deg) scale(0.58)");
});
test("fanTransform làm tròn translateY", () =>
  assert.equal(fanTransform(3), "translateX(45cqw) translateY(4.8cqw) rotate(15deg) scale(0.58)"));
test("libraryOrder: thiếu createdAt không sinh NaN", () => {
  const p = [{ _id: "a" }, { _id: "b", createdAt: "2026-03-01" }, { _id: "c" }];
  assert.deepEqual(libraryOrder(p, null).map((x) => x._id), ["b", "a", "c"]);
});
test("totalDuration", () => assert.equal(totalDuration([{ duration: 60 }, {}, { duration: 30.4 }]), 90.4));
