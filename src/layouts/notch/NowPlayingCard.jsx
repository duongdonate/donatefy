// Thẻ "đang phát" của notch (tablet / máy tính): bìa trái; tên, ca sĩ, thanh tiến trình, 3 nút bên phải
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentSong } from "../../app/selectors";
import { Vinyl } from "../../components";
import Marquee from "../../components/Marquee";
import { usePlaybackTime } from "../../features/player/PlaybackTime";
import ProgressBar from "../../features/player/ProgressBar";
import PlayerButtons from "./PlayerButtons";

const COVER = 88;

export default function NowPlayingCard() {
  const song = useSelector(getCurrentSong);
  const { currentTime, duration, seek } = usePlaybackTime();
  const navigate = useNavigate();
  if (!song) return null;
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-white/[.06] p-3">
      {song.thumbnail ? (
        <div className="shrink-0 rounded-[14px] bg-cover bg-center" style={{ width: COVER, height: COVER, backgroundImage: `url(${song.thumbnail})` }} />
      ) : (
        <Vinyl size={COVER} spinning={false} style={{ width: COVER, height: COVER }} className="shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => navigate("/listen")} className="block w-full min-w-0 text-left" title="Mở Đang phát">
          <Marquee className="font-bold">{song.name}</Marquee>
          <div className="truncate text-xs text-white/60">{song.artist}</div>
        </button>
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} className="-mt-1" />
        <div className="-mt-1 flex justify-center">
          <PlayerButtons size={36} />
        </div>
      </div>
    </div>
  );
}
