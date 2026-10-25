// Đặt bài về lại đúng vị trí cũ (kẹp trong khoảng hợp lệ nếu danh sách đã ngắn đi)
export function insertAt(list, item, index) {
  const i = Math.max(0, Math.min(index, list.length));
  return [...list.slice(0, i), item, ...list.slice(i)];
}
