// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEVICE, deviceFromWidth } from "./device.js";

test("deviceFromWidth: 3 cấp thiết bị", () => {
  assert.equal(deviceFromWidth(320), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(767), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(768), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1279), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1280), DEVICE.DESKTOP);
  assert.equal(deviceFromWidth(1920), DEVICE.DESKTOP);
});
