// Logic thuần của trình phát (không đụng React / Redux) để test bằng node
export const VOLUME_KEY = "donatefy.volume";

// Giống Spotify: đã nghe > 3s (hoặc đang ở bài đầu mà không lặp tất cả) thì về đầu bài
export function previousAction(played, position, repeat) {
  if (played > 3 || (position === 0 && repeat !== "all")) return "restart";
  return "previous";
}

export function parseSavedVolume(raw) {
  try {
    const v = JSON.parse(raw);
    const ok = typeof v?.volume === "number" && v.volume >= 0 && v.volume <= 1 && typeof v.muted === "boolean";
    return ok ? { volume: v.volume, muted: v.muted } : null;
  } catch {
    return null;
  }
}

// Các ô dock quanh bài đang phát: offset âm = đã phát, 0 = đang phát, dương = sắp tới
export function dockWindow(orderLength, position, size = 5) {
  if (position < 0) return [];
  const half = Math.floor(size / 2);
  const out = [];
  for (let offset = -half; offset <= half; offset++) {
    const pos = position + offset;
    if (pos >= 0 && pos < orderLength) out.push({ pos, offset });
  }
  return out;
}

// Thanh ngang (trái = 0): vị trí con trỏ thành tỉ lệ 0..1
export function ratioFromPointerX(clientX, rect) {
  if (!rect.width) return 0;
  const v = (clientX - rect.left) / rect.width;
  return Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;
}

// Phím trên thanh tiến trình → giây mới (null nếu không phải phím tua)
export function seekKeyStep(key, current, duration, step = 5) {
  const next = { ArrowLeft: current - step, ArrowRight: current + step, Home: 0, End: duration }[key];
  if (next === undefined) return null;
  return Math.min(duration, Math.max(0, next));
}

// Đổi chỗ phần tử với hàng xóm; vượt biên thì giữ nguyên mảng cũ
export function moveItem(list, index, delta) {
  const to = index + delta;
  if (to < 0 || to >= list.length) return list;
  const out = [...list];
  [out[index], out[to]] = [out[to], out[index]];
  return out;
}

const TYPING = ["INPUT", "TEXTAREA", "SELECT"];
const OWN_KEYS = [" ", "ArrowLeft", "ArrowRight"]; // nút / thanh trượt tự xử lý các phím này
const KEYS = { " ": "toggle", ArrowLeft: "back5", ArrowRight: "fwd5", m: "mute", M: "mute", q: "queue", Q: "queue" };

export function hotkeyAction(e) {
  const t = e.target ?? {};
  if (TYPING.includes(t.tagName) || t.isContentEditable) return null;
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const control = ["BUTTON", "A"].includes(t.tagName) || t.getAttribute?.("role") === "slider";
  if (control && OWN_KEYS.includes(e.key)) return null;
  if (e.shiftKey && e.key === "ArrowLeft") return "previous";
  if (e.shiftKey && e.key === "ArrowRight") return "next";
  return KEYS[e.key] ?? null;
}


// Cỡ đĩa: không quá `limit`; chỗ theo chiều cao không đủ `min` thì ẩn đĩa (0) thay vì ép to đè lên chữ
export function fitDisc(byHeight, limit, min) {
  if (byHeight < min) return 0;
  return Math.min(limit, byHeight);
}
