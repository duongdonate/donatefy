// Khung chờ trang playlist (mẫu B1): đúng bố cục PlaylistHeader + lưới SongTile, vệt sáng lướt qua
const bone =
  "relative overflow-hidden bg-white/10 after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/15 after:to-transparent motion-reduce:after:hidden";

export function HeaderSkeleton({ cover, stacked }) {
  return (
    <div aria-hidden="true" className={`flex shrink-0 gap-6 pt-2 ${stacked ? "flex-col items-start gap-4" : "items-center"}`}>
      <div className={`${bone} shrink-0 rounded-xl`} style={{ width: cover, height: cover }} />
      <div className={`glass flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-4 ${stacked ? "w-full" : "flex-1"}`}>
        <div className="flex flex-col gap-2">
          <div className={`${bone} h-3 w-16 rounded`} />
          <div className={`${bone} h-8 w-56 rounded-lg`} />
          <div className={`${bone} h-3.5 w-28 rounded`} />
        </div>
        <div className="flex gap-3">
          <div className={`${bone} h-10 w-24 rounded-full`} />
          <div className={`${bone} h-10 w-28 rounded-full`} />
          <div className={`${bone} h-10 w-28 rounded-full`} />
        </div>
      </div>
    </div>
  );
}

export function TilesSkeleton({ cols, gap }) {
  return (
    <div aria-hidden="true" className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
      {Array.from({ length: cols * 2 }, (_, i) => (
        <div key={i} className="p-1.5">
          <div className={`${bone} aspect-video rounded-xl`} />
        </div>
      ))}
    </div>
  );
}
