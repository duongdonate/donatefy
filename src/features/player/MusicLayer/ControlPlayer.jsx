import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle } from "lucide-react";
import { memo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { getIsPlaying, getIsShuffle, getRepeat } from "../../../app/selectors";
import { toggleShuffle, cycleRepeat } from "../../../app/slices/playerSlice";

function ControlPlayer({ onPlayPause, onNext, onPrevious }) {
  const isPlaying = useSelector(getIsPlaying);
  const shuffle = useSelector(getIsShuffle);
  const repeat = useSelector(getRepeat);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center space-y-3 flex-1 max-w-2xl">
      <div className="flex items-center space-x-6">
        <button
          onClick={() => dispatch(toggleShuffle())}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          className={`${
            shuffle ? "text-primary" : "text-muted-foreground"
          } hover:scale-125 transition-all`}
        >
          <Shuffle size={20} />
        </button>

        <button
          onClick={onPrevious}
          aria-label="Previous"
          className="text-muted-foreground hover:text-secondary-foreground hover:scale-125 transition-all"
        >
          <SkipBack size={28} />
        </button>

        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-125 transition-transform shadow-lg"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        <button
          onClick={onNext}
          aria-label="Next"
          className="text-muted-foreground hover:text-secondary-foreground hover:scale-125 transition-all"
        >
          <SkipForward size={28} />
        </button>

        <button
          onClick={() => dispatch(cycleRepeat())}
          aria-label={`Repeat: ${repeat}`}
          className={`${
            repeat !== "off" ? "text-primary" : "text-muted-foreground"
          } hover:scale-125 transition-all`}
        >
          {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>
    </div>
  );
}

export default memo(ControlPlayer);
