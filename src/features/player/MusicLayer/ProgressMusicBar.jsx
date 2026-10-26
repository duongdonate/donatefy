import formatDuration from "../../../utils/formatDuration";
import { motion } from "framer-motion";

function ProgressMusicBar({
  currentTime = 0,
  duration = 0,
  progress = 0,
  onProgressChange,
}) {
  return (
    <div className="absolute top-0 left-0 right-0 items-center w-full">
      {/* Duration Pane */}
      <div className="absolute bg-background -top-10 px-3 pb-2 pt-3 flex-1 w-full flex items-baseline justify-between mask-to-b backdrop-blur-lg opacity-0 group-hover:opacity-90 transition-opacity duration-500">
        <span className="text-sm font-semibold brightness-150 text-foreground w-10 text-right">
          {formatDuration(currentTime)}
        </span>
        <span className="text-sm font-semibold text-pretty brightness-150 text-foreground w-10">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="flex flex-1 w-full">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={onProgressChange}
          className="h-1 w-full rounded-lg appearance-none cursor-pointer slider progress-bar"
          style={{ "--progress": `${progress}%` }}
        />
        {/* <motion.div
          className="absolute top-0 left-0 h-1 bg-primary rounded w-full group-hover:opacity-0"
          animate={{ width: `${(progress / duration) * 100}%` }}
          transition={{ ease: "easeInOut", duration: 0.25 }}
        /> */}
      </div>
    </div>
  );
}

export default ProgressMusicBar;
