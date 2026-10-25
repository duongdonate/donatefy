import { MoreHorizontal, Play, X } from "lucide-react";
import { focusRing } from "../../design/Button";
import formatDuration from "../../utils/formatDuration";

const show = "opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100";
const corner = `absolute top-2 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white hover:bg-black/65 ${show} ${focusRing}`;

export default function SongTile({ song, index, playing, onPlay, onRemove, onEdit }) {
  return (
    <div className="group relative rounded-2xl p-1.5 transition duration-200 hover:bg-white/10">
      <div className={`relative aspect-video overflow-hidden rounded-xl bg-white/10 shadow-lg ${playing ? "ring-2 ring-matcha-4" : ""}`}>
        {song.thumbnail && <img src={song.thumbnail} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />}
        <button
          type="button"
          onClick={() => onPlay(index)}
          aria-label={`Phát ${song.name}`}
          className={`absolute inset-0 grid place-items-center rounded-xl ${focusRing}`}
        >
          <span className={`grid h-11 w-11 place-items-center rounded-full bg-matcha-4/90 text-white shadow-lg ${show}`}>
            <Play size={20} fill="currentColor" aria-hidden="true" />
          </span>
        </button>
        {song.duration > 0 && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white transition-opacity group-hover:opacity-0">
            {formatDuration(song.duration)}
          </span>
        )}
        {playing && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-matcha-4/90 px-2 py-0.5 text-xs font-bold text-white">
            Đang phát
          </span>
        )}
        <button type="button" onClick={() => onEdit(song)} aria-label="Sửa tên và bìa" title="Sửa tên và bìa" className={`${corner} left-2`}>
          <MoreHorizontal size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onRemove(song)} aria-label="Gỡ khỏi playlist" title="Gỡ khỏi playlist" className={`${corner} right-2`}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <b className={`mt-2 line-clamp-2 text-sm font-bold leading-snug ${playing ? "text-matcha-1" : ""}`}>{song.name}</b>
      <span className="block truncate text-xs opacity-60">{song.artist}</span>
    </div>
  );
}
