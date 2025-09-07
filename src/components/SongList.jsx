import { useState, useEffect } from "react";
import SongItem from "./SongItem";

import songService from "../services/api/songService";

const SongList = ({ currentSong, songs, viewMode }) => {
  if (!songs || songs.length === 0) {
    return null;
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {songs.map((song, index) => (
          <SongItem
            currentSong={currentSong?.id === song.id}
            index={index + 1}
            song={song}
            viewMode={viewMode}
            key={song.id}
          ></SongItem>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {songIds.map((songId) => (
        <SongItem
          currentSong={currentSong?.id === songId}
          songId={songId}
          viewMode={viewMode}
          key={songId}
        ></SongItem>
      ))}
    </div>
  );
};

export default SongList;
