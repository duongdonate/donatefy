// Thời gian phát + lệnh tua / chuyển bài dùng chung cho Music Layer, Now Playing, phím tắt.
// Thời gian đổi nhiều lần mỗi giây nên ở context, không đưa vào Redux.
import { createContext, useContext } from "react";

const noop = () => {};
export const PlaybackTimeContext = createContext({
  currentTime: 0,
  duration: 0,
  seek: noop,
  previous: noop,
  next: noop,
  togglePlay: noop,
});

export const usePlaybackTime = () => useContext(PlaybackTimeContext);
