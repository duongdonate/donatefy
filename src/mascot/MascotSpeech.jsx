// Bong bóng câu nói của Matcappa: không nút, không hiệu ứng gõ, tự tắt sau ~2,6s
import { useEffect, useRef } from "react";

export default function MascotSpeech({ text, show, side = "right", onHide, duration = 2600, className = "", style }) {
  const hideRef = useRef(onHide);
  hideRef.current = onHide; // để cha render lại không làm đếm lại từ đầu
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => hideRef.current?.(), duration);
    return () => clearTimeout(t);
  }, [show, text, duration]);

  // side = phía bong bóng nằm so với mascot; góc nhọn quay về mascot
  const corner = side === "right" ? "rounded-bl origin-left" : "rounded-br origin-right";
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none w-max max-w-[min(360px,calc(100vw-120px))] rounded-[18px] border border-white/80 bg-[rgba(250,248,236,.82)] px-4 py-3 text-sm font-semibold leading-snug text-[#1f2e17] shadow-[0_16px_30px_-18px_rgba(31,46,23,.55)] backdrop-blur-[14px] transition duration-200 ease-matcha [text-wrap:balance] motion-reduce:transition-none ${corner} ${
        show ? "scale-100 opacity-100" : "scale-[.85] opacity-0"
      } ${className}`}
      style={style}
    >
      {show ? text : ""}
    </div>
  );
}
