// Dock: băng chuyền bìa quanh bài đang phát (visual-direction-v3.html)
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getIsPlaying, getIsShowQueue, getRepeat } from "../../app/selectors";
import { playAt } from "../../app/slices/playerSlice";
import { Glass, IconButton } from "../../components";
import { usePlaybackTime } from "./PlaybackTime";
import { dockWindow } from "./playerMath";

const C = "clamp(64px, 9vw, 110px)"; // cạnh một bìa

export default function Dock({ size = 5 }) {
  const dispatch = useDispatch();
  const isPlaying = useSelector(getIsPlaying);
  const repeat = useSelector(getRepeat);
  const showQueue = useSelector(getIsShowQueue);
  const { queue, order, position } = useSelector((s) => s.player);
  const { previous, next, togglePlay } = usePlaybackTime();
  if (position < 0) return null;

  const cells = dockWindow(order.length, position, size);
  const atEnd = position === order.length - 1 && repeat !== "all";
  const navCls = "!h-12 !w-12 shrink-0 bg-white/50 shadow-[0_6px_14px_-6px_rgba(0,0,0,.3)] dark:bg-white/10";

  return (
    <Glass
      className="absolute inset-x-[12%] bottom-6 z-10 flex items-center gap-3 rounded-[28px] px-4"
      style={{ height: `calc(${C} * 1.7)` }}
    >
      <IconButton label="Bài trước" onClick={previous} className={navCls}>
        <SkipBack size={22} fill="currentColor" />
      </IconButton>
      <div
        className="relative h-full flex-1"
        style={{
          perspective: `calc(${C} * 5.5)`,
          maskImage: "linear-gradient(to right, transparent 0, #000 16%, #000 84%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 16%, #000 84%, transparent)",
        }}
      >
        {cells.map(({ pos, offset }) => {
          const song = queue[order[pos]];
          const a = Math.abs(offset), now = offset === 0;
          return (
            <button
              key={pos}
              type="button"
              aria-label={now ? `Đang phát: ${song.name}` : song.name}
              aria-current={now || undefined}
              tabIndex={now ? -1 : 0}
              onClick={() => !now && dispatch(playAt(pos))}
              className={`absolute left-1/2 top-1/2 aspect-square rounded-[10px] transition-[transform,filter] duration-[650ms] ease-matcha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 motion-reduce:transition-none ${
                now ? "cursor-default" : "cursor-pointer"
              }`}
              style={{
                width: C,
                marginLeft: `calc(${C} / -2)`,
                marginTop: `calc(${C} / -2)`,
                zIndex: 10 - a,
                transform: `translateX(calc(${C} * ${offset * 0.82})) translateZ(calc(${C} * ${now ? 0.33 : -a * 0.28})) rotateY(${-Math.sign(offset) * Math.min(a, 1) * 40}deg) scale(${now ? 1.12 : 1})`,
                filter: offset < 0 ? "saturate(.45) brightness(.92)" : undefined,
              }}
            >
              <motion.span
                // bìa đang phát bay sang lớp phủ hàng chờ khi mở (cùng layoutId)
                layoutId={now && !showQueue ? "now-cover" : undefined}
                transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                className={`block h-full w-full rounded-[10px] bg-cover bg-center ${
                  now ? "shadow-[0_0_0_3px_rgb(var(--matcha-4)),0_20px_30px_-10px_rgba(0,0,0,.55)]" : "shadow-[0_16px_24px_-10px_rgba(0,0,0,.5)]"
                }`}
                style={{
                  backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : undefined,
                  opacity: now && showQueue ? 0 : 1,
                }}
              />
            </button>
          );
        })}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          className="absolute left-1/2 top-1/2 z-20 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-matcha-4/85 text-white shadow-[0_8px_16px_-4px_rgba(73,115,0,.8)] backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>
      <IconButton label="Bài sau" onClick={next} disabled={atEnd} className={navCls}>
        <SkipForward size={22} fill="currentColor" />
      </IconButton>
    </Glass>
  );
}
