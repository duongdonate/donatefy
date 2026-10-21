// Self-check cho playerSlice. Chạy: node src/app/slices/playerSlice.test.js
import assert from "node:assert/strict";
import reducer, {
  playContext,
  togglePlay,
  next,
  previous,
  playAt,
  reorderUpNext,
  songFailed,
  toggleShuffle,
  cycleRepeat,
  setVolume,
  toggleMute,
} from "./playerSlice.js";
import { getCurrentSong } from "../selectors/playerSelectors.js";

const songs = ["a", "b", "c", "d"].map((id, i) => ({ _id: `m${i}`, id }));
const run = (...actions) =>
  actions.reduce(reducer, reducer(undefined, { type: "@@init" }));
const current = (player) => getCurrentSong({ player })?._id;

// Chưa phát gì
assert.equal(current(run()), undefined);
assert.equal(run(togglePlay()).isPlaying, false);

// Bấm bài thứ 3
let s = run(playContext({ songs, startIndex: 2 }));
assert.equal(current(s), "m2");
assert.equal(s.isPlaying, true);

// Next tới cuối rồi hết queue thì dừng
s = reducer(s, next());
assert.equal(current(s), "m3");
s = reducer(s, next());
assert.equal(current(s), "m3");
assert.equal(s.isPlaying, false);

// Repeat all: vòng về đầu và cả previous cũng vòng
s = run(playContext({ songs, startIndex: 3 }), cycleRepeat());
assert.equal(s.repeat, "all");
s = reducer(s, next());
assert.equal(current(s), "m0");
s = reducer(s, previous());
assert.equal(current(s), "m3");

// playAt: nhảy tới vị trí trong order, bỏ qua vị trí không hợp lệ
s = run(playContext({ songs }), togglePlay(), playAt(3));
assert.equal(current(s), "m3");
assert.equal(s.isPlaying, true);
assert.equal(reducer(s, playAt(9)).position, 3);

// reorderUpNext: chỉ đổi phần sau bài đang phát, bài hiện tại và lịch sử giữ nguyên
s = run(playContext({ songs, startIndex: 1 }), reorderUpNext([3, 2]));
assert.deepEqual(s.order, [0, 1, 3, 2]);
assert.equal(current(s), "m1");
s = reducer(s, next());
assert.equal(current(s), "m3");
// payload không phải hoán vị của up next (thiếu bài, lẫn bài cũ) => bỏ qua
s = run(playContext({ songs, startIndex: 1 }));
assert.deepEqual(reducer(s, reorderUpNext([3])).order, [0, 1, 2, 3]);
assert.deepEqual(reducer(s, reorderUpNext([0, 3])).order, [0, 1, 2, 3]);

// cycleRepeat: off -> all -> one -> off
assert.equal(run(cycleRepeat(), cycleRepeat()).repeat, "one");
assert.equal(run(cycleRepeat(), cycleRepeat(), cycleRepeat()).repeat, "off");

// Shuffle giữ bài hiện tại, order là hoán vị đầy đủ; tắt shuffle quay về đúng bài
s = run(playContext({ songs, startIndex: 1 }), toggleShuffle());
assert.equal(current(s), "m1");
assert.equal(s.position, 0);
assert.deepEqual([...s.order].sort(), [0, 1, 2, 3]);
s = reducer(s, toggleShuffle());
assert.equal(current(s), "m1");
assert.deepEqual(s.order, [0, 1, 2, 3]);

// Bật shuffle trước rồi mới play: bài được bấm vẫn phát đầu tiên
s = run(toggleShuffle(), playContext({ songs, startIndex: 2 }));
assert.equal(current(s), "m2");

// Bài lỗi: skip, nhưng cả queue lỗi thì dừng thay vì skip vô hạn
s = run(playContext({ songs }), cycleRepeat());
s = reducer(s, songFailed());
assert.equal(current(s), "m1");
s = [songFailed(), songFailed(), songFailed()].reduce(reducer, s);
assert.equal(s.isPlaying, false);

// Volume / mute
s = run(setVolume(0.6), toggleMute());
assert.equal(s.muted, true);
assert.equal(s.volume, 0.6);
s = reducer(s, toggleMute());
assert.equal(s.muted, false);
s = run(setVolume(0), toggleMute());
assert.equal(s.volume, 0.5); // unmute từ 0 thì không im lặng

console.log("playerSlice: all checks passed");
