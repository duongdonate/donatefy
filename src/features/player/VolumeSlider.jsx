// Thanh âm lượng ngang: kéo, bấm, hoặc ← → ↑ ↓
import { ratioFromPointerX } from "./playerMath";

const STEP = 0.05;
const round2 = (v) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;

export default function VolumeSlider({ value, muted, onChange, width = 120, height = 32 }) {
  const shown = muted ? 0 : value;
  const pick = (e, el) => onChange(round2(ratioFromPointerX(e.clientX, el.getBoundingClientRect())));
  const onPointerDown = (e) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    pick(e, el);
    el.onpointermove = (m) => pick(m, el);
    el.onpointerup = el.onpointercancel = () => (el.onpointermove = el.onpointerup = el.onpointercancel = null);
  };
  const onKeyDown = (e) => {
    const d = { ArrowUp: STEP, ArrowRight: STEP, ArrowDown: -STEP, ArrowLeft: -STEP }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    onChange(round2(shown + d));
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Âm lượng"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown * 100)}
      aria-valuetext={muted ? "Tắt tiếng" : `${Math.round(shown * 100)}%`}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="relative flex shrink-0 cursor-ew-resize touch-none items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4"
      style={{ width, height }}
    >
      <span className="relative h-1.5 w-full rounded-full bg-matcha-4/20 dark:bg-white/15">
        <i className="absolute inset-y-0 left-0 rounded-full bg-matcha-4 dark:bg-matcha-1" style={{ width: `${shown * 100}%` }} />
        <i
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,.3)]"
          style={{ left: `${shown * 100}%` }}
        />
      </span>
    </div>
  );
}
