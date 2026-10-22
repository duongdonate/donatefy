// /listen: màn Now Playing (visual-direction-v3.html, bỏ 2 khối điều khiển 3D)
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { getCurrentPlaylist, getCurrentSong, getIsPlaying, getIsShuffle } from "../../app/selectors";
import Marquee from "../../components/Marquee";
import { Vinyl } from "../../design";
import { usePlaybackTime } from "./PlaybackTime";
import ProgressBar from "./ProgressBar";
import Tonearm from "./Tonearm";

const DECK = "min(34vw, 46vh, 420px)";

export default function NowPlaying() {
  const song = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const shuffle = useSelector(getIsShuffle);
  const playlist = useSelector(getCurrentPlaylist);
  const { order, position } = useSelector((s) => s.player);
  const { currentTime, duration, seek } = usePlaybackTime();

  return (
    <div className="flex h-full flex-col items-center px-6 pb-[200px] pt-[clamp(24px,5vh,56px)]">
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
            spinning={isPlaying}
            label={song?.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined}
            style={{ width: "100%", height: "100%" }}
          />
          <Tonearm down={!!song && isPlaying} />
        </div>
        {song && (
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} className="mt-6" style={{ width: DECK }} />
        )}
      </div>
    </div>
  );
}
