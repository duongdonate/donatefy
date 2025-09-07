import { useState } from "react";
import { ToastProvider } from "./contexts/ToastContext";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle.jsx";
import MusicPlayer from "./components/MusicPlayer.jsx";
import { SearchBar, SearchBarWithDropdown } from "./components/SearchBar";
import { Loader } from "./components/Loader";
import useToast from "./hooks/useToast.jsx";
import "./App.css";
import "./index.css";

import { Sidebar } from "./components/Sidebar";
import { mockSongs, mockPlaylists, artistNames } from "./mock.js";

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

function DemoButton() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);

  function toUnaccented(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim();
  }

  const handleSearch = (query) => {
    return mockSongs.filter((song) =>
      toUnaccented(song.title)
        .toLowerCase()
        .includes(toUnaccented(query).toLowerCase())
    );
  };

  const handleSearchNameArtist = (query) => {
    return artistNames.filter((artist) => {
      const artistName = toUnaccented(artist).toLowerCase();
      return artistName.includes(toUnaccented(query).toLowerCase());
    });
  };

  return (
    <div className="flex flex-col w-80 text-black p-5">
      <SearchBarWithDropdown
        placeholder={"Tìm kiếm nhạc..."}
        onSearch={handleSearch}
      />
      <SearchBar
        placeholder={"Tìm kiếm nghệ sĩ..."}
        onSearch={handleSearchNameArtist}
      />
      <Sidebar />
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

function App() {
  return <DemoButton />;
}

export default App;
