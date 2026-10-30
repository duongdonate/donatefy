import { Play, Plus, RefreshCw, Shuffle } from "lucide-react";
import { Button, YoutubeTag } from "../../components";
import { totalDuration } from "../library/libraryMath";

const fmtTotal = (sec) =>
  sec >= 3600
    ? `${Math.floor(sec / 3600)} giờ ${Math.floor((sec % 3600) / 60)} phút`
    : `${Math.max(1, Math.round(sec / 60))} phút`;

// stacked (mobile): bìa ở trên, thẻ tiêu đề + nút ở dưới, nút tự xuống dòng
// onSync: chỉ có với playlist nhập từ YouTube
export default function PlaylistHeader({
  playlist,
  songs,
  onPlay,
  onShuffle,
  onAdd,
  onSync,
  syncing = false,
  cover = 144,
  stacked = false,
}) {
  const n = songs.length;
  const source = playlist.source?.playlistId ? playlist.source : null; // playlist nhập từ YouTube
  return (
    <div
      className={`flex shrink-0 gap-6 pt-2 ${stacked ? "flex-col items-start gap-4" : "items-center"}`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-matcha-4 shadow-2xl"
        style={{ width: cover, height: cover }}
      >
        {playlist.cover && (
          <img
            src={playlist.cover}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        )}
        {source && <YoutubeTag className="bottom-2 left-2" />}
      </div>
      <div
        className={`glass flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-4 ${stacked ? "w-full" : "flex-1"}`}
      >
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[.18em] text-matcha-1 mb-2">
            Playlist
            {source && (
              <>
                {" from "}
                <a
                  href={`https://www.youtube.com/playlist?list=${encodeURIComponent(source.playlistId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở playlist gốc trên YouTube"
                  className="rounded bg-matcha-1/20 px-1.5 py-0.5 transition-colors hover:bg-matcha-1/35 hover:text-[#eef3e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1"
                >
                  YouTube URL
                </a>
              </>
            )}
          </div>
          <h1 className="truncate text-3xl font-extrabold tracking-tight">
            {playlist.name}
          </h1>
          <p className="mt-1 text-sm opacity-60">
            {n
              ? `${n} bài · ${fmtTotal(totalDuration(songs))}`
              : "Chưa có bài nào"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
          <Button onClick={onPlay} disabled={!n}>
            <Play size={16} aria-hidden="true" /> Phát
          </Button>
          <Button
            variant="secondary"
            onClick={onShuffle}
            disabled={!n}
            className="!text-[#eef3e6]"
          >
            <Shuffle size={16} aria-hidden="true" /> Trộn bài
          </Button>
          {onSync && (
            <Button
              variant="secondary"
              onClick={onSync}
              disabled={syncing}
              aria-busy={syncing}
              className="!text-[#eef3e6]"
            >
              <RefreshCw
                size={16}
                aria-hidden="true"
                className={
                  syncing ? "animate-spin motion-reduce:animate-none" : ""
                }
              />
              {syncing ? "Đang lấy…" : "Lấy bài mới"}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onAdd}
            className="border-2 border-dashed border-matcha-4 !text-matcha-1 hover:!bg-white/10"
          >
            <Plus size={16} aria-hidden="true" /> Thêm bài
          </Button>
        </div>
      </div>
    </div>
  );
}
