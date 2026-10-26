// Hộp thêm bài / sửa bài (playlist-detail-grid.html, phần "Thêm bài")
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useToast from "../../hooks/useToast";
import { Button, Glass, IconButton, Vinyl } from "../../components";
import useDebounce from "../../hooks/useDebounce";
import playlistService from "../../services/api/playlistService";
import songService from "../../services/api/songService";
import { fetchOembed, frameUrls, parseYouTubeId } from "../../utils/youtube";
import { useDevice, useScreen } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const OFFLINE = "Quán đang mất sóng một chút, bạn thử lại sau nhé.";
const inputBase = "h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 outline-none placeholder:text-[#eef3e6]/40 focus:border-matcha-1 focus:ring-2 focus:ring-matcha-1/20";

// Mobile: tấm trượt từ dưới lên, chữ ô nhập 16px (iOS không tự phóng to), hàng nút dính đáy tấm (luôn ngay trên bàn phím).
// Máy lớn: hộp giữa màn như cũ.
const DIALOG = {
  [DEVICE.MOBILE]: { overlay: "flex items-end", sheet: "rounded-t-[28px] rounded-b-none", inputText: "text-base", columns: "1fr", stickyFooter: true },
  [DEVICE.TABLET]: { overlay: "grid place-items-center p-4", sheet: "max-h-full max-w-3xl rounded-[28px]", inputText: "text-sm", columns: "1fr 200px", stickyFooter: false },
  [DEVICE.DESKTOP]: { overlay: "grid place-items-center p-4", sheet: "max-h-full max-w-3xl rounded-[28px]", inputText: "text-sm", columns: "1fr 200px", stickyFooter: false },
};
const unwrap = (res) => (Array.isArray(res) ? res : res?.data ?? []);

