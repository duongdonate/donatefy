import test from "node:test";
import assert from "node:assert/strict";
import {
  getAccessToken,
  setAccessToken,
  refreshOnce,
  onSessionExpired,
  expireSession,
} from "./authSession.js";

test("refreshOnce: gọi đồng thời chỉ chạy một lần, cùng token", async () => {
  setAccessToken(null);
  let calls = 0;
  const fn = async () => {
    calls++;
    return "t1";
  };
  const [a, b] = await Promise.all([refreshOnce(fn), refreshOnce(fn)]);
  assert.equal(calls, 1);
  assert.equal(a, "t1");
  assert.equal(b, "t1");
  assert.equal(getAccessToken(), "t1");
  await refreshOnce(async () => {
    calls++;
    return "t2";
  });
  assert.equal(calls, 2);
  assert.equal(getAccessToken(), "t2");
});

test("refreshOnce: lỗi thì cả hai reject, lần sau gọi lại được", async () => {
  const fail = async () => {
    throw new Error("x");
  };
  const results = await Promise.allSettled([refreshOnce(fail), refreshOnce(fail)]);
  assert.deepEqual(results.map((r) => r.status), ["rejected", "rejected"]);
  assert.equal(await refreshOnce(async () => "ok"), "ok");
});

test("expireSession xoá token và gọi cb; hàm huỷ gỡ cb", () => {
  setAccessToken("abc");
  let n = 0;
  const off = onSessionExpired(() => n++);
  expireSession();
  assert.equal(n, 1);
  assert.equal(getAccessToken(), null);
  off();
  expireSession();
  assert.equal(n, 1);
});
