// Chi tiết playlist dạng lưới (playlist-detail-grid.html)
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentPlaylist, getCurrentSong, getIsShuffle } from "../../app/selectors";
import { playContext, toggleShuffle } from "../../app/slices/playerSlice";
import { setCurrentPlaylist } from "../../app/slices/playlistSlice";
import useToast from "../../hooks/useToast";
import { Button } from "../../components";
import { focusRing } from "../../components/Button";
import { useDevice } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import Matcappa from "../../mascot/Matcappa";
import NotFound from "../../pages/NotFound";
import playlistService from "../../services/api/playlistService";
import songService from "../../services/api/songService";
import { insertAt } from "./insertAt";
import PlaylistHeader from "./PlaylistHeader";
import SongDialog from "./SongDialog";
import SongTile from "./SongTile";

const unwrap = (res) => (Array.isArray(res) ? res : res?.data ?? []);
const tileCls = `flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-matcha-4 bg-transparent text-sm font-bold text-matcha-1 hover:bg-white/20 ${focusRing}`;

// Số liệu trang playlist theo thiết bị: lề, khung tối đa, số cột lưới bài, cỡ bìa đầu trang.
// Mobile cuộn cả trang (khối tiêu đề cao), máy lớn chỉ cuộn lưới bài.
// padTopPlaying: đệm trên khi có bài (điện thoại: notch kèm thẻ nhạc mỏng cao thêm 48px)
const PLAYLIST = {
  [DEVICE.MOBILE]: { padX: 16, padTop: 64, padTopPlaying: 112, frame: Infinity, cols: 2, gap: 12, cover: 120, stacked: true, scrollWhole: true },
  [DEVICE.TABLET]: { padX: 24, padTop: 64, padTopPlaying: 64, frame: Infinity, cols: 3, gap: 16, cover: 144, stacked: false, scrollWhole: false },
  [DEVICE.DESKTOP]: { padX: 32, padTop: 64, padTopPlaying: 64, frame: 1280, cols: 4, gap: 16, cover: 144, stacked: false, scrollWhole: false },
};

export default function PlaylistPage() {
  const device = useDevice();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast, dismiss } = useToast();
  const currentSong = useSelector(getCurrentSong);
  const currentPlaylist = useSelector(getCurrentPlaylist);
  const shuffle = useSelector(getIsShuffle);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]); // Task 7/8 cập nhật qua setSongs
  const [state, setState] = useState("loading"); // loading | ok | missing (server trả lỗi) | error (mạng)
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState(null); // null | { mode: "add" } | { mode: "edit", song }

  const pending = useRef(null); // { song, index, playlistId, timer, toastId }
  const idRef = useRef(null);
  const toastRef = useRef(showToast);
  toastRef.current = showToast;

  // Gửi lệnh xoá của bài đang chờ (nếu có); lỗi thì hiện lại thẻ
  const flush = useRef(() => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    dismiss(p.toastId);
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
    const toastId = showToast(`Đã gỡ "${song.name}"`, {
      action: { label: "Hoàn tác", onClick: onUndo },
      duration: 5000,
    });
    pending.current = { song, index, playlistId: id, timer: setTimeout(flush, 5000), toastId };
  };
  const onUndo = () => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    dismiss(p.toastId);
    setSongs((cur) => insertAt(cur, p.song, p.index));
  };

  const layout = PLAYLIST[device];

  return (
    <>
      {/* Phủ kín như Thư viện: absolute inset-0, đệm riêng tránh notch */}
      <section
        aria-label={playlist.name}
        className={`absolute inset-0 text-[#eef3e6] [container-type:inline-size] ${layout.scrollWhole ? "overflow-y-auto overflow-x-hidden" : "overflow-clip"} pb-4`}
        style={{ paddingLeft: layout.padX, paddingRight: layout.padX, paddingTop: currentSong ? layout.padTopPlaying : layout.padTop, background: "radial-gradient(60cqw 40cqw at 22% 30%, rgba(73,115,0,.45), transparent 70%), rgba(10,16,9,.84)" }}
      >
        {/* Khung giữa: desktop tối đa 1280px */}
        <div className={`relative mx-auto flex w-full flex-col ${layout.scrollWhole ? "" : "h-full"}`} style={{ maxWidth: layout.frame }}>
        <div className="shrink-0">
          <Button variant="ghost" size="sm" aria-label="Về thư viện" onClick={() => navigate("/playlists")} className="!text-[#eef3e6] hover:!bg-white/10">
            <ArrowLeft size={16} aria-hidden="true" /> Thư viện
          </Button>
        </div>
        <PlaylistHeader playlist={playlist} songs={songs} onPlay={() => playFrom(0)} onShuffle={onShuffle} onAdd={onAdd} cover={layout.cover} stacked={layout.stacked} />
        <div className={`mt-4 pb-6 ${layout.scrollWhole ? "" : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden"}`}>
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
            <div className="grid" style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`, gap: layout.gap }}>
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
        </div>
      </section>
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
    </>
  );
}
