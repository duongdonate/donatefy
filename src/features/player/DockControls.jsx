// Hai cụm nút hai bên dock (trước đây ở thanh kính phải): Shuffle + Hàng chờ, và âm lượng
import { ListMusic, Shuffle, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIsMuted, getIsShowQueue, getIsShuffle, getVolume } from "../../app/selectors";
import { setVolume, toggleMute, toggleQueue, toggleShuffle } from "../../app/slices/playerSlice";
import { Glass, IconButton } from "../../components";
import VolumeSlider from "./VolumeSlider";

// showShuffle=false: điện thoại chỉ giữ Hàng chờ cho hai bên dock cân nhau
export function ShuffleQueueButtons({ size = 40, showShuffle = true }) {
  const dispatch = useDispatch();
  const shuffle = useSelector(getIsShuffle);
  const showQueue = useSelector(getIsShowQueue);
  return (
    <div className="flex shrink-0 items-center gap-1">
      {showShuffle && (
        <IconButton size={size} label="Trộn bài" pressed={shuffle} onClick={() => dispatch(toggleShuffle())}>
          <Shuffle size={20} />
        </IconButton>
      )}
      <IconButton
        size={size}
        data-queue-toggle
        label="Hàng chờ"
        pressed={showQueue}
        aria-expanded={showQueue}
        onClick={() => dispatch(toggleQueue())}
      >
        <ListMusic size={20} />
      </IconButton>
    </div>
  );
}

function useVolume() {
  const dispatch = useDispatch();
  const volume = useSelector(getVolume);
  const muted = useSelector(getIsMuted);
  const shown = muted ? 0 : volume;
  return {
    volume,
    muted,
    percentText: muted ? "Tắt" : `${Math.round(shown * 100)}%`,
    Icon: shown === 0 ? VolumeX : shown < 0.5 ? Volume1 : Volume2,
    toggleMute: () => dispatch(toggleMute()),
    change: (v) => dispatch(setVolume(v)),
  };
}

// Desktop / tablet: loa + thanh ngang + phần trăm nằm ngay trong dock
export function VolumeInline({ sliderWidth = 120 }) {
  const v = useVolume();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <IconButton label={v.muted ? "Bật tiếng" : "Tắt tiếng"} onClick={v.toggleMute}>
        <v.Icon size={20} />
      </IconButton>
      <VolumeSlider value={v.volume} muted={v.muted} onChange={v.change} width={sliderWidth} />
      <b className="w-9 text-right text-xs tabular-nums text-matcha-4 dark:text-matcha-1">{v.percentText}</b>
    </div>
  );
}

// Mobile: chỉ nút loa; bấm thì bung viên kính có thanh ngang ngay trên dock
export function VolumePopover({ size = 44 }) {
  const v = useVolume();
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <IconButton size={size} label="Âm lượng" pressed={open} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <v.Icon size={20} />
      </IconButton>
      {open && (
        <Glass className="absolute bottom-[calc(100%+12px)] right-0 flex items-center gap-2 rounded-full px-3 py-1.5">
          <IconButton size={size} label={v.muted ? "Bật tiếng" : "Tắt tiếng"} onClick={v.toggleMute}>
            <v.Icon size={20} />
          </IconButton>
          <VolumeSlider value={v.volume} muted={v.muted} onChange={v.change} width={150} height={44} />
          <b className="w-9 text-right text-xs tabular-nums text-matcha-4 dark:text-matcha-1">{v.percentText}</b>
        </Glass>
      )}
    </div>
  );
}
