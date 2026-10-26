// /listen: màn Now Playing (visual-direction-v3.html, bỏ 2 khối điều khiển 3D), chia bố cục theo thiết bị
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentPlaylist, getCurrentSong, getIsPlaying, getIsShowQueue, getIsShuffle } from "../../app/selectors";
import { toggleMute, toggleQueue } from "../../app/slices/playerSlice";
import useHotkeys from "../../hooks/useHotkeys";
import QueueOverlay from "../queue/QueueOverlay";
import Marquee from "../../components/Marquee";
import { Button, Vinyl } from "../../components";
import { useDevice, useScreen } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import Matcappa from "../../mascot/Matcappa";
import { usePlaybackTime } from "./PlaybackTime";
import Dock, { dockHeight } from "./Dock";
import { fitDisc } from "./playerMath";
import ProgressBar from "./ProgressBar";
import Tonearm from "./Tonearm";

const NOTCH_SPACE = 64; // chừa đỉnh cho notch để tên bài không bị che
const PROGRESS_HEIGHT = 60; // thanh tiến trình + hai mốc giờ

// Số liệu từng máy: lề, khung tối đa, chữ tên bài, có mascot không, đĩa tối đa
const LAYOUT = {
  [DEVICE.MOBILE]: { side: 16, bottom: 16, frame: Infinity, titleSize: 24, mascot: false, discMax: 420 },
  [DEVICE.TABLET]: { side: 24, bottom: 24, frame: Infinity, titleSize: 36, mascot: true, discMax: 420 },
  [DEVICE.DESKTOP]: { side: 32, bottom: 24, frame: 1600, titleSize: 48, mascot: true, discMax: 720 },
};
const TITLE_BLOCK = 90; // chiều cao khối chữ trên cùng (ngữ cảnh + tên bài 1 dòng + ca sĩ)
const DISC_MIN = 120;


// Cỡ đĩa: vừa phần còn lại theo chiều cao, không quá một phần bề ngang khung; màn quá thấp (zoom lớn, xoay ngang) thì 0 = ẩn đĩa
function discSize(device, { width, height }, layout) {
  const frameWidth = Math.min(width, layout.frame) - layout.side * 2;
  const reserved =
    NOTCH_SPACE + TITLE_BLOCK + PROGRESS_HEIGHT + dockHeight(device, width) + layout.bottom + 48;
  const byHeight = height - reserved;
  switch (device) {
    case DEVICE.MOBILE:
      return fitDisc(byHeight, Math.min(frameWidth * 0.82, layout.discMax), DISC_MIN); // chừa mép phải cho cần đĩa
    case DEVICE.TABLET:
    case DEVICE.DESKTOP:
      return fitDisc(byHeight, Math.min(frameWidth * 0.45, layout.discMax), DISC_MIN);
  }
}

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
  const device = useDevice();
  const screen = useScreen();
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

  const layout = LAYOUT[device];
  const disc = discSize(device, screen, layout);
  const dockWidth = Math.min(screen.width, layout.frame) - layout.side * 2; // dock rộng bằng khung trừ lề
  const context = song
    ? `${playlist?.name ?? "Hàng chờ"} · ${position + 1}/${order.length}${shuffle ? " · Shuffle" : ""}`
    : "Chưa có bài nào";

  return (
    // reducedMotion="user": bật giảm chuyển động thì bìa không bay, đĩa không trượt
    <MotionConfig reducedMotion="user">
      <div
        className="relative mx-auto flex h-full w-full flex-col items-center"
        style={{
          maxWidth: layout.frame,
          paddingLeft: layout.side,
          paddingRight: layout.side,
          paddingTop: NOTCH_SPACE,
          paddingBottom: PROGRESS_HEIGHT + dockHeight(device, screen.width) + layout.bottom,
        }}
      >
        <SongTitle songKey={song?._id} context={context} song={song} size={layout.titleSize} />

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {disc > 0 && <Deck size={disc} song={song} isPlaying={isPlaying} mascot={layout.mascot} />}
          {!song && (
            <Button className="mt-8" onClick={() => navigate("/playlists")}>
              Mở thư viện
            </Button>
          )}
        </div>

        {/* Thanh tiến trình + dock dính đáy, cùng bề ngang */}
        <div className="absolute z-10 flex flex-col gap-1" style={{ left: layout.side, right: layout.side, bottom: layout.bottom }}>
          {song && (
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              alwaysThumb={device === DEVICE.MOBILE}
              className="px-2"
            />
          )}
          <Dock width={dockWidth} />
        </div>
        <AnimatePresence>{showQueue && song && <QueueOverlay key="queue" />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}

// Dòng ngữ cảnh + tên bài + ca sĩ. Tên bài luôn 1 hàng; dài hơn khung thì chạy chữ (Marquee)
function SongTitle({ songKey, context, song, size }) {
  return (
    <motion.div
      key={songKey ?? "none"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="w-full max-w-4xl text-center"
    >
      <div className="text-[13px] font-semibold uppercase tracking-[.14em] text-ink-soft">{context}</div>
      {song && (
        <>
          <h1 style={{ fontSize: size }}>
            <Marquee className="mt-1 font-extrabold leading-tight tracking-[-.03em]">{song.name}</Marquee>
          </h1>
          <div className="text-base text-ink-soft">{song.artist}</div>
        </>
      )}
    </motion.div>
  );
}

// Đĩa + cần đĩa, mascot ôm đĩa bay cạnh (không nói chuyện)
function Deck({ size, song, isPlaying, mascot }) {
  return (
    <div data-deck className="relative" style={{ width: size, height: size }}>
      <Vinyl
        size={420}
        spinning={song ? isPlaying : true}
        duration={song ? 6 : 18}
        label={song?.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined}
        style={{ width: "100%", height: "100%" }}
      />
      <Tonearm down={!!song && isPlaying} />
      {mascot && <Matcappa pose="hug-vinyl" propeller="spin" size={120} className="absolute bottom-[-4%] right-[96%]" />}
    </div>
  );
}
