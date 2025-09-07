import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Mic2,
} from "lucide-react";
import { memo, useState } from "react";

import { useSelector } from "react-redux";
import { getIsPlaying } from "../../app/selectors";

function ControlPlayer({
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
}) {
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const isPlaying = useSelector(getIsPlaying);

  return (
    <div className="flex flex-col items-center space-y-3 flex-1 max-w-2xl">
      <div className="flex items-center space-x-6">
        <button
          onClick={onShuffle}
          className={`${
            shuffle ? "text-primary" : "text-muted-foreground"
          } hover:scale-125 transition-all`}
        >
          <Shuffle size={20} />
        </button>

        <button
          onClick={onPrevious}
          className="text-muted-foreground hover:text-secondary-foreground hover:scale-125 transition-all"
        >
          <SkipBack size={28} />
        </button>

        <button
          onClick={onPlayPause}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-125 transition-transform shadow-lg"
        >
          {isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} className="ml-1" />
          )}
        </button>

        <button
          onClick={onNext}
          className="text-muted-foreground hover:text-secondary-foreground hover:scale-125 transition-all"
        >
          <SkipForward size={28} />
        </button>

        <button
          onClick={onRepeat}
          className={`${
            repeat ? "text-primary" : "text-muted-foreground"
          } hover:scale-125 transition-all`}
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* Progress Bar */}
    </div>
  );
}

export default memo(ControlPlayer);
