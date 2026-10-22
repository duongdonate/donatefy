// Thanh âm lượng dọc (controls-options.html phương án C): kéo hoặc ↑ ↓
import { valueFromPointer } from "./playerMath";

const STEP = 0.05;

export default function VolumeSlider({ value, muted, onChange }) {
  const shown = muted ? 0 : value;
  const pick = (e, el) => onChange(valueFromPointer(e.clientY, el.getBoundingClientRect()));
  const onPointerDown = (e) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    pick(e, el);
    el.onpointermove = (m) => pick(m, el);
    el.onpointerup = () => (el.onpointermove = el.onpointerup = null);
  };
  const onKeyDown = (e) => {
    const d = { ArrowUp: STEP, ArrowRight: STEP, ArrowDown: -STEP, ArrowLeft: -STEP }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    onChange(Math.round(Math.min(1, Math.max(0, shown + d)) * 100) / 100);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Âm lượng"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown * 100)}
      aria-valuetext={muted ? "Tắt tiếng" : `${Math.round(shown * 100)}%`}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="relative flex w-8 cursor-ns-resize touch-none justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4"
      style={{ height: "clamp(120px, 18vh, 180px)" }}
    >
      {/* 10% hai đầu là vùng đệm, khớp với valueFromPointer */}
      <span className="absolute inset-y-[10%] w-1.5 rounded-full bg-matcha-4/20">
        <i className="absolute inset-x-0 bottom-0 rounded-full bg-matcha-4 dark:bg-matcha-1" style={{ height: `${shown * 100}%` }} />
        <i
          className="absolute left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,.3)]"
          style={{ bottom: `${shown * 100}%` }}
        />
      </span>
    </div>
  );
}
