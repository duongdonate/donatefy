// /listen: màn Now Playing (visual-direction-v3.html, bỏ 2 khối điều khiển 3D)
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentPlaylist, getCurrentSong, getIsPlaying, getIsShowQueue, getIsShuffle } from "../../app/selectors";
import { toggleMute, toggleQueue } from "../../app/slices/playerSlice";
import useHotkeys from "../../hooks/useHotkeys";
import QueueOverlay from "../queue/QueueOverlay";
import Marquee from "../../components/Marquee";
import { Button, Vinyl } from "../../design";
import Matcappa from "../../mascot/Matcappa";
import { usePlaybackTime } from "./PlaybackTime";
import Dock from "./Dock";
import ProgressBar from "./ProgressBar";
import Tonearm from "./Tonearm";

const DECK = "min(34vw, 46vh, 420px)";

export default function NowPlaying() {
  const song = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const shuffle = useSelector(getIsShuffle);
  const playlist = useSelector(getCurrentPlaylist);
  const showQueue = useSelector(getIsShowQueue);
  const { order, position } = useSelector((s) => s.player);
  const { currentTime, duration, seek, previous, next, togglePlay } = usePlaybackTime();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const clampSeek = (t) => seek(Math.min(duration, Math.max(0, t)));

  // FR-16; "/" (tìm kiếm) để GĐ4
  useHotkeys({
    toggle: togglePlay,
    back5: () => clampSeek(currentTime - 5),
    fwd5: () => clampSeek(currentTime + 5),
    previous,
    next,
    mute: () => dispatch(toggleMute()),
    queue: () => song && dispatch(toggleQueue()),
  });

  return (
    // reducedMotion="user": bật giảm chuyển động thì bìa không bay, đĩa không trượt
    <MotionConfig reducedMotion="user">
      <div className="relative flex h-full flex-col items-center px-6 pb-[clamp(140px,18vw,210px)] pt-[clamp(24px,5vh,56px)]">
        <motion.div
          key={song?._id ?? "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-3xl text-center"
        >
          <div className="text-[13px] font-semibold uppercase tracking-[.14em] text-ink-soft">
            {song ? `${playlist?.name ?? "Hàng chờ"} · ${position + 1}/${order.length}${shuffle ? " · Shuffle" : ""}` : "Chưa có bài nào"}
          </div>
          {song && (
            <>
              <Marquee className="mt-1 text-[clamp(24px,3.6vw,48px)] font-extrabold leading-tight tracking-[-.03em]">
                {song.name}
              </Marquee>
              <div className="text-[clamp(14px,1.5vw,18px)] text-ink-soft">{song.artist}</div>
            </>
          )}
        </motion.div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative mt-6" style={{ width: DECK, height: DECK }}>
            <Vinyl
              size={420}
              spinning={song ? isPlaying : true}
              duration={song ? 6 : 18}
              label={song?.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined}
              style={{ width: "100%", height: "100%" }}
            />
            <Tonearm down={!!song && isPlaying} />
            {/* Mascot ôm đĩa bay cạnh đĩa (không nói chuyện) */}
            <Matcappa pose="hug-vinyl" propeller="spin" size={120} className="absolute bottom-[-4%] right-[96%]" />
          </div>
          {song ? (
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} className="mt-6" style={{ width: DECK }} />
          ) : (
            <Button className="mt-8" onClick={() => navigate("/library")}>
              Mở thư viện
            </Button>
          )}
        </div>
        <Dock />
        <AnimatePresence>{showQueue && song && <QueueOverlay key="queue" />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}
