// Lớp phủ hàng chờ (queue-overlay.html): bìa bay từ dock lên, 2 tab, kéo thả, Alt+↑/↓.
// Mobile: toàn màn một cột. Tablet / desktop: hai cột (bài đang phát | danh sách), desktop căn khung giữa.
import { motion, Reorder } from "framer-motion";
import { Pause, Play, Repeat, Repeat1, Shuffle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { getCurrentPlaylist, getCurrentSong, getIsPlaying, getIsShuffle, getRepeat } from "../../app/selectors";
import { cycleRepeat, playAt, reorderUpNext, toggleQueue, toggleShuffle } from "../../app/slices/playerSlice";
import { Glass, IconButton, Vinyl } from "../../components";
import Marquee from "../../components/Marquee";
import { useDevice, useScreen } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import { usePlaybackTime } from "../player/PlaybackTime";
import { REPEAT_LABEL, moveItem } from "../player/playerMath";
import { DraggableRow, StaticRow } from "./QueueRow";

const EASE = [0.2, 0.8, 0.2, 1];
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const clamp = (min, v, max) => Math.min(max, Math.max(min, v));

// Số liệu theo thiết bị: lề, khung tối đa, cỡ bìa lớn (wide), cỡ chữ tiêu đề, vùng chạm tay nắm
const LAYOUT = {
  [DEVICE.MOBILE]: { pad: 16, frame: Infinity, cover: () => 0, titleSize: 22, gripSize: 44 },
  [DEVICE.TABLET]: { pad: 32, frame: Infinity, cover: (w) => clamp(180, w * 0.24, 280), titleSize: 30, gripSize: 28 },
  [DEVICE.DESKTOP]: { pad: 48, frame: 1600, cover: (w) => clamp(240, w * 0.2, 320), titleSize: 40, gripSize: 28 },
};

// Chiều cao phần chữ dưới bìa ở cột trái (Đang phát, tên 2 dòng, ca sĩ, thanh chạy, hàng nút Trộn / Lặp) + tiêu đề trang
const INFO_BELOW_COVER = 250;
const HEADER_HEIGHT = 84;
const COVER_MIN = 120;

// Bìa cột trái: theo bề ngang, nhưng không cao quá phần còn lại để hàng nút Trộn / Lặp luôn thấy
function coverSize(layout, width, height) {
  const byHeight = height - layout.pad * 2 - HEADER_HEIGHT - INFO_BELOW_COVER;
  return Math.max(COVER_MIN, Math.min(layout.cover(Math.min(width, layout.frame)), byHeight));
}

function QBtn({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1 ${
        pressed ? "border-matcha-1/40 bg-matcha-1/15 text-matcha-1" : "border-white/15 text-[#eef3e6]/75 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function QueueOverlay() {
  const dispatch = useDispatch();
  const store = useStore();
  const device = useDevice();
  const { width, height } = useScreen();
  const song = useSelector(getCurrentSong);
  const playlist = useSelector(getCurrentPlaylist);
  const { order, position } = useSelector((s) => s.player);
  const root = useRef(null);
  const closeBtn = useRef(null);
  const close = () => dispatch(toggleQueue());

  // Mở: focus nút đóng; đóng: trả focus về nút Hàng chờ.
  // Rời trang khi đang mở (vd. bấm Back) thì cũng đóng, để trang khác không thấy showQueue còn bật.
  useEffect(() => {
    closeBtn.current?.focus();
    // Esc ở mức window: bấm vào vùng trống của lớp phủ làm focus rơi về body vẫn đóng được
    const onEsc = (e) => e.key === "Escape" && dispatch(toggleQueue());
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      if (store.getState().player.showQueue) dispatch(toggleQueue());
      document.querySelector("[data-queue-toggle]")?.focus();
    };
  }, [dispatch, store]);

  // Tab không lọt ra ngoài lớp phủ
  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    // bỏ phần tử tabIndex=-1 (tab đang ẩn) để biết đúng phần tử đầu / cuối
    const els = [...root.current.querySelectorAll(FOCUSABLE)].filter((el) => el.tabIndex >= 0);
    const first = els[0], last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!song) return null;
  const layout = LAYOUT[device];
  const subtitle = `${playlist?.name ?? "Hàng chờ"} · ${order.length} bài · đang phát bài ${position + 1}`;
  const header = <QueueHeader closeRef={closeBtn} onClose={close} subtitle={subtitle} titleSize={layout.titleSize} stacked={device === DEVICE.MOBILE} />;

  let body;
  switch (device) {
    case DEVICE.MOBILE:
      body = (
        <div className="flex h-full flex-col gap-3" style={{ padding: layout.pad }}>
          {header}
          <NowPlayingCompact />
          <QueueList gripSize={layout.gripSize} className="min-h-0 flex-1 p-3" />
        </div>
      );
      break;
    case DEVICE.TABLET:
    case DEVICE.DESKTOP:
      body = (
        <div className="mx-auto flex h-full w-full flex-col gap-6" style={{ maxWidth: layout.frame, padding: layout.pad }}>
          {header}
          <div className="flex min-h-0 flex-1 gap-8">
            <NowPlayingPanel cover={coverSize(layout, width, height)} />
            <QueueList gripSize={layout.gripSize} className="min-h-0 flex-1 p-5" />
          </div>
        </div>
      );
      break;
  }

  return (
    <motion.div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Hàng chờ"
      onKeyDown={onKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-0 z-50 overflow-hidden text-[#eef3e6] backdrop-blur-[22px] backdrop-saturate-[1.2]"
      style={{ background: "radial-gradient(60vw 40vw at 22% 40%, rgba(73,115,0,.45), transparent 70%), rgba(10,16,9,.82)" }}
    >
      {device !== DEVICE.MOBILE && <Watermark />}
      {body}
    </motion.div>
  );
}

// Chữ chìm "QUEUE" (ẩn ở mobile cho gọn)
function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-[3vw] -left-[1vw] whitespace-nowrap text-[19vw] font-extrabold tracking-[-.04em] text-transparent [-webkit-text-stroke:2px_rgba(167,196,167,.14)]"
    >
      QUEUE
    </div>
  );
}

// stacked: mobile để dòng phụ xuống dưới tiêu đề cho khỏi tràn
function QueueHeader({ closeRef, onClose, subtitle, titleSize, stacked }) {
  return (
    <header className="relative flex items-center gap-4">
      <div className={stacked ? "min-w-0 flex-1" : "flex min-w-0 flex-1 items-center gap-4"}>
        <h2 className="font-extrabold tracking-[-.02em]" style={{ fontSize: titleSize }}>
          Hàng chờ
        </h2>
        <span className="block truncate text-sm opacity-60">{subtitle}</span>
      </div>
      <IconButton ref={closeRef} size={44} label="Đóng" onClick={onClose} className="shrink-0 !text-[#eef3e6] hover:!bg-white/10">
        <X size={22} />
      </IconButton>
    </header>
  );
}

function usePlayingState() {
  const dispatch = useDispatch();
  const song = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const shuffle = useSelector(getIsShuffle);
  const repeat = useSelector(getRepeat);
  const { currentTime, duration, togglePlay } = usePlaybackTime();
  return {
    song,
    isPlaying,
    shuffle,
    repeat,
    togglePlay,
    pct: duration ? (currentTime / duration) * 100 : 0,
    toggleShuffle: () => dispatch(toggleShuffle()),
    cycleRepeat: () => dispatch(cycleRepeat()),
  };
}

function PlayButton({ isPlaying, onClick, size }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPlaying ? "Tạm dừng" : "Phát"}
      className="z-10 grid shrink-0 place-items-center rounded-full bg-matcha-4/90 text-white shadow-[0_10px_20px_-6px_rgba(0,0,0,.6)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={{ width: size, height: size }}
    >
      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
    </button>
  );
}

