import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MusicProvider } from "./contexts/MusicPlayerContext";
import { PopupProvider } from "./contexts/PopupContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Provider as ReduxProvider } from "react-redux";
import store from "./app/store";
import MusicPlayer from "./components/MusicPlayer";
import App from "./App";

// Mock data for current song and music player state
import { currentSong } from "./mock";

const shuffle = false;
const repeat = false;
const showLyrics = false;
const showQueue = false;

createRoot(document.getElementById("root")).render(
  <ReduxProvider store={store}>
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <PopupProvider>
            <MusicProvider>
              <App />
              <MusicPlayer
                shuffle={shuffle}
                repeat={repeat}
                showLyrics={showLyrics}
                showQueue={showQueue}
              />
            </MusicProvider>
          </PopupProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </ReduxProvider>
);
