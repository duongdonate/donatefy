import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSong } from "../../app/selectors";
import { playAt } from "../../app/slices/playerSlice";
import PlayingIcon from "../PlayingIcon";
import Marquee from "../Marquee";

function QueueRow({ song, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-background-hover transition-colors"
    >
      <img
        src={song.thumbnail}
        alt=""
        className="w-14 aspect-video rounded object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{song.name}</p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>
    </button>
  );
}

function QueueContainer() {
  const { queue, order, position, repeat } = useSelector((state) => state.player);
  const currentSong = useSelector(getCurrentSong);
  const dispatch = useDispatch();

  // Các bài sắp phát theo thứ tự order (đã tính shuffle); repeat all thì nối lại từ đầu
  const positions = [...order.keys()].slice(position + 1);
  if (repeat === "all") positions.push(...[...order.keys()].slice(0, position));
  const upNext = positions.map((pos) => ({ pos, song: queue[order[pos]] }));

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 256, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
      exit={{ width: 0, opacity: 0, transition: { duration: 0.2 } }}
      aria-label="Queue"
      className="h-full shrink-0 bg-background text-foreground rounded-lg overflow-hidden"
    >
      <div className="w-64 h-full flex flex-col">
        <h2 className="px-4 pt-4 pb-2 text-lg font-bold">Queue</h2>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          <section>
            <h3 className="px-2 pb-1 text-sm font-semibold text-muted-foreground">
              Now playing
            </h3>
            {currentSong ? (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-hover">
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
                <PlayingIcon size={16} className="shrink-0" />
              </div>
            ) : (
              <p className="px-2 text-sm text-muted-foreground">Chưa phát bài nào</p>
            )}
          </section>

          <section>
            <h3 className="px-2 pb-1 text-sm font-semibold text-muted-foreground">
              Next up
            </h3>
            {upNext.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">Hết hàng chờ</p>
            ) : (
              upNext.map(({ pos, song }) => (
                <QueueRow
                  key={`${song._id}-${pos}`}
                  song={song}
                  onClick={() => dispatch(playAt(pos))}
                />
              ))
            )}
          </section>
        </div>
      </div>
    </motion.aside>
  );
}

export default QueueContainer;
