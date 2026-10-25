import { Play, Plus, Shuffle } from "lucide-react";
import { Button } from "../../design";
import { totalDuration } from "../library/libraryMath";

const fmtTotal = (sec) =>
  sec >= 3600 ? `${Math.floor(sec / 3600)} giờ ${Math.floor((sec % 3600) / 60)} phút` : `${Math.max(1, Math.round(sec / 60))} phút`;

export default function PlaylistHeader({ playlist, songs, onPlay, onShuffle, onAdd }) {
  const n = songs.length;
  return (
    <div className="flex shrink-0 items-center gap-6 px-8 pt-2">
      <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-matcha-4 shadow-2xl">
        {playlist.cover && <img src={playlist.cover} alt="" draggable={false} className="h-full w-full object-cover" />}
      </div>
      <div className="glass flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[.18em] text-matcha-1">Playlist</div>
          <h1 className="truncate text-3xl font-extrabold tracking-tight">{playlist.name}</h1>
          <p className="mt-1 text-sm opacity-60">{n ? `${n} bài · ${fmtTotal(totalDuration(songs))}` : "Chưa có bài nào"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
          <Button onClick={onPlay} disabled={!n}>
            <Play size={16} aria-hidden="true" /> Phát
          </Button>
          <Button variant="secondary" onClick={onShuffle} disabled={!n} className="!text-[#eef3e6]">
            <Shuffle size={16} aria-hidden="true" /> Trộn bài
          </Button>
          <Button variant="ghost" onClick={onAdd} className="border-2 border-dashed border-matcha-4 !text-matcha-1 hover:!bg-white/10">
            <Plus size={16} aria-hidden="true" /> Thêm bài
          </Button>
        </div>
      </div>
    </div>
  );
}
