import SongItem from "./SongItem";

const SongList = ({ currentSong, songs, viewMode, onSongSelect }) => {
  if (!songs || songs.length === 0) {
    return null;
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {songs.map((song, index) => (
          <SongItem
            currentSong={currentSong?._id === song._id}
            index={index + 1}
            song={song}
            viewMode={viewMode}
            onSelect={() => onSongSelect?.(index)}
            key={song._id}
          ></SongItem>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
      {songs.map((song, index) => (
        <SongItem
          currentSong={currentSong?._id === song._id}
          song={song}
          viewMode={viewMode}
          onSelect={() => onSongSelect?.(index)}
          key={song._id}
        ></SongItem>
      ))}
    </div>
  );
};

export default SongList;
