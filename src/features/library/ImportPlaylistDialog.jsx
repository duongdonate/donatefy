// Hộp nhập playlist YouTube, cùng khung với hộp Thêm bài (SongDialog); mở qua usePopup ở LibraryPage
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Glass, IconButton } from "../../components";
import useDebounce from "../../hooks/useDebounce";
import { useDevice, useScreen } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import playlistService from "../../services/api/playlistService";
import { fetchPlaylistOembed } from "../../utils/youtube";
import { DIALOG } from "../playlist/SongDialog";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const OFFLINE = "Quán đang mất sóng một chút, bạn thử lại sau nhé.";
const inputBase =
  "h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 outline-none placeholder:text-[#eef3e6]/40 focus:border-matcha-1 focus:ring-2 focus:ring-matcha-1/20";

// Đọc link ở máy cho người dùng biết sớm; backend vẫn kiểm tra lại đầy đủ. Trả { listId } hoặc { problem }
const readLink = (raw) => {
  const text = raw.trim();
  if (!text) return {};
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { problem: "Link này chưa đúng rồi ~" };
  }
  if (!/(^|\.)youtube\.com$/i.test(url.hostname))
    return { problem: "Chỉ nhận link YouTube nha ~" };
  const listId = url.searchParams.get("list");
  if (!listId) return { problem: "Link cần là playlist (có list=…) nha ~" };
  if (listId.startsWith("RD"))
    return { problem: "Đây là Mix tự động, chưa nhập được nha ~" };
  if (listId === "LL" || listId === "WL")
    return { problem: "Đã thích / Xem sau là riêng tư, chưa nhập được nha ~" };
  return { listId };
};

