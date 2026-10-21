import { useState } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSong } from "../../app/selectors";
import { playAt, reorderUpNext } from "../../app/slices/playerSlice";
import useLocalStorage from "../../hooks/useLocalStorage";
import PlayingIcon from "../PlayingIcon";
import Marquee from "../Marquee";

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const KEY_STEP = 16; // px mỗi lần bấm phím mũi tên trên tay nắm
const clampWidth = (w) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));

function SongInfo({ song }) {
  return (
    <>
      <img
        src={song.thumbnail}
        alt=""
        className="w-14 aspect-video rounded object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{song.name}</p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>
    </>
  );
}

// 1 bài trong "Next up": kéo bằng tay nắm, bấm vào để phát, Alt + ↑/↓ để đổi chỗ bằng bàn phím
function QueueItem({ queueIndex, song, onPlay, onMove }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={queueIndex}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.02, zIndex: 10 }}
      className="relative list-none rounded-lg bg-background select-none"
    >
      <div className="group flex items-center rounded-lg hover:bg-background-hover transition-colors">
        <span
          onPointerDown={(e) => {
            e.preventDefault(); // không cho trình duyệt bắt đầu bôi đen chữ trên đường kéo
            dragControls.start(e);
          }}
          aria-hidden="true"
          className="touch-none cursor-grab active:cursor-grabbing px-1 py-3 text-muted-foreground opacity-0 group-hover:opacity-100"
        >
          <GripVertical size={16} />
        </span>
        <button
          onClick={onPlay}
          onKeyDown={(e) => {
            if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown"))
              return;
            e.preventDefault();
            onMove(e.key === "ArrowUp" ? -1 : 1);
          }}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          className="min-w-0 flex-1 flex items-center space-x-3 py-2 pr-2 text-left"
        >
          <SongInfo song={song} />
        </button>
      </div>
    </Reorder.Item>
  );
}

function QueueContainer() {
  const { queue, order, position, repeat } = useSelector(
    (state) => state.player,
  );
  const currentSong = useSelector(getCurrentSong);
  const dispatch = useDispatch();

  const [storedWidth, setStoredWidth] = useLocalStorage("queueWidth", 300);
  const width = clampWidth(storedWidth); // giá trị cũ trong localStorage có thể nằm ngoài min/max
  const [resizing, setResizing] = useState(false);

  // Giá trị của Reorder là index trong queue (duy nhất, ổn định khi đổi chỗ)
  const upNext = order.slice(position + 1);
  // Repeat all: các bài trước sẽ phát lại sau khi hết; chỉ hiển thị, không kéo thả
  const replayFromStart =
    repeat === "all" ? [...order.keys()].slice(0, position) : [];

  const moveItem = (from, step) => {
    const to = from + step;
    if (to < 0 || to >= upNext.length) return;
    const next = [...upNext];
    [next[from], next[to]] = [next[to], next[from]];
    dispatch(reorderUpNext(next));
  };

  // Panel nằm bên phải nên kéo tay nắm sang trái là rộng ra
  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    setResizing(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMove = (ev) =>
      setStoredWidth(clampWidth(startWidth + startX - ev.clientX));
    const onUp = () => {
      setResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const resizeByKey = (e) => {
    const delta = { ArrowLeft: KEY_STEP, ArrowRight: -KEY_STEP }[e.key];
    if (delta) setStoredWidth(clampWidth(width + delta));
    else if (e.key === "Home") setStoredWidth(MIN_WIDTH);
    else if (e.key === "End") setStoredWidth(MAX_WIDTH);
    else return;
    e.preventDefault();
  };

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0, transition: { duration: 0.2 } }}
      // Khi đang kéo thì bám theo chuột ngay, không tween
      transition={
        resizing ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }
      }
      aria-label="Queue"
      className="relative h-full shrink-0 bg-background text-foreground rounded-lg overflow-hidden"
    >
      {/* Tay nắm đổi độ rộng */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Đổi độ rộng hàng chờ"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={width}
        tabIndex={0}
        onPointerDown={startResize}
        onKeyDown={resizeByKey}
        className={`absolute left-0 inset-y-0 z-20 w-1.5 cursor-col-resize transition-colors hover:bg-primary focus-visible:bg-primary focus-visible:outline-none ${
          resizing ? "bg-primary" : ""
        }`}
      />

      <div className="h-full flex flex-col" style={{ width }}>
        <h2 className="px-4 pt-4 pb-2 text-lg font-bold">Queue</h2>

        <motion.div
          layoutScroll
          className="flex-1 overflow-y-auto px-2 pb-4 space-y-4"
        >
          <section>
            <h3 className="px-2 pb-1 text-sm font-semibold text-muted-foreground">
              Now playing
            </h3>
            {currentSong ? (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-hover">
                <PlayingIcon size={16} className="shrink-0" />
                <img
                  src={currentSong.thumbnail}
                  alt=""
                  className="w-14 aspect-video rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Marquee className="font-medium text-primary">
                    {currentSong.name}
                  </Marquee>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            ) : (
              <p className="px-2 text-sm text-muted-foreground">
                Chưa phát bài nào
              </p>
            )}
          </section>

          <section>
            <h3 className="px-2 pb-1 text-sm font-semibold text-muted-foreground">
              Next up
            </h3>
            {upNext.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">Hết hàng chờ</p>
            ) : (
              <Reorder.Group
                axis="y"
                values={upNext}
                onReorder={(next) => dispatch(reorderUpNext(next))}
                className="space-y-1"
              >
                {upNext.map((queueIndex, i) => (
                  <QueueItem
                    key={queue[queueIndex]._id + "-" + queueIndex}
                    queueIndex={queueIndex}
                    song={queue[queueIndex]}
                    onPlay={() => dispatch(playAt(position + 1 + i))}
                    onMove={(step) => moveItem(i, step)}
                  />
                ))}
              </Reorder.Group>
            )}
          </section>

          {replayFromStart.length > 0 && (
            <section>
              <h3 className="px-2 pb-1 text-sm font-semibold text-muted-foreground">
                Sau đó phát lại từ đầu
              </h3>
              {replayFromStart.map((pos) => (
                <button
                  key={`${queue[order[pos]]._id}-${pos}`}
                  onClick={() => dispatch(playAt(pos))}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-background-hover transition-colors"
                >
                  <SongInfo song={queue[order[pos]]} />
                </button>
              ))}
            </section>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}

export default QueueContainer;
