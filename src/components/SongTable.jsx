import { useEffect, useState } from "react";
import SongList from "./SongList";
import HeaderSongTable from "./HeaderSongTable";
import { useSelector } from "react-redux";
import { getCurrentSong } from "../app/selectors";

function SongTable({ songs }) {
  const currentSong = useSelector(getCurrentSong);

  return (
    <div className="pb-20 px-2 relative">
      <HeaderSongTable />
      <SongList songs={songs} viewMode="list" currentSong={currentSong} />
    </div>
  );
}

export default SongTable;
