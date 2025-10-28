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
    addPlaylist(state, action) {
      state.playlists.push(action.payload);
    },
    removePlaylist(state, action) {
      state.playlists = state.playlists.filter(
        (playlist) => playlist._id !== action.payload
      );
    },
  },
});

export const {
  setAllPlaylists,
  setCurrentPlaylist,
  addPlaylist,
  removePlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;
