// Thanh kính phải (phương án C), luôn hiện: Shuffle, Hàng chờ, âm lượng dọc
import { ListMusic, Shuffle, Volume1, Volume2, VolumeX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getIsMuted, getIsShowQueue, getIsShuffle, getVolume } from "../../app/selectors";
import { setVolume, toggleMute, toggleQueue, toggleShuffle } from "../../app/slices/playerSlice";
import { Glass, IconButton } from "../../design";
import VolumeSlider from "./VolumeSlider";

export default function GlassBar() {
  const dispatch = useDispatch();
  const shuffle = useSelector(getIsShuffle);
  const showQueue = useSelector(getIsShowQueue);
  const volume = useSelector(getVolume);
  const muted = useSelector(getIsMuted);
  const shown = muted ? 0 : volume;
  const VolIcon = shown === 0 ? VolumeX : shown < 0.5 ? Volume1 : Volume2;

  return (
    <Glass className="flex w-16 flex-col items-center gap-3 rounded-full py-4">
      <IconButton label="Trộn bài" pressed={shuffle} onClick={() => dispatch(toggleShuffle())}>
        <Shuffle size={20} />
      </IconButton>
      <IconButton
        data-queue-toggle
        label="Hàng chờ"
        pressed={showQueue}
        aria-expanded={showQueue}
        onClick={() => dispatch(toggleQueue())}
      >
        <ListMusic size={20} />
      </IconButton>
      <span className="h-px w-8 bg-ink/15" />
      <IconButton label={muted ? "Bật tiếng" : "Tắt tiếng"} onClick={() => dispatch(toggleMute())}>
        <VolIcon size={20} />
      </IconButton>
      <VolumeSlider value={volume} muted={muted} onChange={(v) => dispatch(setVolume(v))} />
      <b className="text-xs tabular-nums text-matcha-4 dark:text-matcha-1">{muted ? "Tắt" : `${Math.round(shown * 100)}%`}</b>
    </Glass>
  );
}
