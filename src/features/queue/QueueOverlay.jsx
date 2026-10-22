// Lớp phủ hàng chờ (queue-overlay.html): bìa bay từ dock lên, 2 tab, kéo thả, Alt+↑/↓
import { motion, Reorder } from "framer-motion";
import { Pause, Play, Repeat, Repeat1, Shuffle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentPlaylist, getCurrentSong, getIsPlaying, getIsShuffle, getRepeat } from "../../app/selectors";
import { cycleRepeat, playAt, reorderUpNext, toggleQueue, toggleShuffle } from "../../app/slices/playerSlice";
import { Glass, IconButton, Vinyl } from "../../design";
import { usePlaybackTime } from "../player/PlaybackTime";
import { moveItem } from "../player/playerMath";
import { DraggableRow, StaticRow } from "./QueueRow";

const EASE = [0.2, 0.8, 0.2, 1];
const COVER = "clamp(180px, 24vw, 320px)";
const REPEAT_LABEL = { off: "Lặp: tắt", all: "Lặp: tất cả", one: "Lặp: một bài" };
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

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
  const song = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  const shuffle = useSelector(getIsShuffle);
  const repeat = useSelector(getRepeat);
  const playlist = useSelector(getCurrentPlaylist);
  const { queue, order, position } = useSelector((s) => s.player);
  const { currentTime, duration, togglePlay } = usePlaybackTime();
  const [tab, setTab] = useState("next");
  const root = useRef(null);
  const closeBtn = useRef(null);

  const upNext = order.slice(position + 1);
  const played = order.slice(0, position);
  const close = () => dispatch(toggleQueue());

  // Mở: focus nút đóng; đóng: trả focus về nút Hàng chờ
  useEffect(() => {
    closeBtn.current?.focus();
    return () => document.querySelector("[data-queue-toggle]")?.focus();
  }, []);

  // Esc đóng, Tab không lọt ra ngoài lớp phủ
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      return close();
    }
    if (e.key !== "Tab") return;
    const els = [...root.current.querySelectorAll(FOCUSABLE)];
    const first = els[0], last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

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

  if (!song) return null;
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[3vw] -left-[1vw] whitespace-nowrap text-[19vw] font-extrabold tracking-[-.04em] text-transparent [-webkit-text-stroke:2px_rgba(167,196,167,.14)]"
      >
        QUEUE
      </div>

      <header className="absolute inset-x-[5vw] top-[3.6vw] flex items-center gap-4">
        <h2 className="text-[clamp(22px,2.8vw,40px)] font-extrabold tracking-[-.02em]">Hàng chờ</h2>
        <span className="text-sm opacity-60">
          {`${playlist?.name ?? "Hàng chờ"} · ${order.length} bài · đang phát bài ${position + 1}`}
        </span>
        <IconButton ref={closeBtn} label="Đóng" onClick={close} className="ml-auto !text-[#eef3e6] hover:!bg-white/10">
          <X size={22} />
        </IconButton>
      </header>

      <section className="absolute left-[5vw] top-[13vw]" style={{ width: `calc(${COVER} + 6vw)` }}>
        <div className="relative" style={{ width: COVER, height: COVER }}>
          <motion.div
            initial={{ x: "-25%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="absolute left-[46%] top-[3%] h-[93%] w-[93%]"
          >
            <Vinyl size={300} spinning={isPlaying} label={song.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined} style={{ width: "100%", height: "100%" }} />
          </motion.div>
          <motion.div
            layoutId="now-cover"
            transition={{ duration: 0.65, ease: EASE }}
            className="absolute inset-0 rounded-2xl bg-cover bg-center shadow-[0_30px_50px_-10px_rgba(0,0,0,.8)]"
            style={{ backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : undefined }}
          />
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            className="absolute bottom-3 right-3 z-10 grid h-14 w-14 place-items-center rounded-full bg-matcha-4/90 text-white shadow-[0_10px_20px_-6px_rgba(0,0,0,.6)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }} className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-[.14em] text-matcha-1">Đang phát</div>
          <div className="mt-1 line-clamp-2 text-[clamp(18px,2vw,28px)] font-extrabold tracking-[-.02em]">{song.name}</div>
          <div className="text-sm opacity-65">{song.artist}</div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-matcha-1" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <QBtn pressed={shuffle} onClick={() => dispatch(toggleShuffle())}>
              <Shuffle size={16} /> Trộn bài
            </QBtn>
            <QBtn pressed={repeat !== "off"} onClick={() => dispatch(cycleRepeat())}>
              <RepeatIcon size={16} /> {REPEAT_LABEL[repeat]}
            </QBtn>
          </div>
        </motion.div>
      </section>

      <Glass blur={10} className="absolute bottom-[4vw] left-[calc(10vw+clamp(180px,24vw,320px)+6vw)] right-[4vw] top-[11.5vw] flex flex-col overflow-hidden rounded-[28px] !border-white/15 !bg-white/[.06] p-5">
        <div role="tablist" aria-label="Danh sách hàng chờ" onKeyDown={onTabKey} className="relative flex gap-8 border-b border-white/10 px-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`qtab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`qpanel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`relative pb-3 pt-1 text-base font-bold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1 ${
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
                      <StaticRow key={`again-${qi}`} song={queue[qi]} index={upNext.length + pos} onPlay={() => dispatch(playAt(pos))} />
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <ul className="space-y-0.5 opacity-60 [&_span.aspect-video]:saturate-[.4]">
              {played.length === 0 && <p className="px-2 py-4 text-sm">Chưa phát bài nào trước bài này.</p>}
              {played.map((qi, pos) => (
                <StaticRow key={`played-${qi}`} song={queue[qi]} index={pos} onPlay={() => dispatch(playAt(pos))} />
              ))}
            </ul>
          )}
        </div>
      </Glass>
    </motion.div>
  );
}
