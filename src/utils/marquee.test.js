// Self-check: node src/utils/marquee.test.js
import assert from "node:assert/strict";
import { marqueeKeyframes } from "./marquee.js";

// 352px text + 48px gap = 400px, 40px/s => 10s trượt + 2s dừng = 12s
const { duration, keyframes } = marqueeKeyframes(352);
assert.equal(duration, 12000);
assert.equal(keyframes[1].offset, 2 / 12);
assert.equal(keyframes[2].transform, "translateX(-400px)");

// Text dài gấp đôi => thời gian trượt gấp đôi (tốc độ không đổi theo độ dài)
const long = marqueeKeyframes(752);
assert.equal(long.duration - 2000, (duration - 2000) * 2);

// Không dừng thì keyframe đầu và giữa trùng offset 0
assert.equal(marqueeKeyframes(100, { pause: 0 }).keyframes[1].offset, 0);

console.log("marquee: all checks passed");
