// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { previousAction, parseSavedVolume } from "./playerMath.js";

test("bài trước: quá 3 giây thì về đầu bài", () => {
  assert.equal(previousAction(3.5, 4, "off"), "restart");
  assert.equal(previousAction(3, 4, "off"), "previous");
  assert.equal(previousAction(0, 0, "off"), "restart");
  assert.equal(previousAction(0, 0, "one"), "restart");
  assert.equal(previousAction(0, 0, "all"), "previous");
});

test("âm lượng đã lưu", () => {
  assert.deepEqual(parseSavedVolume('{"volume":0.4,"muted":true}'), { volume: 0.4, muted: true });
  assert.equal(parseSavedVolume(null), null);
  assert.equal(parseSavedVolume("rác"), null);
  assert.equal(parseSavedVolume('{"volume":2,"muted":false}'), null);
  assert.equal(parseSavedVolume('{"volume":0.5}'), null);
});
