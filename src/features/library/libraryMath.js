const time = (p) => new Date(p.createdAt).getTime() || 0; // thiếu createdAt = cũ nhất

// Đang phát lên đầu, còn lại cũ trước mới sau (bìa mới tạo nằm ngay trước thẻ Tạo); không đổi mảng gốc
export const libraryOrder = (playlists, playingId) =>
  [...playlists].sort(
    (a, b) => (b._id === playingId) - (a._id === playingId) || time(a) - time(b),
  );

// Công thức quạt của bản mẫu playlists-options.html
export function fanTransform(o) {
  const a = Math.abs(o);
  const scale = Math.round((1 - Math.min(a, 3) * 0.14) * 100) / 100;
  return `translateX(${o * 15}cqw) translateY(${Math.round(a * 1.6 * 100) / 100}cqw) rotate(${o * 5}deg) scale(${scale})`;
}

export const totalDuration = (songs) => songs.reduce((s, x) => s + (x.duration || 0), 0);
