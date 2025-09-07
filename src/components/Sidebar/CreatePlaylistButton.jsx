import { Plus } from "lucide-react";
import usePopup from "../../hooks/usePopup";
import CreatePlaylistCard from "../Card/CreatePlaylistCard";

function CreatePlaylistButton({ isExpanded }) {
  const { openPopup } = usePopup();

  const handleOpenCreatePlaylist = () => {
    openPopup(<CreatePlaylistCard />);
  };

  return (
    <button
      onClick={handleOpenCreatePlaylist}
      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-white
        hover:bg-background-hover transition-colors"
    >
      <div
        key={"iconCreatePlaylist"}
        className="w-10 aspect-square bg-gray-600 rounded flex items-center justify-center shrink-0"
      >
        <Plus size={16} />
      </div>
      {isExpanded && (
        <span className="text-foreground font-medium shrink-0">
          Create Playlist
        </span>
      )}
    </button>
  );
}

export default CreatePlaylistButton;
