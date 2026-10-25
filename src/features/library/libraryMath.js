// Đang phát lên đầu, còn lại mới tạo trước; không đổi mảng gốc
export const libraryOrder = (playlists, playingId) =>
  [...playlists].sort(
    (a, b) => (b._id === playingId) - (a._id === playingId) || new Date(b.createdAt) - new Date(a.createdAt),
  );

// Công thức quạt của bản mẫu playlists-options.html
export function fanTransform(o) {
  const a = Math.abs(o);
  const scale = Math.round((1 - Math.min(a, 3) * 0.14) * 100) / 100;
  return `translateX(${o * 15}cqw) translateY(${a * 1.6}cqw) rotate(${o * 5}deg) scale(${scale})`;
}

export const totalDuration = (songs) => songs.reduce((s, x) => s + (x.duration || 0), 0);
