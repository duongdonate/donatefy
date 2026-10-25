import test from "node:test";
import assert from "node:assert/strict";
import {
  getAccessToken,
  setAccessToken,
  refreshOnce,
  onSessionExpired,
  expireSession,
  retryStartup,
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

test("retryStartup: thành công ngay, gọi một lần", async () => {
  let n = 0;
  assert.equal(await retryStartup(async () => (++n, "ok"), { isFatal: () => false }), "ok");
  assert.equal(n, 1);
});

test("retryStartup: lỗi thường thử lại với 1000, 2000", async () => {
  let n = 0;
  const waits = [];
  const fn = async () => {
    if (++n < 3) throw new Error("mạng");
    return "ok";
  };
  const r = await retryStartup(fn, { isFatal: () => false, sleep: async (ms) => waits.push(ms) });
  assert.equal(r, "ok");
  assert.equal(n, 3);
  assert.deepEqual(waits, [1000, 2000]);
});

test("retryStartup: lỗi fatal ném ngay", async () => {
  let n = 0;
  await assert.rejects(
    retryStartup(async () => { n++; throw { response: { status: 401 } }; }, { isFatal: (e) => e.response.status === 401 })
  );
  assert.equal(n, 1);
});

test("retryStartup: lỗi mãi thì ném lỗi cuối, không vượt totalMs", async () => {
  let t = 0;
  let n = 0;
  await assert.rejects(
    retryStartup(async () => { throw new Error(`e${++n}`); }, {
      isFatal: () => false,
      totalMs: 5000,
      now: () => t,
      sleep: async (ms) => { t += ms; },
    }),
    /e\d/
  );
  assert.ok(t <= 5000);
});
