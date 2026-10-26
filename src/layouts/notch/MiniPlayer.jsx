// Thẻ nhạc mỏng của notch trên điện thoại: tên (chạy chữ) + ca sĩ bên trái, 3 nút bên phải
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentSong } from "../../app/selectors";
import Marquee from "../../components/Marquee";
import PlayerButtons from "./PlayerButtons";

export default function MiniPlayer() {
  const song = useSelector(getCurrentSong);
  const navigate = useNavigate();
  if (!song) return null;
  return (
    <div className="flex h-11 items-center gap-2 pl-2">
      <button type="button" onClick={() => navigate("/listen")} className="min-w-0 flex-1 text-left leading-tight" title="Mở Đang phát">
        <Marquee className="text-sm font-bold">{song.name}</Marquee>
        <div className="truncate text-xs text-white/60">{song.artist}</div>
      </button>
      <PlayerButtons size={40} />
    </div>
  );
}
