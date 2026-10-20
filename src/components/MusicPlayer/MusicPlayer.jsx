import { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player/youtube";

import { useSelector, useDispatch } from "react-redux";
import {
  getCurrentSong,
  getIsPlaying,
  getRepeat,
  getVolume,
  getIsMuted,
  getQueue,
} from "../../app/selectors";
import {
  togglePlay,
  setPlaying,
  next,
  previous,
  songFailed,
} from "../../app/slices/playerSlice";

import ProgressMusicBar from "./ProgressMusicBar";
import ControlPlayer from "./ControlPlayer";
import AdditionalControls from "./AdditionalControls";
import Marquee from "../Marquee";

// Redux quyết định phát bài nào; component này chỉ nối Redux <-> ReactPlayer.
// Luồng một chiều: props (url/playing/volume/loop) đi xuống, sự kiện đi lên.
const MusicPlayer = () => {
  const currentSong = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const repeat = useSelector(getRepeat);
  const volume = useSelector(getVolume);
  const muted = useSelector(getIsMuted);
  const queueLength = useSelector(getQueue).length;
  const position = useSelector((state) => state.player.position);
  const dispatch = useDispatch();

  const playerRef = useRef(null);
  // Thời gian chạy đổi nhiều lần mỗi giây nên để local, không đưa vào Redux
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(currentSong?.duration ?? 0);
  }, [currentSong?._id, currentSong?.duration]);

  const handlePlayPause = useCallback(() => dispatch(togglePlay()), [dispatch]);
  const handleNext = useCallback(() => dispatch(next()), [dispatch]);

  // Giống Spotify: đã nghe > 3s (hoặc đang ở bài đầu) thì về đầu bài
  const handlePrevious = useCallback(() => {
    const played = playerRef.current?.getCurrentTime() ?? 0;
    if (played > 3 || (position === 0 && repeat !== "all")) {
      playerRef.current?.seekTo(0);
      setCurrentTime(0);
      return;
    }
    dispatch(previous());
  }, [dispatch, position, repeat]);

  const handleProgressChange = (e) => {
    if (!duration) return;
    const seconds = (e.target.value / 100) * duration;
    playerRef.current?.seekTo(seconds);
    setCurrentTime(seconds);
  };

  // Media Session: phím media, màn hình khoá, tai nghe Bluetooth
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: currentSong.name,
      artist: currentSong.artist || "Unknown Artist",
      artwork: currentSong.thumbnail
        ? [{ src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.setActionHandler("play", handlePlayPause);
    navigator.mediaSession.setActionHandler("pause", handlePlayPause);
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [currentSong, handlePlayPause, handleNext, handlePrevious]);

  // Sau tất cả hook để không vi phạm rules of hooks
  if (!currentSong) return null;

  // Queue chỉ 1 bài + repeat all: url không đổi nên phải loop thay vì next
  const loop = repeat === "one" || (repeat === "all" && queueLength === 1);

  return (
    <div className="group fixed bottom-0 left-0 right-0 min-w-screen min-h-2 max-h-28 px-6 py-4 shadow-2xl glass backdrop-blur-md z-40">
      <ProgressMusicBar
        currentTime={currentTime}
        duration={duration}
        progress={duration ? (currentTime / duration) * 100 : 0}
        onProgressChange={handleProgressChange}
      />

      <div className="flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0 max-w-xs">
          <div className="w-16 aspect-thumbnail overflow-hidden rounded shadow-lg">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            {/* Giống thanh Now Playing của Spotify: tên dài thì luôn chạy */}
            <Marquee className="font-medium text-foreground text-lg">
              {currentSong.name}
            </Marquee>
            <Marquee className="text-sm text-muted-foreground">
              {currentSong.artist}
            </Marquee>
          </div>
        </div>

        <ControlPlayer
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />

        <AdditionalControls />
      </div>

      {/* Hidden Player: đổi bài = đổi url */}
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${currentSong.id}`}
        playing={isPlaying}
        volume={muted ? 0 : volume}
        loop={loop}
        progressInterval={500}
        onPlay={() => dispatch(setPlaying(true))}
        onPause={() => dispatch(setPlaying(false))}
        onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
        onDuration={setDuration}
        onEnded={handleNext}
        onError={() => dispatch(songFailed())}
        width="0"
        height="0"
        config={{ youtube: { playerVars: { playsinline: 1 } } }}
      />
    </div>
  );
};

export default MusicPlayer;
