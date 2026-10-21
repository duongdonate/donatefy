// Logic thuần của landing cuộn từng bước (landing-mascot.html)
export const STEP_COUNT = 3;
export const LOCK_MS = 1000; // một cú lăn = một bước, chờ hiệu ứng xong mới nhận cú tiếp
export const WHEEL_THRESHOLD = 40;
export const SWIPE_MIN = 50;

export const MASCOT_SPOTS = [
  { corner: "bl", pose: "stand" },
  { corner: "tr", pose: "hug-vinyl" },
  { corner: "br", pose: "hug-knees" },
];

export const clampStep = (n, count = STEP_COUNT) => Math.max(0, Math.min(count - 1, n));

// Cộng dồn lăn chuột / touchpad để nhiều cú nhỏ chỉ ra một bước
export function accumulateWheel(acc, deltaY) {
  const next = acc + deltaY;
  if (Math.abs(next) > WHEEL_THRESHOLD) return { acc: 0, dir: Math.sign(next) };
  return { acc: next, dir: 0 };
}

const KEY_DELTA = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };

export function stepFromKey(key, step, count = STEP_COUNT) {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key in KEY_DELTA) return clampStep(step + KEY_DELTA[key], count);
  return null;
}

export function swipeDir(startY, endY) {
  const dy = startY - endY;
  return Math.abs(dy) > SWIPE_MIN ? Math.sign(dy) : 0;
}

// Màn thấp / hẹp thì thu nhỏ đều, không bao giờ phóng to
export const fitScale = (avail, box) => Math.min(1, avail.h / box.h, avail.w / box.w);
