import { useState } from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import PlayingIcon from "./PlayingIcon";
import PlayPauseButton from "./PlayPauseButton";
import Marquee from "./Marquee";

import formatDuration from "../utils/formatDuration";
import formatDate from "../utils/formatDate";
import { useSelector } from "react-redux";
import { getIsPlaying } from "../app/selectors";

const SongItem = ({ currentSong, song, index, viewMode, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const isPlaying = useSelector(getIsPlaying);

  // Sau mọi hook, tránh lỗi "Rendered fewer hooks" (#300)
  if (!song) {
    return null;
  }

  switch (viewMode) {
    case "list": {
      return (
        <div
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
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

            <button
              aria-label={currentSong && isPlaying ? "Pause" : "Play"}
              className="absolute opacity-0 text-card-foreground group-hover:opacity-100 hover:scale-125"
            >
              {currentSong && isPlaying ? <Pause size={24} /> : <Play size={24} />}
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
          <div className="flex-shrink-0 w-2/5 flex flex-col overflow-hidden">
            {/* Giống Spotify: tên dài chỉ chạy khi hover dòng */}
            <Marquee active={hovered} instant className="font-medium text-card-foreground">
              {song.name}
            </Marquee>
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
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`group rounded-lg p-4 transition-colors cursor-pointer shadow-xl hover:bg-background-hover ${
            currentSong ? "bg-background-hover" : "bg-card"
          }`}
        >
          <div className="relative mb-4">
            <img
              src={song.thumbnail}
              alt={song.name}
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
            {/* Click nổi bọt lên card (onSelect), nút chỉ để hiển thị trạng thái */}
            <PlayPauseButton
              isPlaying={currentSong && isPlaying}
              className={`absolute bottom-2 right-2 transform transition-all duration-300 ${
                currentSong
                  ? "opacity-100"
                  : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
              }`}
            />
          </div>

          <div className="space-y-1">
            <Marquee active={hovered} instant className="font-medium text-card-foreground">
              {song.name}
            </Marquee>
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
