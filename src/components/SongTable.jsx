import { useState } from "react";
import SongList from "./SongList";
import HeaderSongTable from "./HeaderSongTable";
import ViewToggle from "./ViewToggle";
import { useSelector } from "react-redux";
import { getCurrentSong } from "../app/selectors";

function SongTable({ songs, onSongSelect }) {
  const currentSong = useSelector(getCurrentSong);
  const [viewMode, setViewMode] = useState("list");

  if (songs.length == 0) {
    return (
      <div className="py-20 px-2">
        <h1 className="text-2xl text-muted-foreground font-semibold text-center">
          Chưa có bài hát để hiển thị
        </h1>
      </div>
    );
  }

  return (
    <div className="pb-20 px-2 relative">
      <div className="flex justify-end px-3">
        <ViewToggle
          viewMode={viewMode}
          onToggle={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
        />
      </div>
      {viewMode === "list" && <HeaderSongTable />}
      <SongList
        songs={songs}
        viewMode={viewMode}
        currentSong={currentSong}
        onSongSelect={onSongSelect}
      />
    </div>
  );
}

export default SongTable;
