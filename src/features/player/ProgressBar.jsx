// Thanh tiến trình tua được: bấm nhảy tới, kéo rồi thả mới tua (đỡ giật YouTube), ← → 5 giây, Home / End
import { useRef, useState } from "react";
import formatDuration from "../../utils/formatDuration";
import { ratioFromPointerX, seekKeyStep } from "./playerMath";

// alwaysThumb: máy chạm không có rê chuột nên núm luôn hiện
export default function ProgressBar({ currentTime, duration, onSeek, alwaysThumb = false, className = "" }) {
  const [drag, setDrag] = useState(null); // tỉ lệ 0..1 khi đang kéo
  const [hover, setHover] = useState(null); // tỉ lệ 0..1 dưới con trỏ
  const dragRef = useRef(null); // bản sao để pointerup + lostpointercapture không tua hai lần

  const played = duration ? Math.min(1, currentTime / duration) : 0;
  const shown = drag ?? played;
  const tipRatio = drag ?? hover;
  const active = drag !== null || hover !== null;
  const showThumb = alwaysThumb || active;

  const ratioAt = (e) => ratioFromPointerX(e.clientX, e.currentTarget.getBoundingClientRect());

  const onPointerDown = (e) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = ratioAt(e);
    setDrag(dragRef.current);
  };
  const onPointerMove = (e) => {
    const r = ratioAt(e);
    if (dragRef.current !== null) setDrag((dragRef.current = r));
    if (e.pointerType === "mouse") setHover(r);
  };
  const finish = () => {
    if (dragRef.current === null) return;
    onSeek(dragRef.current * duration);
    dragRef.current = null;
    setDrag(null);
  };
  const onKeyDown = (e) => {
    if (!duration) return;
    const to = seekKeyStep(e.key, currentTime, duration);
    if (to === null) return;
    e.preventDefault();
    onSeek(to);
  };

  return (
    <div className={className}>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Tiến trình bài hát"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatDuration(currentTime)} / ${formatDuration(duration)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKeyDown}
        className="relative flex h-11 cursor-pointer touch-none items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4"
      >
        {/* Thanh 6px, phình 10px khi rê / kéo */}
        <div
          className="relative w-full rounded-full bg-matcha-4/15 transition-[height] duration-150 dark:bg-white/15"
          style={{ height: active ? 10 : 6 }}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-matcha-4 dark:bg-matcha-1" style={{ width: `${shown * 100}%` }} />
          {showThumb && (
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.35)]"
              style={{ left: `${shown * 100}%` }}
            />
          )}
        </div>
        {tipRatio !== null && duration > 0 && (
          <span
            className="pointer-events-none absolute bottom-full mb-1 -translate-x-1/2 rounded-md bg-[rgba(10,14,8,.88)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#eef3e6]"
            style={{ left: `${tipRatio * 100}%` }}
          >
            {formatDuration(tipRatio * duration)}
          </span>
        )}
      </div>
      <div className="flex justify-between text-xs tabular-nums text-ink-soft">
        <span>{formatDuration(drag !== null ? drag * duration : currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}
