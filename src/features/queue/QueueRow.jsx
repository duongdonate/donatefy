// Một dòng trong lớp phủ hàng chờ: tay nắm kéo, bìa nhỏ, tên (chạy chữ khi rê), thời lượng
import { motion, Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import Marquee from "../../components/Marquee";
import formatDuration from "../../utils/formatDuration";

// gripSize: vùng chạm của tay nắm (mobile 44px để ngón tay bấm trúng)
function Body({ song, index, onPlay, onMove, grip, gripSize = 20 }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 10) * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[.07]"
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: gripSize, height: gripSize }}>
        {grip}
      </span>
      <button
        type="button"
        onClick={onPlay}
        onKeyDown={(e) => {
          if (!onMove || !e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
          e.preventDefault();
          onMove(e.key === "ArrowUp" ? -1 : 1);
        }}
        aria-keyshortcuts={onMove ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1"
      >
        <span
          className="aspect-video w-16 shrink-0 rounded-md bg-white/10 bg-cover bg-center"
          style={{ backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : undefined }}
        />
        <span className="min-w-0 flex-1">
          <Marquee active={hover} instant className="text-sm font-semibold">
            {song.name}
          </Marquee>
          <span className="block truncate text-xs opacity-55">{song.artist}</span>
        </span>
        {song.duration > 0 && <span className="shrink-0 text-xs tabular-nums opacity-50">{formatDuration(song.duration)}</span>}
      </button>
    </motion.div>
  );
}

// Dòng kéo được (Tiếp theo)
// Chỉ tay nắm bắt đầu kéo; thân dòng để ngón tay cuộn dọc (touch-action: pan-y)
export function DraggableRow({ queueIndex, gripSize, ...props }) {
  const drag = useDragControls();
  return (
    <Reorder.Item
      value={queueIndex}
      dragListener={false}
      dragControls={drag}
      className="list-none select-none"
      style={{ touchAction: "pan-y" }}
      data-qi={queueIndex}
    >
      <Body
        {...props}
        gripSize={gripSize}
        grip={
          <span
            aria-hidden="true"
            onPointerDown={(e) => {
              e.preventDefault(); // không bôi đen chữ trên đường kéo
              drag.start(e);
            }}
            className="grid h-full w-full cursor-grab touch-none place-items-center opacity-45 hover:opacity-90 active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </span>
        }
      />
    </Reorder.Item>
  );
}

// Dòng tĩnh (Đã phát, phát lại từ đầu)
export function StaticRow({ gripSize, ...props }) {
  return (
    <li className="list-none">
      <Body {...props} gripSize={gripSize} grip={null} />
    </li>
  );
}
