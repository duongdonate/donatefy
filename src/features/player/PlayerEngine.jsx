// Bộ phát ẩn: Redux quyết định phát bài nào, ReactPlayer chỉ lo phát bài đó.
// Luồng một chiều: props (url/playing/volume/loop) đi xuống, sự kiện đi lên.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSong, getIsMuted, getIsPlaying, getQueue, getRepeat, getVolume } from "../../app/selectors";
import { next, previous, setPlaying, setVolume, songFailed, toggleMute, togglePlay } from "../../app/slices/playerSlice";
import { PlaybackTimeContext } from "./PlaybackTime";
import { VOLUME_KEY, parseSavedVolume, previousAction } from "./playerMath";

// WAV mono 8 kHz dài 1 giây toàn im lặng, tạo tại chỗ để khỏi thêm file tĩnh
function silentWavUrl() {
  const rate = 8000;
  const buf = new ArrayBuffer(44 + rate);
  const v = new DataView(buf);
  const tag = (at, s) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  tag(0, "RIFF");
  v.setUint32(4, 36 + rate, true);
  tag(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  tag(36, "data");
  v.setUint32(40, rate, true);
  new Uint8Array(buf, 44).fill(128);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

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

  // Nhạc phát trong iframe YouTube nên Chrome gắn Media Session với iframe, handler next/prev
  // của trang không được dùng. Phát một đoạn im lặng ngay ở trang này để trang giữ session.
  const silentRef = useRef(null);
  const [silentUrl] = useState(silentWavUrl);
  useEffect(() => {
    const audio = silentRef.current;
    if (!audio) return;
    if (currentSong && isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [currentSong, isPlaying]);

  // Media Session: phím media, màn hình khoá, tai nghe Bluetooth
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: currentSong.name,
      artist: currentSong.artist || "Unknown Artist",
      artwork: currentSong.thumbnail ? [{ src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => dispatch(setPlaying(true)));
    navigator.mediaSession.setActionHandler("pause", () => dispatch(setPlaying(false)));
    const skip = (delta) => () => {
      const now = playerRef.current?.getCurrentTime() ?? 0;
      seek(Math.max(0, now + delta));
    };
    navigator.mediaSession.setActionHandler("seekbackward", skip(-10));
    navigator.mediaSession.setActionHandler("seekforward", skip(10));
    navigator.mediaSession.setActionHandler("seekto", ({ seekTime }) => seek(seekTime));
    navigator.mediaSession.setActionHandler("nexttrack", doNext);
    navigator.mediaSession.setActionHandler("previoustrack", doPrevious);
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [currentSong, dispatch, doNext, doPrevious, seek]);

  // Thanh tiến trình của Windows/Chrome lấy từ đây, không phải từ đoạn audio im lặng
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong || !duration) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    try {
      navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position: Math.min(currentTime, duration) });
    } catch {
      /* position/duration chưa hợp lệ (đang đổi bài): bỏ qua tick này */
    }
  }, [currentSong, duration, currentTime, isPlaying]);

  const value = useMemo(
    () => ({ currentTime, duration, seek, previous: doPrevious, next: doNext, togglePlay: doToggle }),
    [currentTime, duration, seek, doPrevious, doNext, doToggle]
  );

  // Queue chỉ 1 bài + repeat all: url không đổi nên phải loop thay vì next
  const loop = repeat === "one" || (repeat === "all" && queueLength === 1);

  return (
    <PlaybackTimeContext.Provider value={value}>
      {children}
      <audio ref={silentRef} src={silentUrl} loop hidden />
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
