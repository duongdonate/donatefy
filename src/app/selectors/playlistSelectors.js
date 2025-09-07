import { createSelector } from "reselect";

export const getAllPlaylists = (state) => state.playlist.playlists;

export const getCurrentPlaylist = (state) => state.playlist.currentPlaylist;

export const getPlaylistById = (playId) =>
  createSelector([getAllPlaylists], (playlists) =>
    playlists.find((playlist) => playlist._id === playId)
  );
