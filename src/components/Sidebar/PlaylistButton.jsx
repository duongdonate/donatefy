import { Link } from "react-router-dom";

function PlaylistButton({ isExpanded, playlist, onClick }) {
  return (
    <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-foreground hover:bg-background-hover transition-colors">
      <img
        src={playlist.cover}
        alt={playlist.name}
        className="w-10 aspect-square rounded object-cover"
      />
      <span className="flex-1 min-w-0">
        {isExpanded && (
          <>
            <p className="font-medium text-foreground shrink-0 truncate">
              {playlist.name}
            </p>
            <p className="text-sm font-semibold shrink-0 text-secondary truncate">
              {playlist.videos.length} songs
            </p>
          </>
        )}
      </span>
    </button>
  );
}

export default PlaylistButton;
