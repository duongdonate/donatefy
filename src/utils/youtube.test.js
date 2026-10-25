import test from "node:test";
import assert from "node:assert/strict";
import { parseYouTubeId, frameUrls } from "./youtube.js";

test("parseYouTubeId", () => {
  const id = "jfKfPfyJRdk";
  for (const t of [`https://www.youtube.com/watch?v=${id}&t=10`, `youtu.be/${id}?si=x`, `https://music.youtube.com/watch?v=${id}`, `https://youtube.com/shorts/${id}`, id, `  ${id} `])
    assert.equal(parseYouTubeId(t), id, t);
  for (const t of ["", "abc", "https://vimeo.com/123", "https://www.youtube.com/watch?v=short"]) assert.equal(parseYouTubeId(t), null, t);
});
test("frameUrls", () => assert.deepEqual(frameUrls("x").map((u) => u.split("/").pop()), ["hqdefault.jpg", "hq1.jpg", "hq2.jpg", "hq3.jpg"]));
