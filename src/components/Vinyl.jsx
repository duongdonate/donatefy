// Đĩa than latte-matcha (landing-mascot.html): quay 6s/vòng, nhãn giữa tuỳ bài
const GROOVES =
  "repeating-radial-gradient(circle,rgba(0,0,0,.07) 0 1px,transparent 1px 4px)," +
  "radial-gradient(circle at 42% 38%,rgba(244,241,223,.95) 0 9%,transparent 22%)," +
  "radial-gradient(circle at 63% 64%,rgba(244,241,223,.85) 0 7%,transparent 19%)," +
  "conic-gradient(from 30deg,#5f8a2c,#9cbf68 12%,#f4f1df 18%,#8db35a 26%,#4f7a22 40%,#b6d08a 52%,#f1eed8 58%,#76a03f 68%,#5f8a2c)";
const SHEEN =
  "conic-gradient(from 20deg, transparent 0 8%, rgba(255,255,255,.2) 13%, transparent 20% 52%, rgba(255,255,255,.14) 58%, transparent 66%)";
const DEFAULT_LABEL = "radial-gradient(circle,#e9e6da 0 7%,#3f6b1c 8% 100%)";

export default function Vinyl({ size = 236, label = DEFAULT_LABEL, spinning = true, duration = 6, className = "", style }) {
  const k = size / 236;
  return (
    <div aria-hidden="true" className={`relative shrink-0 ${className}`} style={{ width: size, height: size, ...style }}>
      <div
        className="absolute inset-0 animate-spin rounded-full motion-reduce:animate-none"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: spinning ? "running" : "paused",
          background: GROOVES,
          boxShadow: `0 ${30 * k}px ${50 * k}px ${-20 * k}px rgba(73,115,0,.55), inset 0 0 0 ${5 * k}px rgba(73,115,0,.9), inset 0 0 ${30 * k}px rgba(0,0,0,.2)`,
        }}
      >
        <div
          className="absolute inset-[35%] rounded-full"
          style={{ background: label, backgroundSize: "cover", backgroundPosition: "center", boxShadow: `0 0 0 ${5 * k}px #f4f1df` }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full mix-blend-screen" style={{ background: SHEEN }} />
    </div>
  );
}
