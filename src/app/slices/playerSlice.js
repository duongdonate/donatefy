// playerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPlaying: false,
  shuffle: false,
  repeat: false,
  showLyrics: false,
  showQueue: false,
  currentSong: null,
  queue: [],
  queueShuffeled: [],
  volume: 1,
  muted: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Toggle play/pause
    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },

    // Shuffle & Repeat
    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
    },
    toggleRepeat(state) {
      state.repeat = !state.repeat;
    },

    // UI toggles
    toggleLyrics(state) {
      state.showLyrics = !state.showLyrics;
    },
    toggleQueue(state) {
      state.showQueue = !state.showQueue;
    },

    // Queue handling
    setQueue(state, action) {
      state.queue = action.payload;
    },
    setQueueShuffled(state, action) {
      state.queueShuffeled = action.payload;
    },

    // Current song
    setCurrentSong(state, action) {
      state.currentSong = action.payload;
      state.isPlaying = true; // auto play khi chọn bài
    },

    // Volume & Mute
    setVolume(state, action) {
      state.volume = action.payload;
    },
    toggleMute(state) {
      state.muted = !state.muted;
    },
    nextSong(state) {
      const currentIndex = state.queue.findIndex(
        (song) => song.id === state.currentSong.id
      );
      if (currentIndex !== -1 && currentIndex < state.queue.length - 1) {
        state.currentSong = state.queue[currentIndex + 1];
        state.isPlaying = true;
      }
    },
    previousSong(state) {
      const currentIndex = state.queue.findIndex(
        (song) => song.id === state.currentSong.id
      );
      if (currentIndex > 0) {
        state.currentSong = state.queue[currentIndex - 1];
        state.isPlaying = true;
      }
    },
  },
});

export const {
  togglePlay,
  toggleShuffle,
  toggleRepeat,
  toggleLyrics,
  toggleQueue,
  setQueue,
  setQueueShuffled,
  setCurrentSong,
  setVolume,
  toggleMute,
  nextSong,
  previousSong,
} = playerSlice.actions;

export default playerSlice.reducer;
