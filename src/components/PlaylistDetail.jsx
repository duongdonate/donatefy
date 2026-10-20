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
import { useAuth } from "../contexts/AuthContext";

function PlayListDetail({ playlist, onPlayPlaylist }) {
  const nevigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const { user } = useAuth();

  const currentPlaylist = useSelector(getCurrentPlaylist);
  const isPlayingGlobal = useSelector(getIsPlaying);
  const dispatch = useDispatch();

  const isPlaying =
    isPlayingGlobal && !!playlist && currentPlaylist?._id === playlist._id;

  const handleDeletePlaylist = async () => {
    const userConfirm = await confirm(
      "Bạn có chắc chắn muốn xóa playlist này?"
    );
    if (!userConfirm) return;
    // Gọi API trước, thành công mới xoá khỏi store để UI không lệch với server
    try {
      await playlistService.delete(playlist._id);
      dispatch(removePlaylist(playlist._id));
      showToast("Đã xoá playlist");
      nevigate("/");
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      showToast("Xoá playlist thất bại, thử lại sau");
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
            Made by
          </span>
          {/* Playlist chưa có field owner; hiện tại chỉ hiển thị playlist của chính user */}
          <span className="font-bold text-lg text-primary text-left">
            {user?.username}
          </span>
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
        aria-label="Xoá playlist"
        className="absolute top-5 right-5 rounded-full w-10 h-10 p-2 bg-destructive text-destructive-foreground flex justify-center items-center opacity-30 hover:opacity-100 transition-opacity"
      >
        <Trash2 size={24} />
      </button>
    </div>
  );
}

export default PlayListDetail;
