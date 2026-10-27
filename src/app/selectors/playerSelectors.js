// Bài hiện tại luôn được tính từ order + position, không lưu riêng
export const getCurrentSong = (state) => {
  const { queue, order, position } = state.player;
  return position >= 0 ? queue[order[position]] ?? null : null;
};
export const getIsPlaying = (state) => state.player.isPlaying;
export const getIsShowQueue = (state) => state.player.showQueue;
export const getAnnounce = (state) => state.player.announce;
export const getIsShowLyrics = (state) => state.player.showLyrics;
export const getQueue = (state) => state.player.queue;
export const getIsShuffle = (state) => state.player.shuffle;
export const getRepeat = (state) => state.player.repeat;
export const getVolume = (state) => state.player.volume;
export const getIsMuted = (state) => state.player.muted;
