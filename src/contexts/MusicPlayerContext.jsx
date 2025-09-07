import { createContext } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import playlistService from "../services/api/playlistService";
import { setAllPlaylists } from "../app/slices/playlistSlice";

export const MusicPlayerContext = createContext();

export const MusicProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data } = await playlistService.getAll();
        console.log("Fetched playlists:", data);

        dispatch(setAllPlaylists(data));
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    fetchPlaylists();
    return () => {};
  }, []);

  return (
    <MusicPlayerContext.Provider value={{}}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
