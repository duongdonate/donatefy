import React from "react";
import Background from "./components/Background";
import MusicPlayer from "./components/MusicPlayer";

import {
  Home,
  Search,
  Library,
  Mic2,
  List,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";

import "./App.css";

const currentSong = {
  id: 9,
  title: "Sài Gòn Ơi",
  artist: "Obito",
  album: "Đánh đổi",
  cover:
    "https://t2.genius.com/unsafe/319x319/https%3A%2F%2Fimages.genius.com%2F4315a35853c2942b27d955ed3aad71fd.1000x1000x1.jpg",
  url: "https://www.youtube.com/watch?v=qBsiWmEdj0c",
  duration: "3:06",
  genre: "Pop",
  lyrics:
    "Huh, Sài Gòn ơi, sao em lại đối với anh như vậy?\nHuh, Sài Gòn ơi, sao em lại đối với anh như vậy?\nHuh, Sài Gòn ơi, sao em lại đối với anh như vậy?",
};

const isPlaying = false;
const shuffle = false;
const repeat = false;
const muted = false;
const volume = 80; // Volume percentage
const showLyrics = false;
const showQueue = false;

function App() {
  return (
    <div className="relative h-screen w-full border-none">
      <Background />
      <div className="absolute grid grid-cols-[minmax(200px,_250px)_1fr_minmax(250px,_300px)] grid-rows-8 gap-5 h-screen z-10 bg-none">
        {/* Header */}
        <div className="col-span-3 col-start-1 row-start-1">
          <header className="w-screen h-full text-black flex flex-col border-emerald-200 border-2 bg-[#0f2a1d]"></header>
        </div>
        {/* Sidabar */}
        <div className="row-span-5 row-start-2 col-start-1">
          <div className="w-32 text-white flex flex-col h-full glass">
            <nav className="p-4 space-y-2">
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors`}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Home</span>
              </button>

              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors`}
              >
                <Search className="w-6 h-6" />
                <span className="font-medium">Search</span>
              </button>

              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors`}
              >
                <Library className="w-6 h-6" />
                <span className="font-medium">Your Library</span>
              </button>
            </nav>
          </div>
        </div>
        {/* Main Content */}
        <div className="col-start-2 col-span-1 row-span-5 row-start-2">
          <div className="bg-slate-500 w-5/8 h-full"></div>
        </div>
        {/* Queue Area */}
        {/* <div className="col-start-3 col-span-1 row-span-5 row-start-2">
        </div> */}
        {/* Main Player Area */}
        <div className="col-span-3 row-start-7 row-span-2 flex flex-col justify-end flex flex-col justify-end p-2"></div>
      </div>
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        shuffle={shuffle}
        repeat={repeat}
        muted={muted}
        volume={volume}
        showLyrics={showLyrics}
        showQueue={showQueue}
      />
    </div>
  );
}

export default App;
