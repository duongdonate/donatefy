// playerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: [],
  currentPlaylist: null,
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setAllPlaylists(state, action) {
      state.playlists = action.payload;
    },
    setCurrentPlaylist(state, action) {
      state.currentPlaylist = action.payload;
    },
  },
});

export const { setAllPlaylists, setCurrentPlaylist } = playlistSlice.actions;

export default playlistSlice.reducer;
