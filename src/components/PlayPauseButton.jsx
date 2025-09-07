import { Play, Pause } from "lucide-react";

function PlayPauseButton({ className, isPlaying, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:scale-125 transition-transform ${className}`}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
    </button>
  );
}

export default PlayPauseButton;
