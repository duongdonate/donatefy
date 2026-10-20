import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { marqueeKeyframes } from "../utils/marquee";

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Chữ chạy kiểu Spotify: chỉ chạy khi text dài hơn khung, lặp vô hạn với
 * 1 bản sao nối đuôi, tốc độ px/s cố định nên text dài thì chạy lâu hơn.
 * Khi không chạy (active=false hoặc text vừa khung) thì cắt bằng dấu "…".
 */
function Marquee({
  children,
  active = true,
  speed = 40, // px/s
  pause = 2, // giây đứng yên đầu mỗi vòng
  gap = 48, // px giữa 2 bản sao
  instant = false, // true: vòng đầu chạy ngay (dùng cho hover), các vòng sau vẫn dừng `pause`
  className = "",
}) {
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const trackRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0); // 0 = text vừa khung

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const measure = () => {
      const width = text.offsetWidth;
      setTextWidth(width > box.clientWidth + 1 ? width : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(text);
    return () => observer.disconnect();
  }, [children]);

  const running = active && textWidth > 0 && !reducedMotion();

  useEffect(() => {
    if (!running) return;
    const { keyframes, duration } = marqueeKeyframes(textWidth, { gap, speed, pause });
    const animation = trackRef.current.animate(keyframes, {
      duration,
      iterations: Infinity,
    });
    if (instant) animation.currentTime = pause * 1000; // bỏ qua đoạn đứng yên của vòng đầu
    return () => animation.cancel(); // dừng là về lại đầu, giống Spotify
  }, [running, textWidth, gap, speed, pause, instant]);

  return (
    <div
      ref={boxRef}
      className={`min-w-0 overflow-hidden whitespace-nowrap ${
        running ? "marquee-fade" : "text-ellipsis"
      } ${className}`}
    >
      {/* Giữ cùng 1 cây DOM ở cả 2 trạng thái để ref/ResizeObserver không trỏ vào node đã bị gỡ.
          inline khi đứng yên (để text-ellipsis hoạt động), inline-block khi chạy (để transform được). */}
      <div
        ref={trackRef}
        className={running ? "inline-block will-change-transform" : "inline"}
      >
        <span ref={textRef}>{children}</span>
        {running && (
          <span aria-hidden="true" style={{ paddingLeft: gap }}>
            {children}
          </span>
        )}
      </div>
    </div>
  );
}

export default Marquee;
