import { useState, useEffect, useRef } from "react";
import { Play, Pause, Heart, MoreHorizontal, Clock8 } from "lucide-react";
import PlayingIcon from "./PlayingIcon";
import PlayPauseButton from "./PlayPauseButton";

import formatDuration from "../utils/formatDuration";
import formatDate from "../utils/formatDate";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentSong } from "../app/slices/playerSlice";
import { getCurrentSong, getIsPlaying } from "../app/selectors";

const SongItem = ({ currentSong, song, index, viewMode }) => {
  if (!song) {
    return null;
  }

  const hiddenRef = useRef(null);
  const marqueeRef = useRef(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (marqueeRef.current && hiddenRef.current) {
      const textWidth = marqueeRef.current.scrollWidth;
      const containerWidth = hiddenRef.current.offsetWidth;
      const distance = textWidth + containerWidth;

      const speed = 180; // px/s (tùy chỉnh)
      const dur = distance / speed;
      setDuration(dur);
    }
  }, [song?.name]);

  const isPlaying = useSelector(getIsPlaying);

  switch (viewMode) {
    case "list": {
      return (
        <div
          className={`group flex items-center space-x-4 p-3 rounded-lg hover:bg-background-hover cursor-pointer ${
            currentSong ? "bg-background-hover" : "bg-card"
          }`}
        >
          {/* Index & Controll Play Pause*/}
          <div className="flex items-center justify-center p-4">
            {currentSong ? (
              <PlayingIcon size={24} className="group-hover:opacity-0" />
            ) : (
              <strong className="text-card-foreground text-md group-hover:opacity-0">
                {index}
              </strong>
            )}

            <button className="absolute opacity-0 text-card-foreground group-hover:opacity-100 hover:scale-125">
              {currentSong ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>

          {/* Image Song */}
          <div className="flex-shrink-0 w-12 aspect-thumbnail overflow-hidden rounded">
            <img
              src={song.thumbnail}
              alt={song.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info Song */}
          <div
            ref={hiddenRef}
            className="group flex-shrink-0 w-2/5 flex flex-col overflow-hidden"
          >
            <span
              ref={marqueeRef}
              className={`font-medium text-card-foreground truncate group-hover:overflow-visible group-hover:animation-marquee`}
              style={{ "--marquee-duration": `${duration}s` }}
            >
              {song.name}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {song.artist}
            </span>
          </div>

          {/* Album Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-normal text-card-foreground truncate">
              {formatDate(song.createdAt)}
            </h3>
          </div>

          <div className="flex-1 flex min-w-0 justify-end items-center">
            <button className="text-secondary-foreground hover:text-card-foreground opacity-0 group-hover:opacity-100">
              <Heart size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-3 w-16">
            <span className="text-sm text-card-foreground">
              {formatDuration(song.duration)}
            </span>
            <button className="text-secondary-foreground hover:text-card-foreground opacity-0 group-hover:opacity-100">
              <MoreHorizontal size={24} />
            </button>
          </div>
        </div>
      );
    }
    case "grid": {
      return (
        <div
          key={song.id}
          className="group bg-card rounded-lg p-4 transition-colors cursor-pointer shadow-xl"
          onClick={() => onSongSelect(song)}
        >
          <div className="relative mb-4">
            <img
              src={song.cover}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-lg shadow-lg"
            />
            <PlayPauseButton
              isPlaying={currentSong}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-card-foreground truncate">
              {song.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {song.artist}
            </p>
          </div>
        </div>
      );
    }
  }
};

export default SongItem;
