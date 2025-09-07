import { useState, memo, useCallback } from "react";
import { Mic2, ListMusic, Volume2, VolumeX } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { getIsShowQueue } from "../../app/selectors";
import { toggleQueue } from "../../app/slices/playerSlice";

function AdditionalControls({ volume, onVolumeChange, onToggleVolume }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const dispatch = useDispatch();

  const handleShowQueue = useCallback(() => {
    setShowQueue((prev) => !prev);
    dispatch(toggleQueue());
  }, []);

  return (
    <div className="flex items-center space-x-4 flex-1 justify-end max-w-xs">
      <button
        onClick={() => setShowLyrics(!showLyrics)}
        className={`${
          showLyrics ? "text-primary" : "text-muted-foreground"
        } hover:text-secondary-foreground transition-colors`}
      >
        <Mic2 size={20} />
      </button>

      <button
        onClick={handleShowQueue}
        className={`${
          showQueue ? "text-primary" : "text-muted-foreground"
        } hover:text-secondary-foreground transition-colors`}
      >
        <ListMusic size={20} />
      </button>

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleVolume}
          className="text-secondary-foreground hover:scale-125 transition-all"
        >
          {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={onVolumeChange}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider progress-bar"
          style={{ "--progress": `${volume * 100}%` }}
        />
      </div>
    </div>
  );
}

export default memo(AdditionalControls);
