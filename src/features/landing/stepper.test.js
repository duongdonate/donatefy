// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { accumulateWheel, stepFromKey, swipeDir, fitScale, MASCOT_SPOTS } from "./stepper.js";

test("wheel cộng dồn: nhiều cú nhỏ chỉ ra 1 bước", () => {
  let acc = 0;
  const dirs = [];
  for (const d of [8, 9, 10, 12, 15, 20]) {
    const r = accumulateWheel(acc, d);
    acc = r.acc;
    if (r.dir) dirs.push(r.dir);
  }
  assert.deepEqual(dirs, [1]);
});

test("wheel lên", () => assert.deepEqual(accumulateWheel(-30, -20), { acc: 0, dir: -1 }));

test("phím", () => {
  assert.equal(stepFromKey("ArrowDown", 0), 1);
  assert.equal(stepFromKey(" ", 1), 2);
  assert.equal(stepFromKey("PageUp", 0), 0);
  assert.equal(stepFromKey("End", 0), 2);
  assert.equal(stepFromKey("Home", 2), 0);
  assert.equal(stepFromKey("ArrowDown", 2), 2);
  assert.equal(stepFromKey("a", 1), null);
});

test("vuốt", () => {
  assert.equal(swipeDir(500, 400), 1);
  assert.equal(swipeDir(400, 500), -1);
  assert.equal(swipeDir(400, 430), 0);
});

test("fitScale không phóng to, thu theo chiều chật hơn", () => {
  assert.equal(fitScale({ w: 1000, h: 800 }, { w: 500, h: 400 }), 1);
  assert.equal(fitScale({ w: 1000, h: 300 }, { w: 500, h: 600 }), 0.5);
  assert.equal(fitScale({ w: 250, h: 900 }, { w: 500, h: 400 }), 0.5);
});

test("MASCOT_SPOTS khớp 3 bước", () =>
  assert.deepEqual(MASCOT_SPOTS.map((s) => s.corner), ["bl", "tr", "br"]));
