// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEVICE, deviceFromWidth, keyboardInset } from "./device.js";

test("deviceFromWidth: 3 cấp thiết bị", () => {
  assert.equal(deviceFromWidth(320), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(767), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(768), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1279), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1280), DEVICE.DESKTOP);
  assert.equal(deviceFromWidth(1920), DEVICE.DESKTOP);
});

test("keyboardInset: phần đáy bị bàn phím che (iOS không co innerHeight)", () => {
  assert.equal(keyboardInset(812, null), 0);
  assert.equal(keyboardInset(812, { height: 812, offsetTop: 0 }), 0);
  assert.equal(keyboardInset(812, { height: 450, offsetTop: 0 }), 362);
  assert.equal(keyboardInset(812, { height: 450, offsetTop: 40 }), 322);
  assert.equal(keyboardInset(450, { height: 450, offsetTop: 0 }), 0); // Android resizes-content: đã co rồi
});
