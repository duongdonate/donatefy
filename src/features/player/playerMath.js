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
