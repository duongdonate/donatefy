import { createContext } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import playlistService from "../services/api/playlistService";
import { setAllPlaylists } from "../app/slices/playlistSlice";

export const MusicPlayerContext = createContext();

export const MusicProvider = ({ children }) => {
  return (
    <MusicPlayerContext.Provider value={{}}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