function ShuffleRepeat({ p }) {
  const RepeatIcon = p.repeat === "one" ? Repeat1 : Repeat;
  return (
    <div className="flex flex-wrap gap-2">
      <QBtn pressed={p.shuffle} onClick={p.toggleShuffle}>
        <Shuffle size={16} /> Trộn bài
      </QBtn>
      <QBtn pressed={p.repeat !== "off"} onClick={p.cycleRepeat}>
        <RepeatIcon size={16} /> {REPEAT_LABEL[p.repeat]}
      </QBtn>
    </div>
  );
}

// Tablet / desktop: bìa lớn + đĩa trượt ra, tên, thanh chạy, Trộn / Lặp
function NowPlayingPanel({ cover }) {
  const p = usePlayingState();
  const { song } = p;
  return (
    <section className="shrink-0" style={{ width: cover * 1.25 }}>
      <div className="relative" style={{ width: cover, height: cover }}>
        <motion.div
          initial={{ x: "-25%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="absolute left-[46%] top-[3%] h-[93%] w-[93%]"
        >
          <Vinyl size={300} spinning={p.isPlaying} label={song.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined} style={{ width: "100%", height: "100%" }} />
        </motion.div>
        <motion.div
          layoutId="now-cover"
          transition={{ duration: 0.65, ease: EASE }}
          className="absolute inset-0 rounded-2xl bg-cover bg-center shadow-[0_30px_50px_-10px_rgba(0,0,0,.8)]"
          style={{ backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : undefined }}
        />
        <div className="absolute bottom-3 right-3">
          <PlayButton isPlaying={p.isPlaying} onClick={p.togglePlay} size={56} />
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }} className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-[.14em] text-matcha-1">Đang phát</div>
        <div className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-[-.02em]">{song.name}</div>
        <div className="text-sm opacity-65">{song.artist}</div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-matcha-1" style={{ width: `${p.pct}%` }} />
        </div>
        <div className="mt-4">
          <ShuffleRepeat p={p} />
        </div>
      </motion.div>
    </section>
  );
}

