// Dock: băng chuyền bìa quanh bài đang phát (visual-direction-v3.html), hai bên là Shuffle/Hàng chờ và âm lượng
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getIsPlaying, getIsShowQueue, getRepeat } from "../../app/selectors";
import { playAt } from "../../app/slices/playerSlice";
import { Glass, IconButton } from "../../components";
import { useDevice, useScreen } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import { ShuffleQueueButtons, VolumeInline, VolumePopover } from "./DockControls";
import { usePlaybackTime } from "./PlaybackTime";
import { dockWindow } from "./playerMath";

const clamp = (min, v, max) => Math.min(max, Math.max(min, v));

// Số liệu dock theo thiết bị: số bìa hiện, cạnh một bìa (px), chiều cao dock so với bìa, cỡ nút
const DOCK = {
  [DEVICE.MOBILE]: { cells: 1, cover: () => 56, heightRatio: 1.45, navSize: 44, sideSize: 40 },
  [DEVICE.TABLET]: { cells: 5, cover: (w) => clamp(64, w * 0.08, 96), heightRatio: 1.7, navSize: 48, sideSize: 40 },
  [DEVICE.DESKTOP]: { cells: 5, cover: (w) => clamp(80, w * 0.065, 110), heightRatio: 1.7, navSize: 48, sideSize: 40 },
};

// Chiều cao dock (px) để trang tính chỗ còn lại cho đĩa
export function dockHeight(device, width) {
  const layout = DOCK[device];
  return layout.cover(width) * layout.heightRatio;
}

export default function Dock() {
  const device = useDevice();
  const { width } = useScreen();
  const position = useSelector((s) => s.player.position);
  if (position < 0) return null;

  const layout = DOCK[device];
  const cover = layout.cover(width);
  const center = <CoverStrip cells={layout.cells} cover={cover} navSize={layout.navSize} />;

  switch (device) {
    case DEVICE.MOBILE:
      return (
        <DockShell height={cover * layout.heightRatio} gap="gap-1.5" padding="px-2">
          <ShuffleQueueButtons size={layout.sideSize} />
          {center}
          <VolumePopover size={layout.sideSize} />
        </DockShell>
      );
    case DEVICE.TABLET:
    case DEVICE.DESKTOP:
      return (
        <DockShell height={cover * layout.heightRatio} gap="gap-3" padding="px-4">
          <ShuffleQueueButtons size={layout.sideSize} />
          {center}
          <VolumeInline />
        </DockShell>
      );
  }
}

function DockShell({ height, gap, padding, children }) {
  return (
    <Glass className={`flex w-full items-center rounded-[28px] ${gap} ${padding}`} style={{ height }}>
      {children}
    </Glass>
  );
}

// ‹ dải bìa (bìa đang phát + nút phát/dừng nổi giữa) ›
function CoverStrip({ cells: size, cover: C, navSize }) {
  const dispatch = useDispatch();
  const isPlaying = useSelector(getIsPlaying);
  const repeat = useSelector(getRepeat);
  const showQueue = useSelector(getIsShowQueue);
  const { queue, order, position } = useSelector((s) => s.player);
  const { previous, next, togglePlay } = usePlaybackTime();

  const cells = dockWindow(order.length, position, size);
  const atEnd = position === order.length - 1 && repeat !== "all";
  const navCls = "shrink-0 bg-white/50 shadow-[0_6px_14px_-6px_rgba(0,0,0,.3)] dark:bg-white/10";
  // Chỉ một bìa thì không cần làm mờ hai mép
  const fade = size > 1 ? "linear-gradient(to right, transparent 0, #000 16%, #000 84%, transparent)" : undefined;

  return (
    <>
      <IconButton size={navSize} label="Bài trước" onClick={previous} className={navCls}>
        <SkipBack size={22} fill="currentColor" />
      </IconButton>
      <div className="relative h-full min-w-0 flex-1" style={{ perspective: C * 5.5, maskImage: fade, WebkitMaskImage: fade }}>
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
                marginLeft: -C / 2,
                marginTop: -C / 2,
                zIndex: 10 - a,
                transform: `translateX(${C * offset * 0.82}px) translateZ(${C * (now ? 0.33 : -a * 0.28)}px) rotateY(${-Math.sign(offset) * Math.min(a, 1) * 40}deg) scale(${now ? 1.12 : 1})`,
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
      <IconButton size={navSize} label="Bài sau" onClick={next} disabled={atEnd} className={navCls}>
        <SkipForward size={22} fill="currentColor" />
      </IconButton>
    </>
  );
}
