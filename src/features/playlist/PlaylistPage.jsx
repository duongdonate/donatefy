// Chi tiết playlist dạng lưới (playlist-detail-grid.html)
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCurrentPlaylist, getCurrentSong, getIsShuffle } from "../../app/selectors";
import { playContext, toggleShuffle } from "../../app/slices/playerSlice";
import { setCurrentPlaylist } from "../../app/slices/playlistSlice";
import { useToastContext } from "../../contexts/ToastContext";
import { Button } from "../../design";
import { focusRing } from "../../design/Button";
import Matcappa from "../../mascot/Matcappa";
import NotFound from "../../pages/NotFound";
import playlistService from "../../services/api/playlistService";
import songService from "../../services/api/songService";
import { insertAt } from "./insertAt";
import PlaylistHeader from "./PlaylistHeader";
import SongDialog from "./SongDialog";
import SongTile from "./SongTile";
import UndoBar from "./UndoBar";

const unwrap = (res) => (Array.isArray(res) ? res : res?.data ?? []);
const tileCls = `flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-matcha-4/50 bg-white/10 text-sm font-bold text-matcha-1 hover:bg-white/20 ${focusRing}`;

export default function PlaylistPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToastContext();
  const currentSong = useSelector(getCurrentSong);
  const currentPlaylist = useSelector(getCurrentPlaylist);
  const shuffle = useSelector(getIsShuffle);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]); // Task 7/8 cập nhật qua setSongs
  const [state, setState] = useState("loading"); // loading | ok | missing (server trả lỗi) | error (mạng)
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState(null); // null | { mode: "add" } | { mode: "edit", song }

  const [undo, setUndo] = useState(null); // tên bài đang chờ hoàn tác
  const pending = useRef(null); // { song, index, playlistId, timer }
  const idRef = useRef(null);
  const toastRef = useRef(showToast);
  toastRef.current = showToast;

  // Gửi lệnh xoá của bài đang chờ (nếu có); lỗi thì hiện lại thẻ
  const flush = useRef(() => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    setUndo(null);
    playlistService.removeSong(p.playlistId, { videoId: p.song.id }).catch(() => {
      if (idRef.current === p.playlistId)
        setSongs((cur) => (cur.some((s) => s.id === p.song.id) ? cur : insertAt(cur, p.song, p.index)));
      toastRef.current(`Chưa gỡ được "${p.song.name}", thử lại nha ~`);
    });
  }).current;

  // Đổi playlist hoặc rời trang: gửi ngay yêu cầu còn chờ (của playlist cũ)
  useEffect(() => {
    idRef.current = id;
    return () => {
      flush();
      idRef.current = null;
    };
  }, [id, flush]);

  useEffect(() => {
    let alive = true;
    setState("loading");
    Promise.all([playlistService.getById(id), songService.getSongs(id)])
      .then(([pl, res]) => {
        if (!alive) return;
        setPlaylist(pl);
        setSongs(unwrap(res));
        setState("ok");
      })
      .catch((err) => alive && setState(err?.isAxiosError ? "error" : "missing"));
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  if (state === "missing") return <NotFound />;
  if (state === "error")
    return (
      <div className="flex flex-col items-start gap-3 p-8 pt-28">
        <p>Không tải được playlist, thử lại sau nha ~</p>
        <Button onClick={() => setAttempt((n) => n + 1)}>Thử lại</Button>
      </div>
    );
  if (state === "loading") return <p className="p-8 pt-28 opacity-60">Đang tải…</p>;

  const playFrom = (startIndex) => {
    dispatch(setCurrentPlaylist(playlist));
    dispatch(playContext({ songs, startIndex }));
  };
  const onShuffle = () => {
    if (!shuffle) dispatch(toggleShuffle());
    playFrom(0);
  };
  const onAdd = () => {
    flush(); // dialog trả danh sách từ server: không để bài gỡ nào còn chờ
    setDialog({ mode: "add" });
  };
  const onEdit = (song) => {
    flush();
    setDialog({ mode: "edit", song });
  };
  const onRemove = (song) => {
    flush(); // bài gỡ trước đó còn chờ thì gửi luôn
    const index = songs.findIndex((s) => s.id === song.id);
    if (index < 0) return;
    setSongs(songs.filter((s) => s.id !== song.id));
    setUndo(song.name);
    pending.current = { song, index, playlistId: id, timer: setTimeout(flush, 5000) };
  };
  const onUndo = () => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    setUndo(null);
    setSongs((cur) => insertAt(cur, p.song, p.index));
  };

  return (
    <div className="h-full p-4 pl-24 pr-6 pt-24">
      <section
        aria-label={playlist.name}
        className="flex h-full flex-col overflow-hidden rounded-[28px] text-[#eef3e6] backdrop-blur-2xl [container-type:inline-size]"
        style={{ background: "radial-gradient(60cqw 40cqw at 22% 30%, rgba(73,115,0,.45), transparent 70%), rgba(10,16,9,.84)" }}
      >
        <PlaylistHeader playlist={playlist} songs={songs} onPlay={() => playFrom(0)} onShuffle={onShuffle} onAdd={onAdd} />
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-8 pb-6">
          {songs.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  aria-hidden="true"
                  className="h-28 w-28 rounded-full"
                  style={{ background: "repeating-radial-gradient(circle,rgba(104,142,49,.9) 0 2px,rgba(135,169,107,.8) 2px 5px)" }}
                />
                <Matcappa pose="hug-knees" size={96} />
                <p className="text-sm opacity-80">Dán một link YouTube để thêm bài đầu tiên nha ~</p>
                <button type="button" onClick={onAdd} className={`${tileCls} w-48`}>
                  <Plus size={20} aria-hidden="true" /> Thêm bài
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {songs.map((s, i) => (
                <SongTile
                  key={s.id}
                  song={s}
                  index={i}
                  playing={currentSong?.id === s.id && currentPlaylist?._id === playlist._id}
                  onPlay={playFrom}
                  onRemove={onRemove}
                  onEdit={onEdit}
                />
              ))}
              <button type="button" onClick={onAdd} className={tileCls}>
                <Plus size={24} aria-hidden="true" /> Thêm bài
              </button>
            </div>
          )}
        </div>
      </section>
      <UndoBar name={undo} onUndo={onUndo} />
      {dialog && (
        <SongDialog
          {...dialog}
          playlistId={playlist._id}
          existingIds={songs.map((s) => s.id)}
          onDone={(next) => {
            setSongs(next);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
