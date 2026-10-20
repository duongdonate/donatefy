import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import {
  getPlaylistById,
  getCurrentPlaylist,
  getCurrentSong,
} from "../app/selectors";
import Container from "../components/Container";
import SongTable from "../components/SongTable";
import PlayListDetail from "../components/PlaylistDetail";

import songService from "../services/api/songService";
import { setCurrentPlaylist } from "../app/slices/playlistSlice";
import { playContext, togglePlay } from "../app/slices/playerSlice";

function PlayListPage() {
  const { id } = useParams();
  const playlist = useSelector(getPlaylistById(id));
  const currentPlaylist = useSelector(getCurrentPlaylist);
  const currentSong = useSelector(getCurrentSong);
  const dispatch = useDispatch();

  const [songs, setSongs] = useState([]);
  const playlistRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data } = await songService.getSongs(id);
        setSongs(data);
      } catch (error) {
        console.error("Failed to fetch songs", error);
      }
    };

    if (playlist) {
      fetchSongs();
    }

    if (playlistRef.current) {
      playlistRef.current.scrollTo({
        top: 0,
        behavior: "auto", // cho mượt
      });
    }
  }, [playlist]);

  // Early return phải nằm sau mọi hook, nếu không React crash (#300)
  if (!playlist || !id) {
    return <Navigate to="/" replace />;
  }

  const isCurrentContext = currentPlaylist?._id === playlist._id;

  const playFrom = (startIndex) => {
    // Bấm lại đúng bài đang phát của playlist này thì chỉ play/pause
    if (isCurrentContext && currentSong?._id === songs[startIndex]?._id) {
      dispatch(togglePlay());
      return;
    }
    dispatch(setCurrentPlaylist(playlist));
    dispatch(playContext({ songs, startIndex }));
  };

  const handlePlayPlaylist = () => {
    if (isCurrentContext && currentSong) {
      dispatch(togglePlay());
    } else {
      playFrom(0);
    }
  };

  return (
    <Container ref={playlistRef}>
      <PlayListDetail playlist={playlist} onPlayPlaylist={handlePlayPlaylist} />
      <SongTable songs={songs} onSongSelect={playFrom} />
    </Container>
  );
}

export default PlayListPage;
