// Thư viện "Xoè bìa" (playlists-options.html phần A), không có đĩa trượt ra
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Play, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllPlaylists,
  getCurrentPlaylist,
  getCurrentSong,
} from "../../app/selectors";
import {
  removePlaylist,
  addPlaylist,
  setAllPlaylists,
  setCurrentPlaylist,
} from "../../app/slices/playlistSlice";
import { playContext } from "../../app/slices/playerSlice";
import { useToastContext } from "../../contexts/ToastContext";
import { Button, IconButton } from "../../design";
import useConfirm from "../../hooks/useConfirm";
import Matcappa from "../../mascot/Matcappa";
import playlistService from "../../services/api/playlistService";
import songService from "../../services/api/songService";
import { accumulateWheel, clampStep } from "../landing/stepper";
import { fanTransform, libraryOrder, totalDuration } from "./libraryMath";
import PlaylistMenu from "./PlaylistMenu";

const CREATE = "__create";
// Cỡ bìa theo hộp của dải (container-type: size), co được xuống dưới 170px khi thấp
const W = "min(24cqw, 68cqh, 340px)";
const unwrap = (res) => (Array.isArray(res) ? res : (res?.data ?? []));
const WHEEL_REPEAT_MS = 250; // 20 cú lăn nhỏ trong ~200ms vẫn chỉ 1 bìa
const CREATE_MIN_MS = 1200; // hiệu ứng chờ tối thiểu để thả đĩa không bị giật
const wait = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const preload = (src) =>
  new Promise((r) => {
    if (!src) return r();
    const img = new Image();
    img.onload = img.onerror = r;
    img.src = src;
  });
const LEAVES = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({
  x: Math.round(Math.cos(k * 0.8) * 90),
  y: Math.round(Math.sin(k * 0.8) * 60 - 30),
}));
const minutes = (sec) => `${Math.max(1, Math.round(sec / 60))} phút`;
const inField = (t) => t.closest?.("input, textarea, [contenteditable]");
const arrow =
  "absolute top-1/2 z-30 -translate-y-1/2 border border-white/20 !bg-white/10 !text-[#eef3e6] shadow-[0_8px_24px_-8px_rgba(0,0,0,.7)] backdrop-blur-md hover:!bg-white/20";
// Hai mép dải bìa mờ dần
const edgeFade =
  "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)";

