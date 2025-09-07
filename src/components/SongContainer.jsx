import { div } from "framer-motion/client";
import { useState, useRef } from "react";
import SongList from "./SongList";
import ViewToggle from "./ViewToggle";
import HeaderSongTable from "./HeaderSongTable";
import SongTable from "./SongTable";

function SongContainer({ currentSong, songs }) {
  const [viewMode, setViewMode] = useState("list");

  const handleToggleView = () => {
    setViewMode((prevMode) => (prevMode === "grid" ? "list" : "grid"));
    console.log(viewMode);
  };

  return (
    <div className="flex-1 h-full bg-background rounded-lg px-4 pb-20 flex-row space-y-10 overflow-auto">
      <div className="flex justify-end items-center pt-2">
        <ViewToggle viewMode={viewMode} onToggle={handleToggleView} />
      </div>
      <div className="flex-1 h-[50rem] w-full"></div>
    </div>
  );
}

export default SongContainer;
