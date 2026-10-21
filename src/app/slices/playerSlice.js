// playerSlice.js
// Redux quyết định "phát bài nào"; ReactPlayer chỉ lo "phát bài đó".
// Thời gian chạy / duration / buffering nằm trong MusicPlayer, không đưa vào đây.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  queue: [], // object bài hát
  order: [], // thứ tự phát (index trong queue), bị xáo khi bật shuffle
  position: -1, // vị trí trong order, -1 = chưa phát gì
  isPlaying: false,
  shuffle: false,
  repeat: "off", // "off" | "all" | "one"
  volume: 1,
  muted: false,
  errorStreak: 0, // số bài lỗi liên tiếp, để không skip vô hạn
  showLyrics: false,
  showQueue: false,
};

// Bài `first` luôn đứng đầu, các bài còn lại được xáo (Fisher–Yates)
const shuffledOrder = (length, first) => {
  const rest = [...Array(length).keys()].filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Bấm Play playlist hoặc bấm 1 bài trong danh sách
    playContext(state, action) {
      const { songs, startIndex = 0 } = action.payload;
      if (!songs?.length) return;
      state.queue = songs;
      state.order = state.shuffle
        ? shuffledOrder(songs.length, startIndex)
        : songs.map((_, i) => i);
      state.position = state.shuffle ? 0 : startIndex;
      state.isPlaying = true;
      state.errorStreak = 0;
    },

    togglePlay(state) {
      if (state.position >= 0) state.isPlaying = !state.isPlaying;
    },
    // Chỉ gọi từ sự kiện onPlay / onPause của ReactPlayer
    setPlaying(state, action) {
      state.isPlaying = action.payload;
      if (action.payload) state.errorStreak = 0;
    },

    next(state) {
      if (state.position < state.order.length - 1) {
        state.position++;
        state.isPlaying = true;
      } else if (state.repeat === "all" && state.order.length > 0) {
        state.position = 0;
        state.isPlaying = true;
      } else {
        state.isPlaying = false; // hết queue: dừng, giữ bài cuối trên thanh player
      }
    },
    previous(state) {
      if (state.position > 0) {
        state.position--;
      } else if (state.repeat === "all" && state.order.length > 0) {
        state.position = state.order.length - 1;
      }
      state.isPlaying = true;
    },
    // Bấm 1 bài trong panel hàng chờ (position = vị trí trong order)
    playAt(state, action) {
      if (action.payload < 0 || action.payload >= state.order.length) return;
      state.position = action.payload;
      state.isPlaying = true;
    },
    // Kéo thả trong panel hàng chờ: payload là thứ tự mới (index trong queue)
    // của các bài sau bài đang phát. Bỏ qua nếu không phải hoán vị của chúng.
    reorderUpNext(state, action) {
      const upNext = state.order.slice(state.position + 1);
      const next = action.payload;
      const same =
        next.length === upNext.length &&
        [...next].sort((a, b) => a - b).join() === [...upNext].sort((a, b) => a - b).join();
      if (!same) return;
      state.order = [...state.order.slice(0, state.position + 1), ...next];
    },
    // Video bị chặn / bị xoá: bỏ qua, nhưng dừng nếu cả queue đều lỗi
    songFailed(state) {
      state.errorStreak++;
      if (state.errorStreak >= state.queue.length) {
        state.isPlaying = false;
        return;
      }
      playerSlice.caseReducers.next(state);
    },

    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
      if (state.position < 0) return;
      const current = state.order[state.position];
      state.order = state.shuffle
        ? shuffledOrder(state.queue.length, current)
        : state.queue.map((_, i) => i);
      state.position = state.shuffle ? 0 : current;
    },
    cycleRepeat(state) {
      state.repeat = { off: "all", all: "one", one: "off" }[state.repeat];
    },

    setVolume(state, action) {
      state.volume = action.payload;
      state.muted = action.payload === 0;
    },
    toggleMute(state) {
      state.muted = !state.muted;
      if (!state.muted && state.volume === 0) state.volume = 0.5;
    },

    toggleLyrics(state) {
      state.showLyrics = !state.showLyrics;
    },
    toggleQueue(state) {
      state.showQueue = !state.showQueue;
    },
  },
});

export const {
  playContext,
  togglePlay,
  setPlaying,
  next,
  previous,
  playAt,
  reorderUpNext,
  songFailed,
  toggleShuffle,
  cycleRepeat,
  setVolume,
  toggleMute,
  toggleLyrics,
  toggleQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
