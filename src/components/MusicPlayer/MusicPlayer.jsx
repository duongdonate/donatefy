import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player/youtube";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Mic2,
} from "lucide-react";

import formatDuration from "../../utils/formatDuration";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentSong, getIsPlaying } from "../../app/selectors";
import {
  togglePlay,
  nextSong,
  previousSong,
} from "../../app/slices/playerSlice";

import ProgressMusicBar from "./ProgressMusicBar";
import ControlPlayer from "./ControlPlayer";
import AdditionalControls from "./AdditionalControls";

const MusicPlayer = ({
  showLyrics,
  setShowLyrics,
  showQueue,
  setShowQueue,
}) => {
  const currentSong = useSelector(getCurrentSong);
  const isPlayingGlobal = useSelector(getIsPlaying);
  const dispatch = useDispatch();

  const [isPlaying, setIsPlaying] = useState(isPlayingGlobal);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [marqueeDuration, setMarqueeDuration] = useState(0);
  const playerRef = useRef(null);

  const configPlayer = {
    youtube: {
      playerVars: {
        playsinline: 1,
        autoplay: 1,
      },
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        try {
          const player = playerRef.current.getInternalPlayer();
          if (player && player.getCurrentTime) {
            const played = player.getCurrentTime();
            const total = player.getDuration();
            if (played && total) {
              setCurrentTime(played);
              setProgress((played / total) * 100);
            }
          }
        } catch (error) {
          // Ignore errors when player methods are not available
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong) {
      setDuration(currentSong.duration);
    }
    setIsPlaying(isPlayingGlobal);
  }, [currentSong, isPlayingGlobal]);

  const handleProgressChange = (e) => {
    const newProgress = (e.target.value / 100) * duration;
    if (playerRef.current && duration > 0) {
      try {
        playerRef.current.seekTo(newProgress);
        setProgress(e.target.value);
      } catch (error) {
        console.log("Seek not available yet", error.message);
      }
    }
  };

  const handleToggleVolume = useCallback(() => {
    if (!muted) {
      // Before: volume is set, mute it
      setMuted(true);
      setPrevVolume(volume);
      setVolume(0);
    } else {
      // Before: muted, restore previous volume
      setMuted(false);
      setVolume(prevVolume);
      setPrevVolume(0); // Reset previous volume to default
    }
  }, [muted, volume, prevVolume]);

  const handleVolumeChange = useCallback((e) => {
    setVolume((prevVolume) => {
      const newVolume = e.target.value / 100;

      if (prevVolume === 0) {
        setMuted(false);
      }
      setPrevVolume(prevVolume);

      if (newVolume === 0) {
        setMuted(true);
      }

      return newVolume;
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    dispatch(togglePlay(isPlayingGlobal));
  }, []);

  const handleNext = useCallback(() => {
    dispatch(nextSong());
  }, []);

  const handleReplay = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(0);
        setProgress(0);
        setCurrentTime(0);
      } catch (error) {
        console.log("Seek not available yet", error.message);
      }
    }
  }, [playerRef]);

  const handlePrevious = useCallback(() => {
    if (playerRef.current.getCurrentTime() > 5) {
      handleReplay();
      return;
    }
    dispatch(previousSong());
  }, [handleReplay, playerRef]);

  // Hỗ trợ MediaSessionAPI
  useEffect(() => {
    if ("mediaSession" in navigator && currentSong) {
      // 1. Cập nhật thông tin lên màn hình khóa
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.name,
        artist: currentSong.artist || "Unknown Artist",
        artwork: currentSong.thumbnail
          ? [
              {
                src: currentSong.thumbnail,
                sizes: "512x512",
                type: "image/jpeg",
              },
            ]
          : [],
      });

      // 2. Lắng nghe các nút bấm trên màn hình khóa hoặc tai nghe Bluetooth
      // Truyền thẳng các hàm đã bọc useCallback của bạn vào
      navigator.mediaSession.setActionHandler("play", handlePlayPause);
      navigator.mediaSession.setActionHandler("pause", handlePlayPause);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
      navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
    }

    // Cleanup khi component unmount
    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentSong, handlePlayPause, handleNext, handlePrevious]);

  if (!currentSong) {
    return null; // Don't render the player if no song is selected
  }

  return (
    <div className="group fixed bottom-0 left-0 right-0 min-w-screen min-h-2 max-h-28 px-6 py-4 shadow-2xl glass backdrop-blur-md z-40">
      {/* Progress Bar */}
      <ProgressMusicBar
        currentTime={currentTime}
        progress={progress}
        duration={duration}
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
          <div className="group min-w-0 flex-1 overflow-hidden cursor-pointer flex flex-col mask-to-l justify-center items-start">
            <span className="font-medium text-foreground text-lg whitespace-nowrap group-hover:animation-marquee-playing">
              {currentSong.name}
            </span>
            <span className="flex-none text-sm text-muted-foreground whitespace-nowrap">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Controls */}
        <ControlPlayer
          onNext={handleNext}
          onPrevious={handlePrevious}
          onPlayPause={handlePlayPause}
        />

        {/* Volume and Additional Controls */}
        <AdditionalControls
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onToggleVolume={handleToggleVolume}
        />
      </div>

      {/* Hidden Player */}
      <ReactPlayer
        ref={playerRef}
        url={
          currentSong
            ? `https://www.youtube.com/watch?v=${currentSong.id}`
            : null
        }
        playing={isPlaying}
        volume={muted ? 0 : volume}
        onDuration={setDuration}
        onEnded={handleNext}
        width="0"
        height="0"
        controls={true}
        config={configPlayer}
      />
    </div>
  );
};

export default MusicPlayer;
