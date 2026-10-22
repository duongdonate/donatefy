// Bộ phát ẩn: Redux quyết định phát bài nào, ReactPlayer chỉ lo phát bài đó.
// Luồng một chiều: props (url/playing/volume/loop) đi xuống, sự kiện đi lên.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSong, getIsMuted, getIsPlaying, getQueue, getRepeat, getVolume } from "../../app/selectors";
import { next, previous, setPlaying, setVolume, songFailed, toggleMute, togglePlay } from "../../app/slices/playerSlice";
import { PlaybackTimeContext } from "./PlaybackTime";
import { VOLUME_KEY, parseSavedVolume, previousAction } from "./playerMath";

export default function PlayerEngine({ children }) {
  const currentSong = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const repeat = useSelector(getRepeat);
  const volume = useSelector(getVolume);
  const muted = useSelector(getIsMuted);
  const queueLength = useSelector(getQueue).length;
  const position = useSelector((state) => state.player.position);
  const dispatch = useDispatch();

  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(currentSong?.duration ?? 0);
  }, [currentSong?._id, currentSong?.duration]);

  // Nhớ âm lượng giữa các lần mở (FR-14)
  useEffect(() => {
    let saved = null;
    try {
      saved = parseSavedVolume(localStorage.getItem(VOLUME_KEY));
    } catch {
      /* localStorage bị chặn: dùng mặc định */
    }
    if (!saved) return;
    dispatch(setVolume(saved.volume));
    if (saved.muted !== (saved.volume === 0)) dispatch(toggleMute());
  }, [dispatch]);
  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, JSON.stringify({ volume, muted }));
    } catch {
      /* bỏ qua */
    }
  }, [volume, muted]);

  const seek = useCallback((seconds) => {
    playerRef.current?.seekTo(seconds, "seconds");
    setCurrentTime(seconds);
  }, []);
  const doToggle = useCallback(() => dispatch(togglePlay()), [dispatch]);
  const doNext = useCallback(() => dispatch(next()), [dispatch]);
  const doPrevious = useCallback(() => {
    const played = playerRef.current?.getCurrentTime() ?? 0;
    if (previousAction(played, position, repeat) === "restart") seek(0);
    else dispatch(previous());
  }, [dispatch, position, repeat, seek]);

  // Media Session: phím media, màn hình khoá, tai nghe Bluetooth
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: currentSong.name,
      artist: currentSong.artist || "Unknown Artist",
      artwork: currentSong.thumbnail ? [{ src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", doToggle);
    navigator.mediaSession.setActionHandler("pause", doToggle);
    navigator.mediaSession.setActionHandler("nexttrack", doNext);
    navigator.mediaSession.setActionHandler("previoustrack", doPrevious);
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [currentSong, doToggle, doNext, doPrevious]);

  const value = useMemo(
    () => ({ currentTime, duration, seek, previous: doPrevious, next: doNext, togglePlay: doToggle }),
    [currentTime, duration, seek, doPrevious, doNext, doToggle]
  );

  // Queue chỉ 1 bài + repeat all: url không đổi nên phải loop thay vì next
  const loop = repeat === "one" || (repeat === "all" && queueLength === 1);

  return (
    <PlaybackTimeContext.Provider value={value}>
      {children}
      {currentSong && (
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
          onEnded={doNext}
          onError={() => dispatch(songFailed())}
          width="0"
          height="0"
          config={{ youtube: { playerVars: { playsinline: 1 } } }}
        />
      )}
    </PlaybackTimeContext.Provider>
  );
}
