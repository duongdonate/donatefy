// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAuth, mapAuthError, validateAvatar } from "./authForm.js";

test("đăng nhập chỉ cần có tên và mật khẩu", () => {
  assert.deepEqual(validateAuth({ mode: "login", username: " a ", password: "1" }), {});
  assert.deepEqual(validateAuth({ mode: "login", username: "  ", password: "" }), {
    username: "Bạn chưa nhập tên đăng nhập.",
    password: "Bạn chưa nhập mật khẩu.",
  });
});

test("đăng ký kiểm tên và độ dài", () => {
  assert.deepEqual(validateAuth({ mode: "register", username: "ab", password: "12345" }), {
    username: "Tên 3–30 ký tự, chỉ gồm chữ, số, _ và .",
    password: "Mật khẩu cần ít nhất 6 ký tự.",
  });
  assert.deepEqual(validateAuth({ mode: "register", username: "duong.donate_1", password: "123456" }), {});
  assert.equal(
    validateAuth({ mode: "register", username: "có dấu", password: "123456" }).username,
    "Tên 3–30 ký tự, chỉ gồm chữ, số, _ và ."
  );
});

test("ánh xạ lỗi server", () => {
  assert.deepEqual(mapAuthError("Username đã tồn tại"), { field: "username", text: "Tên tài khoản đã tồn tại." });
  assert.deepEqual(mapAuthError("Tên tài khoản hoặc mật khẩu không chính xác"), {
    field: null,
    text: "Tên tài khoản hoặc mật khẩu không chính xác.",
  });
  assert.equal(mapAuthError("Network Error").text, "Quán đang mất sóng một chút, bạn thử lại sau nhé.");
  assert.equal(mapAuthError(undefined).text, "Quán đang mất sóng một chút, bạn thử lại sau nhé.");
  assert.equal(mapAuthError("Lỗi server").text, "Có gì đó chưa ổn, bạn thử lại nhé.");
});

test("ảnh đại diện", () => {
  assert.equal(validateAvatar(undefined), null);
  assert.equal(validateAvatar({ type: "image/png", size: 2 * 1024 * 1024 }), null);
  assert.equal(validateAvatar({ type: "image/webp", size: 10 }), "Ảnh cần là jpg, png hoặc gif.");
  assert.equal(validateAvatar({ type: "image/gif", size: 2 * 1024 * 1024 + 1 }), "Ảnh tối đa 2MB.");
});