// Mobile: một hàng gọn: bìa nhỏ, tên chạy chữ, nút phát; Trộn / Lặp ở dưới
function NowPlayingCompact() {
  const p = usePlayingState();
  const { song } = p;
  return (
    <section className="shrink-0 space-y-3">
      <div className="flex items-center gap-3">
        <motion.div
          layoutId="now-cover"
          transition={{ duration: 0.65, ease: EASE }}
          className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : undefined }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[.14em] text-matcha-1">Đang phát</div>
          <Marquee className="text-base font-bold">{song.name}</Marquee>
          <div className="truncate text-xs opacity-65">{song.artist}</div>
        </div>
        <PlayButton isPlaying={p.isPlaying} onClick={p.togglePlay} size={44} />
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-matcha-1" style={{ width: `${p.pct}%` }} />
      </div>
      <ShuffleRepeat p={p} />
    </section>
  );
}

// Hai tab Tiếp theo / Đã phát + danh sách cuộn
function QueueList({ gripSize, className = "" }) {
  const dispatch = useDispatch();
  const repeat = useSelector(getRepeat);
  const { queue, order, position } = useSelector((s) => s.player);
  const [tab, setTab] = useState("next");

  const upNext = order.slice(position + 1);
  const played = order.slice(0, position);

  const move = (i, d) => {
    const next = moveItem(upNext, i, d);
    if (next === upNext) return;
    dispatch(reorderUpNext(next));
    const qi = upNext[i];
    requestAnimationFrame(() => document.querySelector(`[data-qi="${qi}"] button`)?.focus());
  };

  const tabs = [
    { id: "next", label: "Tiếp theo", count: upNext.length },
    { id: "played", label: "Đã phát", count: played.length },
  ];
  const onTabKey = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const to = tab === "next" ? "played" : "next";
    setTab(to);
    document.getElementById(`qtab-${to}`)?.focus();
  };

  return (
    <Glass blur={10} className={`flex flex-col overflow-hidden rounded-[28px] !border-white/15 !bg-white/[.06] ${className}`}>
      <div role="tablist" aria-label="Danh sách hàng chờ" onKeyDown={onTabKey} className="relative flex gap-6 border-b border-white/10 px-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`qtab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`qpanel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`relative whitespace-nowrap pb-3 pt-1 text-base font-bold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1 ${
              tab === t.id ? "opacity-100" : "opacity-50 hover:opacity-85"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-sm font-medium opacity-60">{t.count}</span>
            {tab === t.id && (
              <motion.span layoutId="queue-tab-ink" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-matcha-1" transition={{ duration: 0.35, ease: EASE }} />
            )}
          </button>
        ))}
      </div>

      <div id={`qpanel-${tab}`} role="tabpanel" aria-labelledby={`qtab-${tab}`} className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === "next" ? (
          <>
            {upNext.length === 0 && repeat !== "all" && <p className="px-2 py-4 text-sm opacity-60">Hết hàng chờ rồi ~</p>}
            <Reorder.Group axis="y" values={upNext} onReorder={(next) => dispatch(reorderUpNext(next))} className="space-y-0.5">
              {upNext.map((qi, i) => (
                <DraggableRow
                  key={qi}
                  queueIndex={qi}
                  song={queue[qi]}
                  index={i}
                  gripSize={gripSize}
                  onPlay={() => dispatch(playAt(position + 1 + i))}
                  onMove={(d) => move(i, d)}
                />
              ))}
            </Reorder.Group>
            {repeat === "all" && (
              <>
                <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-[.14em] opacity-45">Sau đó phát lại từ đầu</p>
                <ul className="mt-1 space-y-0.5 opacity-60">
                  {order.slice(0, position + 1).map((qi, pos) => (
                    <StaticRow key={`again-${qi}`} song={queue[qi]} index={upNext.length + pos} gripSize={gripSize} onPlay={() => dispatch(playAt(pos))} />
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <ul className="space-y-0.5 opacity-60 [&_span.aspect-video]:saturate-[.4]">
            {played.length === 0 && <p className="px-2 py-4 text-sm">Chưa phát bài nào trước bài này.</p>}
            {played.map((qi, pos) => (
              <StaticRow key={`played-${qi}`} song={queue[qi]} index={pos} gripSize={gripSize} onPlay={() => dispatch(playAt(pos))} />
            ))}
          </ul>
        )}
      </div>
    </Glass>
  );
}
