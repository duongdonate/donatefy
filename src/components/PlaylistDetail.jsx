import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PlayPauseButton from "./PlayPauseButton";

import { useSelector } from "react-redux";
import { getCurrentPlaylist, getIsPlaying } from "../app/selectors";

function PlayListDetail({ playlist, onPlayPlaylist }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPlaylist = useSelector(getCurrentPlaylist);

  useEffect(() => {
    if (!currentPlaylist || currentPlaylist?._id !== playlist?._id) {
      setIsPlaying(false);
    }

    if (currentPlaylist?._id === playlist?._id) {
      setIsPlaying(true);
    }
  }, [currentPlaylist, playlist]);

  if (!playlist) {
    return null;
  }

  return (
    <div className="w-full h-max flex justify-start items-center px-10 py-5 space-x-5 bg-transparent backdrop-blur-md rounded-lg">
      <img
        src={playlist.cover}
        alt={playlist.name}
        className="w-44 h-44 rounded-lg shadow-2xl object-cover object-center"
      />
      <div className="w-full flex flex-col space-y-2 justify-center items-start">
        <span className="font-semibold text-4xl text-foreground text-left">
          {playlist.name}
        </span>
        <div className="flex space-x-2 justify-start items-baseline">
          <span className="font-thin text-md text-muted-foreground">
            Make by
          </span>
          <Link
            to="/duongdonate"
            className="font-bold text-lg text-primary text-left hover:underline"
          >
            Hai Duong
          </Link>
        </div>
        <span className="font-thin text-2xl text-secondary-foreground text-left">
          {playlist.videos.length} songs
        </span>
        <PlayPauseButton isPlaying={isPlaying} onClick={onPlayPlaylist} />
      </div>
    </div>
  );
}

export default PlayListDetail;
