import { useSelector } from "react-redux";
import { getIsPlaying } from "../app/selectors";

function PlayingIcon({ size = 16, className = "" }) {
  const isPlaying = useSelector(getIsPlaying);

  return (
    <div
      className={`${!isPlaying ? "pause" : ""} music-bars ${className}`}
      style={{ "--music-bars-height": `${size}px` }}
    >
      <div className="music-bar"></div>
      <div className="music-bar"></div>
      <div className="music-bar"></div>
      <div className="music-bar"></div>
    </div>
  );
}

export default PlayingIcon;
