import { memo, useId } from "react";
import styles from "./Loader.module.css";

// Chasen nhìn nghiêng (matcha-effects.html, phương án A): nan cong hình củ hành
const TINES = Array.from({ length: 34 }, (_, i) => {
  const s = (i / 33) * 2 - 1;
  const x0 = 38 + s * 8, bulge = 38 + s * 36, tip = 38 + s * 15;
  return { d: `M${x0} 96 C${bulge} 118 ${bulge} 172 ${tip} 186`, c: i % 2 ? "#e3c991" : "#cfae6f" };
});
const INNER = Array.from({ length: 12 }, (_, i) => {
  const s = (i / 11) * 2 - 1;
  return `M${38 + s * 5} 98 L${38 + s * 9} 150`;
});
const BUBBLES = [
  { left: 70, top: 120, d: 10, delay: 0 },
  { left: 150, top: 118, d: 8, delay: 0.5 },
  { left: 110, top: 124, d: 12, delay: 1 },
  { left: 90, top: 122, d: 6, delay: 1.3 },
];

// decorative: chỉ để trang trí (landing, lớp chờ có chữ riêng) nên ẩn khỏi trình đọc màn hình
function Loader({ size = 120, label = "Đang pha nhạc…", decorative = false }) {
  const id = useId().replace(/:/g, "");
  const clay = `${id}clay`, glaze = `${id}glaze`, bam = `${id}bam`;

  return (
    <div
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
      className={styles.wrap}
      style={{ width: size, height: size }}
    >
      <div className={styles.scene} style={{ transform: `scale(${size / 240})` }} aria-hidden="true">
        <svg className={styles.bowl} viewBox="0 0 200 120">
          <defs>
            <linearGradient id={clay} x1="0" x2="1">
              <stop offset="0" stopColor="#2b2226" />
              <stop offset=".45" stopColor="#5a464c" />
              <stop offset="1" stopColor="#231b1f" />
            </linearGradient>
            <linearGradient id={glaze} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7a9622" />
              <stop offset="1" stopColor="#3a2d31" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M8 26 Q12 112 100 116 Q188 112 192 26 Z" fill={`url(#${clay})`} />
          <path d="M8 26 Q14 60 40 70 L40 30 Z" fill={`url(#${glaze})`} opacity=".5" />
          <ellipse cx="100" cy="26" rx="92" ry="20" fill="#3a2d31" />
          <ellipse className={styles.surface} cx="100" cy="30" rx="82" ry="15" />
          <ellipse className={styles.foam} cx="100" cy="30" rx="56" ry="9" fill="#e9f0d2" opacity=".55" />
        </svg>
        <div className={styles.orbitX}>
          <div className={styles.orbitY}>
            <svg className={styles.chasen} viewBox="0 0 76 190">
              <defs>
                <linearGradient id={bam} x1="0" x2="1">
                  <stop offset="0" stopColor="#b8945a" />
                  <stop offset=".5" stopColor="#ead39f" />
                  <stop offset="1" stopColor="#a9854c" />
                </linearGradient>
              </defs>
              <rect x="29" y="0" width="18" height="98" rx="8" fill={`url(#${bam})`} />
              <rect x="29" y="30" width="18" height="4" fill="#a07b45" />
              {TINES.map((t, i) => (
                <path key={i} d={t.d} stroke={t.c} strokeWidth="1.3" fill="none" />
              ))}
              {INNER.map((d, i) => (
                <path key={i} d={d} stroke="#b8945a" strokeWidth="1" fill="none" />
              ))}
            </svg>
          </div>
        </div>
        {/* Thành chén phía trước đè lên đầu nan, như chasen đang nhúng trong chén */}
        <svg className={styles.bowl} viewBox="0 0 200 120" style={{ zIndex: 2 }}>
          <path d="M8 26 A92 20 0 0 0 192 26 Q188 112 100 116 Q12 112 8 26 Z" fill={`url(#${clay})`} />
          <path d="M8 26 A92 20 0 0 0 192 26" fill="none" stroke="#6a5459" strokeWidth="2" />
          <path d="M22 50 Q30 90 70 104" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5" strokeLinecap="round" />
        </svg>
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className={styles.bubble}
            style={{ left: b.left, top: b.top, width: b.d, height: b.d, animationDelay: `${b.delay}s` }}
          />
        ))}
      </div>
      {!decorative && <span className={styles.srOnly}>{label}</span>}
    </div>
  );
}

export default memo(Loader);
