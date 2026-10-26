// Logic thuần chọn thẻ của notch (test bằng node)
import { DEVICE } from "../utils/device.js";

export const CARD = { NOW: "now", ACCOUNT: "account" };

// Thứ tự thẻ = thứ tự hàng chấm. /listen đã là trình phát nên không có thẻ đang phát
export function cardsFor({ hasSong, onListen, loggedIn }) {
  const cards = [];
  if (hasSong && !onListen) cards.push(CARD.NOW);
  if (loggedIn) cards.push(CARD.ACCOUNT);
  return cards;
}

// via: "hover" (rê chuột) | "avatar" (bấm nút tài khoản)
export function openCard(cards, via) {
  if (via === "avatar") return CARD.ACCOUNT;
  return cards.includes(CARD.NOW) ? CARD.NOW : (cards[0] ?? null);
}

// Lướt / bấm chấm: dir 1 sang phải, -1 sang trái; kẹp hai đầu, không vòng
export function stepCard(cards, current, dir) {
  const i = Math.min(cards.length - 1, Math.max(0, cards.indexOf(current) + dir));
  return cards[i];
}

// Thẻ đang chọn bị mất (hết bài, vào /listen) thì về thẻ đầu còn lại
export function fallbackCard(cards, current) {
  return cards.includes(current) ? current : (cards[0] ?? null);
}

// Viên thu gọn trên điện thoại kèm sẵn thẻ nhạc mỏng
export function restingCard({ device, hasSong, onListen }) {
  return device === DEVICE.MOBILE && hasSong && !onListen ? CARD.NOW : null;
}
