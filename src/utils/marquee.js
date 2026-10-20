// Keyframes cho marquee kiểu Spotify: đứng yên `pause` giây ở đầu mỗi vòng,
// rồi trượt đúng 1 "chu kỳ" (độ dài text + khoảng cách) với tốc độ không đổi.
// Vì bản sao thứ 2 nằm sau đúng `distance` px, cuối vòng trông y như đầu vòng => lặp liền mạch.
export function marqueeKeyframes(textWidth, { gap = 48, speed = 40, pause = 2 } = {}) {
  const distance = textWidth + gap;
  const moveSeconds = distance / speed;
  const total = pause + moveSeconds;
  return {
    duration: total * 1000,
    keyframes: [
      { transform: "translateX(0)", offset: 0 },
      { transform: "translateX(0)", offset: pause / total },
      { transform: `translateX(-${distance}px)`, offset: 1 },
    ],
  };
}
