// Access token chỉ giữ trong bộ nhớ (không localStorage); không import axios để chạy được dưới node --test.
let accessToken = null;
let inflight = null;
const listeners = new Set();

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};

// Nhiều request cùng gặp 401 thì chỉ làm mới một lần, dùng chung kết quả.
export function refreshOnce(doRefresh) {
  if (!inflight) {
    inflight = doRefresh()
      .then((token) => {
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function onSessionExpired(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function expireSession() {
  setAccessToken(null);
  listeners.forEach((cb) => cb());
}

// Render Free ngủ thì refresh lúc khởi động lỗi mạng/5xx: thử lại tới totalMs; lỗi isFatal (401) ném ngay.
export async function retryStartup(
  fn,
  { isFatal, totalMs = 60000, delays = [1000, 2000, 4000, 8000], now = Date.now, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}
) {
  const start = now();
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const wait = delays[Math.min(i, delays.length - 1)];
      if (isFatal(err) || now() - start + wait > totalMs) throw err;
      await sleep(wait);
    }
  }
}
