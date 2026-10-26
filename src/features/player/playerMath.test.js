// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { previousAction, parseSavedVolume, dockWindow, moveItem, hotkeyAction, ratioFromPointerX, seekKeyStep, fitDisc, stripWidth, fitCells } from "./playerMath.js";

test("ratioFromPointerX: kẹp 0..1", () => {
  const rect = { left: 100, width: 200 };
  assert.equal(ratioFromPointerX(100, rect), 0);
  assert.equal(ratioFromPointerX(200, rect), 0.5);
  assert.equal(ratioFromPointerX(50, rect), 0);
  assert.equal(ratioFromPointerX(999, rect), 1);
  assert.equal(ratioFromPointerX(150, { left: 0, width: 0 }), 0);
});

test("seekKeyStep: ← → 5 giây, Home/End, kẹp hai đầu", () => {
  assert.equal(seekKeyStep("ArrowRight", 10, 100), 15);
  assert.equal(seekKeyStep("ArrowLeft", 3, 100), 0);
  assert.equal(seekKeyStep("ArrowRight", 98, 100), 100);
  assert.equal(seekKeyStep("Home", 50, 100), 0);
  assert.equal(seekKeyStep("End", 50, 100), 100);
  assert.equal(seekKeyStep("a", 50, 100), null);
});

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

test("dock 5 ô, sát hai đầu và hàng chờ ngắn", () => {
  assert.deepEqual(dockWindow(10, 4).map((d) => d.pos), [2, 3, 4, 5, 6]);
  assert.deepEqual(dockWindow(10, 0).map((d) => d.offset), [0, 1, 2]);
  assert.deepEqual(dockWindow(10, 9).map((d) => d.offset), [-2, -1, 0]);
  assert.deepEqual(dockWindow(2, 1).map((d) => d.pos), [0, 1]);
  assert.deepEqual(dockWindow(3, 1, 3).map((d) => d.pos), [0, 1, 2]);
  assert.deepEqual(dockWindow(0, -1), []);
});

test("đổi chỗ", () => {
  const l = ["a", "b", "c"];
  assert.deepEqual(moveItem(l, 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveItem(l, 1, 1), ["a", "c", "b"]);
  assert.equal(moveItem(l, 0, -1), l);
  assert.equal(moveItem(l, 2, 1), l);
});

test("phím tắt", () => {
  const body = { tagName: "BODY", getAttribute: () => null };
  const input = { tagName: "INPUT", getAttribute: () => null };
  const btn = { tagName: "BUTTON", getAttribute: () => null };
  const slider = { tagName: "DIV", getAttribute: (a) => (a === "role" ? "slider" : null) };
  const k = (key, o = {}) =>
    hotkeyAction({ key, target: body, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...o });
  assert.equal(k(" "), "toggle");
  assert.equal(k("ArrowLeft"), "back5");
  assert.equal(k("ArrowRight", { shiftKey: true }), "next");
  assert.equal(k("ArrowLeft", { shiftKey: true }), "previous");
  assert.equal(k("M"), "mute");
  assert.equal(k("q"), "queue");
  assert.equal(k("/"), null);
  assert.equal(k("m", { target: input }), null);
  assert.equal(k(" ", { target: btn }), null);
  assert.equal(k("ArrowLeft", { target: slider }), null);
  assert.equal(k("m", { target: btn }), "mute");
  assert.equal(k("ArrowRight", { ctrlKey: true }), null);
  assert.equal(k("x"), null);
});


test("fitDisc: đủ chỗ thì lấy nhỏ nhất, thiếu chỗ thì ẩn đĩa (0) thay vì đè lên chữ", () => {
  assert.equal(fitDisc(400, 300, 120), 300);
  assert.equal(fitDisc(200, 300, 120), 200);
  assert.equal(fitDisc(119, 300, 120), 0);
  assert.equal(fitDisc(-40, 300, 120), 0);
});

test("stripWidth: bề ngang dải n bìa xoè (mỗi bìa lệch 0.82 bìa, chừa chỗ bìa giữa phóng 1.12)", () => {
  assert.equal(stripWidth(100, 1), 130);
  assert.equal(stripWidth(100, 3), 294);
  assert.equal(stripWidth(100, 5), 458);
});

test("fitCells: số bìa lẻ lớn nhất vừa chỗ, bỏ đều hai bên, không quá mức của thiết bị", () => {
  assert.equal(fitCells(1000, 100, 5), 5);
  assert.equal(fitCells(1000, 100, 3), 3); // tablet tối đa 3
  assert.equal(fitCells(400, 100, 5), 3);
  assert.equal(fitCells(200, 100, 5), 1);
  assert.equal(fitCells(50, 100, 5), 1); // tối thiểu vẫn giữ bìa đang phát
});
