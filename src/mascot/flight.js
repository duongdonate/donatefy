// Vị trí bay của Matcappa (dùng chung landing và trang đăng nhập)
const padOf = (W) => (W < 820 ? 12 : 24);

// Công thức góc theo landing-mascot.html
export function cornerXY(corner, pet, view) {
  const { W, H } = view, pad = padOf(W);
  const top = corner[0] === "t", left = corner[1] === "l";
  return {
    x: left ? pad : W - pet.w - pad - (top ? 8 : 0),
    y: top ? pad : H - pet.h - (W < 820 ? 56 : 72),
  };
}

const overlaps = (p, pet, r, gap = 16) =>
  p.x < r.x + r.w + gap && p.x + pet.w > r.x - gap && p.y < r.y + r.h + gap && p.y + pet.h > r.y - gap;

// Điểm ngẫu nhiên không đè thẻ `avoid`, đủ xa điểm cũ; màn quá chật thì về góc xa nhất
export function pickWanderSpot(pet, view, avoid, last, rand = Math.random) {
  const { W, H } = view, pad = padOf(W);
  const minDist = Math.min(W, H) / 4;
  const far = (p) => !last || Math.hypot(p.x - last.x, p.y - last.y) >= minDist;
  for (let i = 0; i < 20; i++) {
    const p = {
      x: Math.round(pad + rand() * Math.max(0, W - pet.w - 2 * pad)),
      y: Math.round(pad + rand() * Math.max(0, H - pet.h - 2 * pad)),
    };
    if (!overlaps(p, pet, avoid) && far(p)) return p;
  }
  // bỏ góc trên-trái: chỗ đặt nút "Về quán"
  const corners = ["bl", "tr", "br"].map((c) => cornerXY(c, pet, view));
  if (!last) return corners[0];
  const dist = (p) => Math.hypot(p.x - last.x, p.y - last.y);
  return corners.reduce((a, b) => (dist(b) > dist(a) ? b : a));
}
