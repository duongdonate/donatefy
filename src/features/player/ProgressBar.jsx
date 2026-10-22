// Thanh tiến trình tua được: chuột / chạm kéo, ← → tua 5 giây, Home / End
import formatDuration from "../../utils/formatDuration";

const STEP = 5;

export default function ProgressBar({ currentTime, duration, onSeek, className = "", style }) {
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  const seekTo = (clientX, el) => {
    const r = el.getBoundingClientRect();
    if (duration) onSeek(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * duration);
  };
  const onPointerDown = (e) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    seekTo(e.clientX, el);
    el.onpointermove = (m) => seekTo(m.clientX, el);
    el.onpointerup = () => (el.onpointermove = el.onpointerup = null);
  };
  const onKeyDown = (e) => {
    const to = { ArrowLeft: currentTime - STEP, ArrowRight: currentTime + STEP, Home: 0, End: duration }[e.key];
    if (to === undefined || !duration) return;
    e.preventDefault();
    onSeek(Math.min(duration, Math.max(0, to)));
  };

  return (
    <div className={className} style={style}>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Tiến trình bài hát"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatDuration(currentTime)} / ${formatDuration(duration)}`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="group relative h-4 cursor-pointer touch-none py-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 rounded"
      >
        <div className="h-1.5 overflow-hidden rounded-full bg-matcha-4/15">
          <div className="h-full rounded-full bg-matcha-4 dark:bg-matcha-1" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-soft">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}
