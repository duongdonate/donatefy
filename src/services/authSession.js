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
