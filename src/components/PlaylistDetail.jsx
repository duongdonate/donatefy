import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PlayPauseButton from "./PlayPauseButton";
import { Trash2 } from "lucide-react";

import { useSelector } from "react-redux";
import { getCurrentPlaylist, getIsPlaying } from "../app/selectors";
import { useDispatch } from "react-redux";
import { removePlaylist } from "../app/slices/playlistSlice";
import playlistService from "../services/api/playlistService";

import useConfirm from "../hooks/useConfirm";
import useToast from "../hooks/useToast";
import { useNavigate } from "react-router-dom";

function PlayListDetail({ playlist, onPlayPlaylist }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const nevigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const currentPlaylist = useSelector(getCurrentPlaylist);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentPlaylist || currentPlaylist?._id !== playlist?._id) {
      setIsPlaying(false);
    }

    if (currentPlaylist?._id === playlist?._id) {
      setIsPlaying(true);
    }
  }, [currentPlaylist, playlist]);

  const handleDeletePlaylist = async () => {
    const userConfirm = await confirm(
      "Bạn có chắc chắn muốn xóa playlist này?"
    );
    if (userConfirm) {
      dispatch(removePlaylist(playlist._id));
      const { message } = await playlistService.delete(playlist._id);
      nevigate("/");
      showToast(message);
    }
  };

  if (!playlist) {
    return null;
  }

  return (
    <div className="relative w-full h-max flex justify-start items-start px-10 py-5 space-x-5 rounded-lg">
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
        {playlist.videos.length > 0 && (
          <PlayPauseButton isPlaying={isPlaying} onClick={onPlayPlaylist} />
        )}
      </div>
      <button
        onClick={handleDeletePlaylist}
        className="absolute top-5 right-5 rounded-full w-10 h-10 p-2 bg-destructive text-destructive-foreground flex justify-center items-center opacity-30 hover:opacity-100 transition-opacity"
      >
        <Trash2 size={24} />
      </button>
    </div>
  );
}

export default PlayListDetail;
