import { createSelector } from "@reduxjs/toolkit";

export const getCurrentSong = (state) => state.player.currentSong;
export const getIsPlaying = (state) => state.player.isPlaying;
export const currentIndex = (state) => {
  return state.player.queue.findIndex(
    (song) => song.id === state.player.currentSong?.id
  );
};
export const getIsShowQueue = (state) => state.player.showQueue;
