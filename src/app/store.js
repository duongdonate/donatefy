import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice";
import playlistReducer from "./slices/playlistSlice";

const store = configureStore({
  reducer: {
    player: playerReducer,
    playlist: playlistReducer,
  },
});

export default store;
