// ‹‹ ▶/❚❚ ›› dùng chung cho thẻ đang phát và thẻ nhạc mỏng
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useSelector } from "react-redux";
import { getIsPlaying } from "../../app/selectors";
import { IconButton } from "../../components";
import { usePlaybackTime } from "../../features/player/PlaybackTime";

const onDark = "!text-[#eef3e6] hover:!bg-white/10";

export default function PlayerButtons({ size = 40 }) {
  const isPlaying = useSelector(getIsPlaying);
  const { previous, next, togglePlay } = usePlaybackTime();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <IconButton size={size} label="Bài trước" onClick={previous} className={onDark}>
        <SkipBack size={18} fill="currentColor" />
      </IconButton>
      <IconButton size={size + 4} label={isPlaying ? "Tạm dừng" : "Phát"} onClick={togglePlay} className="!bg-white/15 !text-white hover:!bg-white/25">
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
      </IconButton>
      <IconButton size={size} label="Bài sau" onClick={next} className={onDark}>
        <SkipForward size={18} fill="currentColor" />
      </IconButton>
    </div>
  );
}
