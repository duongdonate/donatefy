import { Play } from "lucide-react";
import { focusRing } from "../../design/Button";
import PlaylistMenu from "../library/PlaylistMenu";
import formatDuration from "../../utils/formatDuration";

const show = "opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100";

export default function SongTile({ song, index, playing, onPlay, onRemove, onEdit }) {
  return (
    <div onClick={() => onPlay(index)} className="group relative cursor-pointer rounded-2xl p-1.5 transition duration-200 hover:bg-white/10">
      <div className={`relative aspect-video overflow-hidden rounded-xl bg-white/10 shadow-lg ${playing ? "ring-2 ring-matcha-4" : ""}`}>
        {song.thumbnail && <img src={song.thumbnail} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />}
        <button
          type="button"
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
      </div>
      <div onClick={(e) => e.stopPropagation()} className={`absolute left-3.5 top-3.5 ${show}`}>
        <PlaylistMenu
          editLabel="Sửa"
          label={`Tuỳ chọn ${song.name}`}
          size={32}
          triggerClass="!bg-black/45 !text-white hover:!bg-black/65"
          menuClass="left-0 top-full mt-1"
          flipClass="bottom-full left-0 mb-1"
          onRename={() => onEdit(song)}
          onDelete={() => onRemove(song)}
        />
      </div>
      <b className={`mt-2 line-clamp-2 text-sm font-bold leading-snug ${playing ? "text-matcha-1" : ""}`}>{song.name}</b>
      <span className="block truncate text-xs opacity-60">{song.artist}</span>
    </div>
  );
}
