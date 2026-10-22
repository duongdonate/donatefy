import { Maximize2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentSong } from "../../app/selectors";
import { usePlaybackTime } from "../../features/player/PlaybackTime";

import ProgressMusicBar from "./ProgressMusicBar";
import ControlPlayer from "./ControlPlayer";
import AdditionalControls from "./AdditionalControls";
import Marquee from "../Marquee";

// Music Layer: thanh phát dính đáy. Chỉ là giao diện; việc phát nằm ở PlayerEngine.
const MusicPlayer = () => {
  const currentSong = useSelector(getCurrentSong);
  const { currentTime, duration, seek, previous, next, togglePlay } = usePlaybackTime();
  const navigate = useNavigate();

  if (!currentSong) return null;

  const handleProgressChange = (e) => {
    if (duration) seek((e.target.value / 100) * duration);
  };

  return (
    <div className="group fixed bottom-0 left-0 right-0 min-w-screen min-h-2 max-h-28 px-6 py-4 shadow-2xl glass backdrop-blur-md z-40">
      <ProgressMusicBar
        currentTime={currentTime}
        duration={duration}
        progress={duration ? (currentTime / duration) * 100 : 0}
        onProgressChange={handleProgressChange}
      />

      <div className="flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0 max-w-xs">
          <div className="w-16 aspect-thumbnail overflow-hidden rounded shadow-lg">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            {/* Giống thanh Now Playing của Spotify: tên dài thì luôn chạy */}
            <Marquee className="font-medium text-foreground text-lg">
              {currentSong.name}
            </Marquee>
            <Marquee className="text-sm text-muted-foreground">
              {currentSong.artist}
            </Marquee>
          </div>
        </div>

        <ControlPlayer onPlayPause={togglePlay} onNext={next} onPrevious={previous} />

        <div className="flex flex-1 max-w-xs items-center justify-end space-x-4">
          <AdditionalControls />
          {/* Mở rộng Music Layer thành trang Now Playing */}
          <button
            onClick={() => navigate("/listen")}
            aria-label="Mở Now Playing"
            title="Mở Now Playing"
            className="text-muted-foreground hover:text-secondary-foreground transition-colors"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