export default function SongDialog({ mode, playlistId, existingIds = [], song, onDone, onClose }) {
  const { showToast } = useToast();
  const device = useDevice();
  const screen = useScreen();
  const layout = DIALOG[device];
  const inputCls = `${inputBase} ${layout.inputText}`;
  const isAdd = mode === "add";
  const root = useRef(null);
  const first = useRef(null);
  const sendingRef = useRef(false);
  const closeRef = useRef(onClose);
  const existingRef = useRef(existingIds);
  existingRef.current = existingIds;
  // onClose đổi mỗi lần render: giữ ở ref để effect mở/đóng chỉ chạy một lần; không đóng khi đang gửi
  closeRef.current = () => !sendingRef.current && onClose();
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(isAdd ? null : song.id);
  const [oembed, setOembed] = useState(null);
  const [problem, setProblem] = useState("");
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState(song?.name ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [thumb, setThumb] = useState(song && frameUrls(song.id).includes(song.thumbnail) ? song.thumbnail : null);
  const [bad, setBad] = useState(() => new Set());
  const [sending, setSending] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const debounced = useDebounce(url, 300);
  const pending = isAdd && url !== debounced; // chưa đọc xong ô link

  // Đọc link (chỉ chế độ thêm): kiểm tra ở máy, chỉ hỏi oEmbed khi link hợp lệ và chưa có trong playlist
  useEffect(() => {
    if (!isAdd) return;
    let alive = true;
    const id = parseYouTubeId(debounced);
    setVideoId(null);
    setOembed(null);
    setThumb(null);
    setBad(new Set());
    setName("");
    setArtist("");
    setProblem("");
    setChecking(false);
    if (!debounced.trim()) return;
    if (!id) return setProblem("Link này không phải YouTube rồi ~");
    if (existingRef.current.includes(id)) return setProblem("Bài này có trong chồng đĩa rồi ~");
    setChecking(true);
    fetchOembed(id).catch(() => null).then((o) => {
      if (!alive) return;
      setChecking(false);
      if (!o) return setProblem("Không đọc được video này, thử link khác nha ~");
      setVideoId(id);
      setOembed(o);
      setName(o.name ?? "");
      setArtist(o.artist ?? "");
    });
    return () => {
      alive = false;
    };
  }, [debounced, isAdd]);

  // Mở: focus ô đầu; đóng: trả focus về chỗ đã mở. Esc ở mức window.
  useEffect(() => {
    const opener = document.activeElement;
    first.current?.focus();
    const onEsc = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      opener?.focus?.();
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const els = [...root.current.querySelectorAll(FOCUSABLE)].filter((el) => el.tabIndex >= 0);
    const a = els[0], z = els.at(-1);
    if (e.shiftKey && document.activeElement === a) (e.preventDefault(), z.focus());
    else if (!e.shiftKey && document.activeElement === z) (e.preventDefault(), a.focus());
  };

  const markBad = (u) => setBad((b) => new Set(b).add(u));
  const urls = videoId ? frameUrls(videoId) : [];
  const cover = thumb && !bad.has(thumb) ? thumb : urls.find((u) => !bad.has(u)) ?? null; // mặc định: khung đầu tải được
  const nameT = (name ?? "").trim();
  const artistT = (artist ?? "").trim();
  const ready = !!videoId && !pending && !checking && !problem && !!nameT && !!cover;

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || sending) return;
    setSending(true);
    sendingRef.current = true;
    setServerErr("");
    try {
      if (isAdd) {
        await playlistService.addSong(playlistId, {
          videoId,
          name: nameT !== oembed.name ? nameT : undefined,
          artist: artistT !== oembed.artist ? artistT : undefined,
          thumbnail: cover,
        });
      } else {
        await playlistService.editSong(playlistId, { id: videoId, name: nameT, artist: artistT, thumbnail: cover });
      }
      const songs = unwrap(await songService.getSongs(playlistId));
      showToast(isAdd ? `Đã thả "${nameT}" vào chồng đĩa` : "Đã lưu bài ~");
      onDone(songs);
    } catch (err) {
      setServerErr(err?.isAxiosError ? OFFLINE : err?.error ?? "Chưa lưu được, thử lại nha ~");
      setSending(false);
      sendingRef.current = false;
    }
  };

  // Gắn ra body: nếu nằm trong khung trang (isolate) thì lớp z cao ở ngoài (notch) sẽ đè lên hộp
  return createPortal(
    <div
      className={`fixed inset-0 z-50 bg-[rgba(5,8,4,.5)] ${layout.overlay}`}
      // iOS: đẩy tấm lên trên bàn phím (Android đã co cửa sổ nên keyboard = 0)
      style={device === DEVICE.MOBILE ? { paddingBottom: screen.keyboard } : undefined}
      onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}
    >
      <Glass
        as="form"
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="song-dlg-title"
        noValidate
        onSubmit={submit}
        onKeyDown={onKeyDown}
        blur={30}
        className={`w-full overflow-y-auto !border-white/15 !bg-[rgba(40,48,36,.72)] p-6 text-[#eef3e6] ${layout.sheet}`}
        // Mobile: cao tối đa phần màn còn thấy (bàn phím mở thì innerHeight nhỏ lại)
        style={device === DEVICE.MOBILE ? { maxHeight: screen.height - screen.keyboard - 16 } : undefined}
      >
        <div className="flex items-center gap-3">
          <h3 id="song-dlg-title" className="text-xl font-extrabold">{isAdd ? "Thêm bài" : "Sửa bài"}</h3>
          <IconButton label="Đóng" onClick={() => closeRef.current()} className="ml-auto !text-[#eef3e6] hover:!bg-white/10">
            <X size={20} />
          </IconButton>
        </div>

        <div className="mt-5 grid gap-6" style={{ gridTemplateColumns: layout.columns }}>
          <div className="space-y-4">
            {isAdd && (
              <div>
                <label htmlFor="song-url" className="mb-1 block text-xs font-semibold opacity-70">Link YouTube</label>
                <input
                  id="song-url"
                  ref={first}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Dán link, vd. youtube.com/watch?v=wBXrNikQAI8"
                  autoComplete="off"
                  type="url"
                  inputMode="url"
                  enterKeyHint="next"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={!!problem}
                  aria-describedby="song-url-status"
                  className={`${inputCls} ${problem ? "!border-red-400" : ""}`}
                />
                <p id="song-url-status" role="status" aria-live="polite" className={`mt-1 min-h-5 text-xs ${problem ? "text-red-300" : "opacity-70"}`}>
                  {problem || (checking ? "Đang đọc video…" : "")}
                </p>
              </div>
            )}
            <fieldset disabled={!videoId} className={`grid grid-cols-2 gap-3 ${videoId ? "" : "opacity-35"}`}>
              <div>
                <label htmlFor="song-name" className="mb-1 block text-xs font-semibold opacity-70">Tên bài</label>
                <input id="song-name" ref={isAdd ? undefined : first} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tự điền sau khi dán link" enterKeyHint="next" className={inputCls} />
              </div>
              <div>
                <label htmlFor="song-artist" className="mb-1 block text-xs font-semibold opacity-70">Ca sĩ / kênh</label>
                <input id="song-artist" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Tự điền sau khi dán link" enterKeyHint="done" className={inputCls} />
              </div>
            </fieldset>
            <div className={videoId ? "" : "pointer-events-none opacity-35"}>
              {videoId && !cover && <p role="status" className="mb-1 text-xs text-red-300">Video này không có khung hình dùng được ~</p>}
              <div id="song-frames-label" className="mb-1 text-xs font-semibold opacity-70">Ảnh bìa · chọn một khung hình trong video</div>
              <div role="radiogroup" aria-labelledby="song-frames-label" className="grid grid-cols-4 gap-2">
                {urls.map((u, i) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={cover === u}
                    aria-label={`Khung hình ${i + 1}`}
                    onClick={() => setThumb(u)}
                    hidden={bad.has(u)}
                    className="relative aspect-video overflow-hidden rounded-lg bg-white/10 bg-cover bg-center outline-none focus-visible:ring-2 focus-visible:ring-matcha-1 aria-checked:ring-2 aria-checked:ring-matcha-1"
                    style={{ backgroundImage: `url(${u})` }}
                  >
                    {/* ảnh ẩn chỉ để biết khung nào tải lỗi */}
                    <img
                      src={u}
                      alt=""
                      className="hidden"
                      onError={() => markBad(u)}
                      onLoad={(e) => e.currentTarget.naturalWidth <= 120 && markBad(u)} // ảnh giả 120×90 của YouTube
                    />
                    {cover === u && <span aria-hidden="true" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-matcha-4 text-xs font-extrabold text-white">✓</span>}
                  </button>
                ))}
                {!videoId && Array.from({ length: 4 }, (_, i) => <div key={i} aria-hidden="true" className="aspect-video rounded-lg bg-white/10" />)}
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="text-center">
            <div className="relative mx-auto h-36 w-44">
              <Vinyl size={120} spinning={false} label={cover ? `url(${cover}) center/cover` : undefined} className="!absolute left-20 top-2" />
              <div className="absolute left-0 top-8 aspect-video w-32 rounded-lg bg-white/15 bg-cover bg-center shadow-[0_16px_24px_-10px_rgba(0,0,0,.7)]" style={{ backgroundImage: cover ? `url(${cover})` : undefined }} />
            </div>
            <div className="mt-2 truncate text-sm font-bold">{name || "Chưa có bài"}</div>
            <small className="mt-2 block text-xs leading-snug opacity-55">Ảnh bìa sẽ hiện trên dải bìa ở dock và trên nhãn đĩa than.</small>
          </div>
        </div>

        <div
          className={`mt-4 flex items-center justify-end gap-3 ${layout.stickyFooter ? "sticky -bottom-6 -mx-6 bg-[rgba(40,48,36,.96)] px-6 py-3" : ""}`}
        >
          {serverErr && <p role="alert" className="mr-auto text-sm text-red-300">{serverErr}</p>}
          <Button variant="ghost" onClick={() => closeRef.current()} className="!text-[#eef3e6] hover:!bg-white/10">Huỷ</Button>
          <Button type="submit" disabled={!ready || sending}>{isAdd ? "Thêm vào playlist" : "Lưu"}</Button>
        </div>
      </Glass>
    </div>,
    document.body
  );
}
