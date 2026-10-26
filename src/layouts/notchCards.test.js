// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEVICE } from "../utils/device.js";
import { cardsFor, openCard, stepCard, fallbackCard, restingCard, visibleCard } from "./notchCards.js";

test("cardsFor: có bài ngoài /listen thì 2 thẻ, /listen hoặc chưa có bài thì chỉ tài khoản", () => {
  assert.deepEqual(cardsFor({ hasSong: true, onListen: false, loggedIn: true }), ["now", "account"]);
  assert.deepEqual(cardsFor({ hasSong: true, onListen: true, loggedIn: true }), ["account"]);
  assert.deepEqual(cardsFor({ hasSong: false, onListen: false, loggedIn: true }), ["account"]);
  assert.deepEqual(cardsFor({ hasSong: false, onListen: false, loggedIn: false }), []);
});

test("openCard: rê chuột vào đang phát, bấm avatar vào tài khoản", () => {
  assert.equal(openCard(["now", "account"], "hover"), "now");
  assert.equal(openCard(["account"], "hover"), "account");
  assert.equal(openCard(["now", "account"], "avatar"), "account");
  assert.equal(openCard([], "hover"), null);
});

test("stepCard: kẹp hai đầu", () => {
  assert.equal(stepCard(["now", "account"], "now", 1), "account");
  assert.equal(stepCard(["now", "account"], "account", 1), "account");
  assert.equal(stepCard(["now", "account"], "account", -1), "now");
});

test("fallbackCard: thẻ đang chọn biến mất thì về thẻ đầu còn lại", () => {
  assert.equal(fallbackCard(["account"], "now"), "account");
  assert.equal(fallbackCard(["now", "account"], "now"), "now");
  assert.equal(fallbackCard([], "now"), null);
});

test("restingCard: chỉ điện thoại có bài ngoài /listen mới có thẻ nhạc mỏng", () => {
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: true, onListen: false }), "now");
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: true, onListen: true }), null);
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: false, onListen: false }), null);
  assert.equal(restingCard({ device: DEVICE.DESKTOP, hasSong: true, onListen: false }), null);
});

test("visibleCard: thẻ hiện trong khung mở luôn là thẻ còn tồn tại (bỏ thẻ nhạc mỏng của viên)", () => {
  assert.equal(visibleCard(["now", "account"], null, "now"), "now");
  assert.equal(visibleCard(["now", "account"], "now", "now"), "account"); // tablet → điện thoại khi đang ở thẻ đang phát
  assert.equal(visibleCard(["account"], null, "now"), "account"); // hết bài
  assert.equal(visibleCard([], null, "account"), null); // đăng xuất
});
