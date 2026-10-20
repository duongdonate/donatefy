import { memo } from "react";
import { Mic2, ListMusic, Volume2, VolumeX } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  getIsShowQueue,
  getIsShowLyrics,
  getVolume,
  getIsMuted,
} from "../../app/selectors";
import {
  toggleQueue,
  toggleLyrics,
  setVolume,
  toggleMute,
} from "../../app/slices/playerSlice";

function AdditionalControls() {
  const showQueue = useSelector(getIsShowQueue);
  const showLyrics = useSelector(getIsShowLyrics);
  const volume = useSelector(getVolume);
  const muted = useSelector(getIsMuted);
  const dispatch = useDispatch();

  const shownVolume = muted ? 0 : volume;

  return (
    <div className="flex items-center space-x-4 flex-1 justify-end max-w-xs">
      <button
        onClick={() => dispatch(toggleLyrics())}
        aria-label="Lyrics"
        aria-pressed={showLyrics}
        className={`${
          showLyrics ? "text-primary" : "text-muted-foreground"
        } hover:text-secondary-foreground transition-colors`}
      >
        <Mic2 size={20} />
      </button>

      <button
        onClick={() => dispatch(toggleQueue())}
        aria-label="Queue"
        aria-pressed={showQueue}
        className={`${
          showQueue ? "text-primary" : "text-muted-foreground"
        } hover:text-secondary-foreground transition-colors`}
      >
        <ListMusic size={20} />
      </button>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => dispatch(toggleMute())}
          aria-label={shownVolume === 0 ? "Unmute" : "Mute"}
          className="text-secondary-foreground hover:scale-125 transition-all"
        >
          {shownVolume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          aria-label="Volume"
          value={shownVolume * 100}
          onChange={(e) => dispatch(setVolume(e.target.value / 100))}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider progress-bar"
          style={{ "--progress": `${shownVolume * 100}%` }}
        />
      </div>
    </div>
  );
}

export default memo(AdditionalControls);
