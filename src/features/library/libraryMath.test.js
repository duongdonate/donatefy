import test from "node:test";
import assert from "node:assert/strict";
import { DEAL, dealTransform, libraryOrder, fanTransform, totalDuration } from "./libraryMath.js";

test("libraryOrder: đang phát lên đầu, rồi cũ trước mới sau", () => {
  const p = [{ _id: "a", createdAt: "2026-01-01" }, { _id: "b", createdAt: "2026-03-01" }, { _id: "c", createdAt: "2026-02-01" }];
  assert.deepEqual(libraryOrder(p, "b").map((x) => x._id), ["b", "a", "c"]);
  assert.deepEqual(libraryOrder(p, null).map((x) => x._id), ["a", "c", "b"]);
  assert.deepEqual(p.map((x) => x._id), ["a", "b", "c"]);
});
test("fanTransform", () => {
  assert.equal(fanTransform(0), "translateX(0cqw) translateY(0cqw) rotate(0deg) scale(1)");
  assert.equal(fanTransform(-1), "translateX(-15cqw) translateY(1.6cqw) rotate(-5deg) scale(0.86)");
  assert.equal(fanTransform(4), "translateX(60cqw) translateY(6.4cqw) rotate(20deg) scale(0.58)");
});
test("dealTransform: dưới mép → bó → quạt", () => {
  assert.equal(dealTransform(DEAL.BELOW, 2), "translateY(70cqh) scale(0.9)");
  assert.equal(dealTransform(DEAL.STACK, -2), "translateY(0.8cqw) rotate(-3deg)");
  assert.equal(dealTransform(DEAL.STACK, 5), "translateY(1.2cqw) rotate(7.5deg)");
  assert.equal(dealTransform(DEAL.FAN, 1), fanTransform(1));
  assert.equal(dealTransform(DEAL.DONE, -1), fanTransform(-1));
});
test("fanTransform làm tròn translateY", () =>
  assert.equal(fanTransform(3), "translateX(45cqw) translateY(4.8cqw) rotate(15deg) scale(0.58)"));
test("libraryOrder: thiếu createdAt không sinh NaN", () => {
  const p = [{ _id: "a" }, { _id: "b", createdAt: "2026-03-01" }, { _id: "c" }];
  assert.deepEqual(libraryOrder(p, null).map((x) => x._id), ["a", "c", "b"]);
});
test("totalDuration", () => assert.equal(totalDuration([{ duration: 60 }, {}, { duration: 30.4 }]), 90.4));
