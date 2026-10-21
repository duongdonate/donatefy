// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { cornerXY, pickWanderSpot } from "./flight.js";

test("góc mascot trên máy tính và điện thoại", () => {
  assert.deepEqual(cornerXY("bl", { w: 110, h: 119 }, { W: 1440, H: 900 }), { x: 24, y: 709 });
  assert.deepEqual(cornerXY("tr", { w: 110, h: 119 }, { W: 1440, H: 900 }), { x: 1298, y: 24 });
  assert.deepEqual(cornerXY("br", { w: 76, h: 82 }, { W: 360, H: 640 }), { x: 272, y: 502 });
});

test("bay lượn: không đè thẻ form, đủ xa điểm cũ, nằm trong màn hình", () => {
  const pet = { w: 110, h: 119 }, view = { W: 1440, H: 900 }, card = { x: 520, y: 200, w: 400, h: 500 };
  let last = null;
  for (let n = 0; n < 300; n++) {
    const p = pickWanderSpot(pet, view, card, last);
    const overlap =
      p.x < card.x + card.w + 16 && p.x + pet.w > card.x - 16 && p.y < card.y + card.h + 16 && p.y + pet.h > card.y - 16;
    assert.equal(overlap, false);
    assert.ok(p.x >= 24 && p.x + pet.w <= 1440 - 24 && p.y >= 24 && p.y + pet.h <= 900 - 24);
    if (last) assert.ok(Math.hypot(p.x - last.x, p.y - last.y) >= 900 / 4);
    last = p;
  }
});

test("bay lượn: màn quá chật thì về góc xa nhất", () => {
  const p = pickWanderSpot({ w: 76, h: 82 }, { W: 360, H: 640 }, { x: 0, y: 0, w: 360, h: 640 }, { x: 12, y: 12 }, () => 0.5);
  assert.deepEqual(p, cornerXY("br", { w: 76, h: 82 }, { W: 360, H: 640 }));
});

test("bay lượn: góc dự phòng không bao giờ là góc trên-trái (chỗ nút Về quán)", () => {
  const pet = { w: 76, h: 82 }, view = { W: 360, H: 640 };
  const p = pickWanderSpot(pet, view, { x: 0, y: 0, w: 360, h: 640 }, cornerXY("br", pet, view), () => 0.5);
  assert.notDeepEqual(p, { x: 12, y: 12 });
});