// busyRef: cờ "đang gửi" dùng chung với popup để Esc / bấm ra nền không đóng giữa chừng
export default function ImportPlaylistDialog({
  busyRef,
  onDone,
  onExisting,
  onClose,
}) {
  const device = useDevice();
  const screen = useScreen();
  const layout = DIALOG[device];
  const inputCls = `${inputBase} ${layout.inputText}`;
  const root = useRef(null);
  const first = useRef(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [preview, setPreview] = useState(null); // { title, author, thumbnail } từ oEmbed
  const [checking, setChecking] = useState(false);
  const [unseen, setUnseen] = useState(false); // oEmbed không trả: thường là playlist Riêng tư
  const autoName = useRef(""); // tên vừa tự điền từ YouTube
  const debounced = useDebounce(url, 300);
  const { problem, listId } = readLink(url);
  const ready = !!listId && url === debounced && !checking;

  // Xem trước ảnh + tên playlist khi link hợp lệ; không xem được thì chỉ cảnh báo, backend quyết định
  useEffect(() => {
    let alive = true;
    const { listId: id } = readLink(debounced);
    setPreview(null);
    setUnseen(false);
    setChecking(!!id);
    if (!id) {
      // xoá link thì bỏ luôn tên đã tự điền (tên người dùng tự gõ thì giữ)
      const prev = autoName.current;
      autoName.current = "";
      return setName((cur) => (cur === prev ? "" : cur));
    }
    fetchPlaylistOembed(id).then((o) => {
      if (!alive) return;
      setChecking(false);
      if (!o) return setUnseen(true);
      setPreview(o);
      // Điền tên gốc; người dùng đã tự gõ tên khác thì giữ nguyên
      const prev = autoName.current;
      const title = o.title.slice(0, 60);
      autoName.current = title;
      setName((cur) => (!cur.trim() || cur === prev ? title : cur));
    });
    return () => {
      alive = false;
    };
  }, [debounced]);

  // Mở: focus ô link; đóng: trả focus về nút đã mở. Esc do popup lo
  useEffect(() => {
    const opener = document.activeElement;
    first.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const els = [...root.current.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.tabIndex >= 0,
    );
    const a = els[0],
      z = els.at(-1);
    if (e.shiftKey && document.activeElement === a)
      (e.preventDefault(), z.focus());
    else if (!e.shiftKey && document.activeElement === z)
      (e.preventDefault(), a.focus());
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || sending) return;
    setSending(true);
    busyRef.current = true;
    setServerErr("");
    try {
      const r = await playlistService.importFromYoutube(
        url.trim(),
        name.trim() || undefined,
      );
      busyRef.current = false; // xong rồi: cho popup đóng
      onDone(r);
    } catch (err) {
      busyRef.current = false;
      setSending(false);
      if (err?.playlistId) return onExisting(err.playlistId); // 409: đã nhập rồi
      setServerErr(
        err?.isAxiosError
          ? OFFLINE
          : (err?.error ?? "Chưa nhập được, thử lại nha ~"),
      );
    }
  };

  return (
    <Glass
      as="form"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-dlg-title"
      noValidate
      onSubmit={submit}
      onKeyDown={onKeyDown}
      blur={30}
      className={`w-full overflow-y-auto !border-white/15 !bg-[rgba(40,48,36,.72)] p-6 text-[#eef3e6] ${layout.sheet}`}
      style={
        device === DEVICE.MOBILE
          ? {
              maxHeight: screen.height - screen.keyboard - 16,
              marginBottom: screen.keyboard,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <h3 id="import-dlg-title" className="text-xl font-extrabold">
          Nhập playlist từ YouTube
        </h3>
        <IconButton
          label="Đóng"
          onClick={onClose}
          className="ml-auto !text-[#eef3e6] hover:!bg-white/10"
        >
          <X size={20} />
        </IconButton>
      </div>

      <div
        className="mt-5 grid gap-6"
        style={{ gridTemplateColumns: layout.columns }}
      >
        <fieldset disabled={sending} className="space-y-4">
          <div>
            <label
              htmlFor="import-url"
              className="mb-1 block text-xs font-semibold opacity-70"
            >
              Link playlist YouTube
            </label>
            <input
              id="import-url"
              ref={first}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setServerErr("");
              }}
              placeholder="Dán link, vd. youtube.com/playlist?list=PL…"
              autoComplete="off"
              type="url"
              inputMode="url"
              enterKeyHint="next"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!problem}
              aria-describedby="import-url-status"
              className={`${inputCls} ${problem ? "!border-red-400" : ""}`}
            />
            <p
              id="import-url-status"
              role="status"
              aria-live="polite"
              className={`mt-1 min-h-5 text-xs ${problem ? "text-red-300" : "opacity-70"}`}
            >
              {problem ||
                (sending
                  ? "Đang tạo playlist, có thể mất vài giây…"
                  : checking
                    ? "Đang đọc playlist…"
                    : unseen
                      ? "Không xem trước được, playlist có thể đang Riêng tư ~"
                      : "")}
            </p>
          </div>
          <div>
            <label
              htmlFor="import-name"
              className="mb-1 block text-xs font-semibold opacity-70"
            >
              Tên playlist (có thể sửa đổi)
            </label>
            <input
              id="import-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tự điền sau khi dán link"
              autoComplete="off"
              enterKeyHint="done"
              className={inputCls}
            />
          </div>
        </fieldset>

        <div aria-hidden="true" className="text-center">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-white/10 shadow-[0_16px_24px_-10px_rgba(0,0,0,.7)]">
            {preview?.thumbnail && (
              <img
                src={preview.thumbnail}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="mt-2 truncate text-sm font-bold">
            {preview?.title || "Chưa có playlist"}
          </div>
          {preview?.author && (
            <div className="truncate text-xs opacity-70">{preview.author}</div>
          )}
          <small className="mt-2 block text-xs leading-snug opacity-55">
            Nhận playlist Công khai, tối đa 500 bài. Mix tự động và playlist
            Riêng tư chưa thể nhập.
          </small>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-end gap-3 ${layout.stickyFooter ? "sticky -bottom-6 -mx-6 bg-[rgba(40,48,36,.96)] px-6 py-3" : ""}`}
      >
        {serverErr && (
          <p role="alert" className="mr-auto text-sm text-red-300">
            {serverErr}
          </p>
        )}
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={sending}
          className="!text-[#eef3e6] hover:!bg-white/10"
        >
          Huỷ
        </Button>
        <Button type="submit" disabled={!ready || sending} aria-busy={sending}>
          {sending ? (
            <>
              <Loader2
                size={16}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Đang tạo…
            </>
          ) : (
            "Tạo playlist"
          )}
        </Button>
      </div>
    </Glass>
  );
}
