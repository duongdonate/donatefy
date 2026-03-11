import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { getPlaylistById, getCurrentPlaylist } from "../app/selectors";
import Container from "../components/Container";
import SongTable from "../components/SongTable";
import PlayListDetail from "../components/PlaylistDetail";

import songService from "../services/api/songService";
import { setCurrentPlaylist } from "../app/slices/playlistSlice";
import { setCurrentSong, setQueue } from "../app/slices/playerSlice";

function PlayListPage() {
  const { id } = useParams();
  const playlist = useSelector(getPlaylistById(id));
  const currentPlaylist = useSelector(getCurrentPlaylist);

  const [songs, setSongs] = useState([]);
  const playlistRef = useRef(null);

  if (!playlist || !id) {
    return <Navigate to="/" replace />;
  }

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

  const dispatch = useDispatch();

  const handlePlayPlaylist = () => {
    dispatch(setCurrentPlaylist(playlist));
    dispatch(setQueue(songs));
    dispatch(setCurrentSong(songs[0]));
  };

  return (
    <Container ref={playlistRef}>
      <PlayListDetail playlist={playlist} onPlayPlaylist={handlePlayPlaylist} />
      <SongTable songs={songs} />
    </Container>
  );
}

export default PlayListPage;
