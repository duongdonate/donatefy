// Thẻ "đang phát" của notch (tablet / máy tính), cùng khuôn với thẻ tài khoản (cao 76px):
// bìa 52px (bằng avatar) | tên, ca sĩ, thanh tiến trình mỏng | 3 nút
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentSong } from "../../app/selectors";
import { Vinyl } from "../../components";
import Marquee from "../../components/Marquee";
import { usePlaybackTime } from "../../features/player/PlaybackTime";
import ProgressBar from "../../features/player/ProgressBar";
import PlayerButtons from "./PlayerButtons";

const COVER = 52; // = Avatar trong thẻ tài khoản

export default function NowPlayingCard() {
  const song = useSelector(getCurrentSong);
  const { currentTime, duration, seek } = usePlaybackTime();
  const navigate = useNavigate();
  if (!song) return null;
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-white/[.06] p-3">
      {song.thumbnail ? (
        <div className="shrink-0 rounded-[12px] bg-cover bg-center" style={{ width: COVER, height: COVER, backgroundImage: `url(${song.thumbnail})` }} />
      ) : (
        <Vinyl size={COVER} spinning={false} style={{ width: COVER, height: COVER }} />
      )}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => navigate("/listen")} className="block w-full min-w-0 text-left leading-tight" title="Mở Đang phát">
          <Marquee className="font-bold">{song.name}</Marquee>
          <div className="truncate text-xs text-white/60">{song.artist}</div>
        </button>
        <ProgressBar compact currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>
      <PlayerButtons size={36} />
    </div>
  );
}
