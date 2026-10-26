import { Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentSong, getIsPlaying } from "../../../app/selectors";
import { useDevice } from "../../../contexts/DeviceContext";
import { DEVICE } from "../../../utils/device";
import { usePlaybackTime } from "../PlaybackTime";

import ProgressMusicBar from "./ProgressMusicBar";
import ControlPlayer from "./ControlPlayer";
import AdditionalControls from "./AdditionalControls";
import Marquee from "../../../components/Marquee";
import { IconButton } from "../../../components";

// Music Layer: thanh phát dính đáy. Chỉ là giao diện; việc phát nằm ở PlayerEngine.
// Tạm giữ tới đợt notch (sẽ gộp vào notch). Mobile: bản rút gọn; máy lớn: căn khung 1280px.
const MusicLayer = () => {
  const device = useDevice();
  const currentSong = useSelector(getCurrentSong);

  if (!currentSong) return null;

  switch (device) {
    case DEVICE.MOBILE:
      return <MusicLayerMobile song={currentSong} />;
    case DEVICE.TABLET:
    case DEVICE.DESKTOP:
      return <MusicLayerWide song={currentSong} />;
  }
};

function OpenNowPlaying({ size = 20 }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/listen")}
      aria-label="Mở Now Playing"
      title="Mở Now Playing"
      className="grid h-11 w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-secondary-foreground"
    >
      <Maximize2 size={size} />
    </button>
  );
}

function MusicLayerWide({ song }) {
  const { currentTime, duration, seek, previous, next, togglePlay } = usePlaybackTime();
  const handleProgressChange = (e) => {
    if (duration) seek((e.target.value / 100) * duration);
  };

  return (
    <div className="group fixed bottom-0 left-0 right-0 z-40 max-h-28 min-h-2 shadow-2xl glass backdrop-blur-md">
      <div className="mx-auto max-w-[1280px] px-6 py-4">
        <ProgressMusicBar
          currentTime={currentTime}
          duration={duration}
          progress={duration ? (currentTime / duration) * 100 : 0}
          onProgressChange={handleProgressChange}
        />

        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex min-w-0 max-w-xs flex-1 items-center space-x-4">
            <div className="aspect-thumbnail w-16 overflow-hidden rounded shadow-lg">
              <img src={song.thumbnail} alt={song.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              {/* Giống thanh Now Playing của Spotify: tên dài thì luôn chạy */}
              <Marquee className="text-lg font-medium text-foreground">{song.name}</Marquee>
              <Marquee className="text-sm text-muted-foreground">{song.artist}</Marquee>
            </div>
          </div>

          <ControlPlayer onPlayPause={togglePlay} onNext={next} onPrevious={previous} />

          <div className="flex max-w-xs flex-1 items-center justify-end space-x-4">
            <AdditionalControls />
            {/* Mở rộng Music Layer thành trang Now Playing */}
            <OpenNowPlaying />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile: bìa, tên chạy chữ, ‹ ▶ ›, nút mở Now Playing; thanh chạy mảnh ở mép trên
function MusicLayerMobile({ song }) {
  const isPlaying = useSelector(getIsPlaying);
  const { currentTime, duration, previous, next, togglePlay } = usePlaybackTime();
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 shadow-2xl glass backdrop-blur-md">
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-matcha-4 dark:bg-matcha-1" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <img src={song.thumbnail} alt="" className="h-11 w-11 shrink-0 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <Marquee className="text-sm font-semibold text-foreground">{song.name}</Marquee>
          <div className="truncate text-xs text-muted-foreground">{song.artist}</div>
        </div>
        <IconButton size={44} label="Bài trước" onClick={previous}>
          <SkipBack size={20} fill="currentColor" />
        </IconButton>
        <IconButton size={44} label={isPlaying ? "Tạm dừng" : "Phát"} onClick={togglePlay}>
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </IconButton>
        <IconButton size={44} label="Bài sau" onClick={next}>
          <SkipForward size={20} fill="currentColor" />
        </IconButton>
        <OpenNowPlaying size={18} />
      </div>
    </div>
  );
}

export default MusicLayer;