export default function LibraryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToastContext();
  const playlists = useSelector(getAllPlaylists);
  const currentPlaylist = useSelector(getCurrentPlaylist);
  const song = useSelector(getCurrentSong);
  const playingId = song ? currentPlaylist?._id : null;

  const items = useMemo(
    () => [...libraryOrder(playlists, playingId), null],
    [playlists, playingId],
  ); // null = thẻ Tạo
  const keyOf = (it) => it?._id ?? CREATE;
  const [selId, setSelId] = useState(null); // id bìa giữa; CREATE = thẻ Tạo; null = bìa đầu
  const found = selId ? items.findIndex((it) => keyOf(it) === selId) : 0;
  const at = Math.max(found, 0);
  const p = items[at];
  const [songsById, setSongsById] = useState({});
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const justMade = useRef(null); // id playlist vừa tạo: chỉ bìa này có hiệu ứng thả đĩa
  const [createErr, setCreateErr] = useState("");
  const [shake, setShake] = useState(0);
  const reduceMotion = useReducedMotion();
  const strip = useRef(null);
  const atRef = useRef(0);
  const itemsRef = useRef(items);
  const requested = useRef(new Set());
  atRef.current = at;
  itemsRef.current = items;

  // Tải danh sách khi vào trang (Sidebar v1 không còn trong shell v2)
  useEffect(() => {
    let alive = true;
    playlistService
      .getAll()
      .then((res) => alive && dispatch(setAllPlaylists(unwrap(res))))
      .catch(() => showToast("Không tải được thư viện, thử lại sau nha"));
    return () => {
      alive = false;
    };
  }, [dispatch, showToast]);

  // Không khoá theo thời gian: bấm/phím nhanh bao nhiêu lần thì lướt bấy nhiêu bìa, transition tự nối tiếp
  const go = useCallback((n) => {
    const to = clampStep(n, itemsRef.current.length);
    if (to === atRef.current) return;
    atRef.current = to; // bấm liên tiếp trước khi render lại vẫn cộng đúng
    setRenaming(false);
    setSelId(keyOf(itemsRef.current[to]));
  }, []);

  // Lăn chuột: cộng dồn, một nấc rõ ràng một bìa; lăn liên tục thì cứ WHEEL_REPEAT_MS lại thêm một bìa
  useEffect(() => {
    const el = strip.current;
    let acc = 0,
      spent = false,
      last = 0,
      timer;
    const onWheel = (e) => {
      e.preventDefault();
      clearTimeout(timer);
      timer = setTimeout(() => {
        acc = 0;
        spent = false;
      }, 160);
      if (spent && e.timeStamp - last > WHEEL_REPEAT_MS) spent = false;
      const r = accumulateWheel(acc, e.deltaY || e.deltaX, spent);
      if (r.dir) last = e.timeStamp;
      acc = r.acc;
      spent = r.spent;
      if (r.dir) go(atRef.current + r.dir);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("wheel", onWheel);
    };
  }, [go]);

  // ←/→ lướt bìa ở cả trang (không cần focus vào thư viện); bỏ qua khi đang gõ, mở menu hay hộp thoại
  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.key !== "ArrowLeft" && e.key !== "ArrowRight") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        inField(e.target) ||
        e.target.closest?.("[role=menu], [role=slider]") ||
        document.querySelector("[role=dialog]")
      )
        return;
      e.preventDefault();
      go(atRef.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const loadSongs = useCallback(
    async (id) => {
      if (songsById[id]) return songsById[id];
      const songs = unwrap(await songService.getSongs(id));
      setSongsById((m) => ({ ...m, [id]: songs }));
      return songs;
    },
    [songsById],
  );

  // Số phút của bìa giữa
  useEffect(() => {
    const id = p?._id;
    if (!id || !p.videos?.length || songsById[id] || requested.current.has(id))
      return;
    requested.current.add(id);
    loadSongs(id).catch(() => requested.current.delete(id));
  }, [p, songsById, loadSongs]);

  const play = async () => {
    try {
      const songs = await loadSongs(p._id);
      if (!songs.length) return showToast("Playlist này chưa có bài nào nha ~");
      dispatch(setCurrentPlaylist(p));
      dispatch(playContext({ songs, startIndex: 0 }));
    } catch {
      showToast("Không tải được bài, thử lại sau nha");
    }
  };

  const create = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || busy) return; // nút Tạo đã khoá khi rỗng; maxLength chặn quá 60
    setBusy(true);
    setCreateErr("");
    const start = Date.now();
    try {
      const made = await playlistService.create({ name });
      // Tải lại danh sách + ảnh bìa để thả đĩa là có hình ngay; quá 2s thì thôi (playlist đã lưu rồi)
      const fresh = await Promise.race([
        Promise.all([
          playlistService.getAll().then(unwrap),
          preload(made.thumbnail),
        ]).then(([list]) => list),
        wait(2000).then(() => null),
      ]).catch(() => null);
      await wait(CREATE_MIN_MS - (Date.now() - start));
      justMade.current = made._id;
      dispatch(
        fresh?.some((x) => x._id === made._id)
          ? setAllPlaylists(fresh)
          : addPlaylist({ ...made, cover: made.cover ?? made.thumbnail }), // POST không trả `cover`
      );
      setSelId(made._id);
      setNewName("");
      showToast(`Đã tạo playlist "${made.name}"`);
    } catch {
      setCreateErr("Chưa tạo được, thử lại nha ~");
      setShake((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  const saveName = async () => {
    const name = draft.trim();
    if (!name || name.length > 60)
      return showToast("Tên playlist dài 1–60 ký tự nha ~");
    if (name === p.name) return setRenaming(false);
    try {
      const updated = await playlistService.rename(p._id, name);
      const next = { ...p, name: updated?.name ?? name };
      dispatch(
        setAllPlaylists(playlists.map((x) => (x._id === p._id ? next : x))),
      );
      if (currentPlaylist?._id === p._id)
        dispatch(setCurrentPlaylist({ ...currentPlaylist, name: next.name }));
      setRenaming(false);
    } catch {
      showToast("Đổi tên thất bại, thử lại sau nha");
    }
  };

  const remove = async () => {
    if (!(await confirm(`Xoá playlist "${p.name}"?`))) return;
    try {
      await playlistService.delete(p._id);
      setSelId(keyOf(items[at + 1] ?? items[at - 1]));
      dispatch(removePlaylist(p._id));
      showToast("Đã xoá playlist");
    } catch {
      showToast("Xoá playlist thất bại, thử lại sau nha");
    }
  };

  const songs = p?._id ? songsById[p._id] : null;
  const count = p?.videos?.length ?? 0;

  return (
    <>
      {/* Phủ kín màn hình (main có pb-28 khi có nhạc, absolute inset-0 vẫn phủ cả phần đệm); đệm riêng để không chui dưới header/rail/Music Layer */}
      <section
        aria-label="Thư viện playlist"
        className={`absolute inset-0 flex flex-col overflow-clip pl-24 pr-6 pt-24 text-[#eef3e6] [container-type:inline-size] ${song ? "pb-28" : "pb-4"}`}
        style={{
          background:
            "radial-gradient(60cqw 40cqw at 50% 45%, rgba(73,115,0,.45), transparent 70%), rgba(10,16,9,.82)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[3cqw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-extrabold tracking-tighter text-transparent"
          style={{
            fontSize: "17cqw",
            WebkitTextStroke: ".15cqw rgba(167,196,167,.12)",
          }}
        >
          PLAYLISTS
        </span>

        <header className="relative z-10 flex items-baseline gap-3 px-8 pt-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Playlist của bạn
          </h1>
          <span className="text-sm opacity-60">
            {playlists.length} playlist
          </span>
        </header>

        <div
          ref={strip}
          className="relative min-h-0 flex-1 overflow-clip [container-type:size]"
          style={{ "--w": W }}
        >
          {playlists.length === 0 && (
            <div className="absolute left-8 top-2 z-10 flex items-center gap-2 text-sm opacity-80">
              <Matcappa pose="hug-knees" size={72} />
              <p>Chưa có chồng đĩa nào, tạo cái đầu tiên nha ~</p>
            </div>
          )}
          <IconButton
            label="Playlist trước"
            onClick={() => go(at - 1)}
            disabled={at === 0}
            className={`${arrow} left-4`}
          >
            <ChevronLeft size={24} />
          </IconButton>
          <IconButton
            label="Playlist sau"
            onClick={() => go(at + 1)}
            disabled={at === items.length - 1}
            className={`${arrow} right-4`}
          >
            <ChevronRight size={24} />
          </IconButton>

          <div
            className="absolute inset-0"
            style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
          >
            {items.map((it, i) => {
              const o = i - at,
                a = Math.abs(o);
              const centre = o === 0;
              return (
                <div
                  key={it?._id ?? "create"}
                  aria-hidden={a > 3}
                  onClick={() => !centre && go(i)}
                  className="absolute left-1/2 top-1/2 aspect-square transition-[transform,opacity,filter] duration-[450ms] ease-matcha motion-reduce:transition-none"
                  style={{
                    width: "var(--w)",
                    margin: "calc(var(--w) / -2) 0 0 calc(var(--w) / -2)",
                    transform: fanTransform(o),
                    zIndex: 20 - a,
                    opacity: a > 3 ? 0 : 1,
                    pointerEvents: a > 3 ? "none" : "auto",
                    filter: centre ? "none" : "brightness(.7) saturate(.7)",
                    cursor: centre ? "default" : "pointer",
                  }}
                >
                  {it ? (
                    <motion.div
                      initial={
                        it._id === justMade.current && !reduceMotion
                          ? { y: "-160%", rotate: -12, opacity: 0 }
                          : false
                      }
                      animate={{ y: 0, rotate: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 14,
                        opacity: { duration: 0.15 },
                      }}
                      className="absolute inset-0 overflow-hidden rounded-[1.2cqw] bg-matcha-4"
                      style={{
                        boxShadow: centre
                          ? "0 2.4cqw 4cqw -1cqw rgba(0,0,0,.7)"
                          : "0 1.2cqw 2cqw -1cqw rgba(0,0,0,.6)",
                        outline: centre
                          ? "1px solid rgba(238,243,230,.35)"
                          : "none",
                      }}
                    >
                      {it.cover && (
                        <img
                          src={it.cover}
                          alt=""
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {!centre && <span className="sr-only">{it.name}</span>}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={shake}
                      animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : false}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.2cqw] border-2 border-dashed border-[rgba(238,243,230,.4)] bg-white/[.06] p-4 text-center"
                    >
                      {busy && !reduceMotion && (
                        // Lớp lấp lánh quét ngang trong lúc chờ server
                        <motion.span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-120%" }}
                          animate={{ x: "220%" }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      )}
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-[rgba(167,196,167,.18)] text-matcha-1">
                        <Plus size={28} aria-hidden="true" />
                      </span>
                      <b className="text-base">Tạo playlist</b>
                    </motion.div>
                  )}
                  {it?._id === justMade.current &&
                    !reduceMotion &&
                    LEAVES.map((l, k) => (
                      // Lá trà bung ra khi đĩa đáp xuống
                      <motion.span
                        key={k}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-3 rounded-[8px_0] bg-matcha-1"
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                        animate={{
                          x: l.x,
                          y: l.y,
                          rotate: 200,
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          delay: 0.35,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex min-h-[7.5rem] flex-col items-center px-8 pb-5 text-center">
          {p ? (
            <>
              {renaming ? (
                <input
                  autoFocus
                  value={draft}
                  maxLength={60}
                  aria-label="Tên playlist"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => setRenaming(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setRenaming(false);
                    }
                  }}
                  className="h-10 w-72 max-w-full rounded-xl border border-matcha-1 bg-white/10 px-3 text-center text-xl font-extrabold outline-none"
                />
              ) : (
                <h2 className="max-w-[80%] truncate text-2xl font-extrabold tracking-tight">
                  {p.name}
                </h2>
              )}
              <p className="mt-1 text-sm">
                <span className="opacity-60">
                  {count} bài
                  {songs ? ` · ${minutes(totalDuration(songs))}` : ""}
                </span>
                {playingId === p._id && (
                  <span className="ml-2 rounded-full bg-matcha-1/20 px-2 py-0.5 text-xs font-semibold text-matcha-1">
                    Đang phát
                  </span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  onClick={play}
                  disabled={!count}
                  title={count ? undefined : "Playlist chưa có bài"}
                >
                  <Play size={16} aria-hidden="true" /> Phát
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/playlists/${p._id}`)}
                  className="!text-[#eef3e6]"
                >
                  Mở
                </Button>
                <PlaylistMenu
                  onRename={() => {
                    setDraft(p.name);
                    setRenaming(true);
                  }}
                  onDelete={remove}
                />
              </div>
            </>
          ) : (
            <>
              <form
                onSubmit={create}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-72 max-w-full">
                  <input
                    name="name"
                    maxLength={60}
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setCreateErr("");
                    }}
                    placeholder="Tên playlist"
                    aria-label="Tên playlist mới"
                    aria-describedby="new-playlist-count"
                    autoComplete="off"
                    className="h-10 w-full rounded-xl border border-white/25 bg-white/10 px-3 text-center text-xl font-extrabold outline-none focus:border-matcha-1"
                  />
                  <p
                    id="new-playlist-count"
                    className="mt-1 pr-2 flex justify-between gap-2 text-xs"
                  >
                    <span className="text-red-400" aria-live="polite">
                      {createErr ||
                        (newName && !newName.trim()
                          ? "Tên không được chỉ có khoảng trắng"
                          : "")}
                    </span>
                    <span className="text-white/50">{newName.length}/60</span>
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={busy || !newName.trim()}
                  aria-busy={busy}
                >
                  {busy ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      Đang tạo…
                    </>
                  ) : (
                    "Tạo"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
