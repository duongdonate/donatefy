# GĐ4a · Thư viện & Chi tiết playlist: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang Thư viện (A · Xoè bìa) và trang Chi tiết playlist dạng lưới 16:9 có thêm bài (một link, sửa tên, chọn 1/4 khung hình), sửa tên / bìa bài đã có, gỡ bài có hoàn tác, đổi tên / xoá playlist; backend lưu tên / bìa riêng theo playlist và trả bìa playlist cố định.

**Architecture:** Hai trang thường trong `AppShell` (header + rail) nằm trong `PlayerLayout`, nên Music Layer hiện ở đáy khi đang có nhạc (bạn chốt 23/10: thư viện, playlist phải có Music Layer) — **không** làm lớp phủ đè lên `/listen` như spec 6/7.5. Backend thêm trường `meta` (Map `videoId → { name, artist, thumbnail }`) vào `CustomPlaylist`, giữ `videos: [String]` nên **không cần chuyển dữ liệu cũ**. Logic thuần ở cả hai repo có test `node --test`.

**Tech Stack:** Frontend React 19, Redux Toolkit, Tailwind 3, framer-motion, lucide-react. Backend Express + Mongoose (repo `E:\music-player-app-master\backend`).

**Spec:** `docs/superpowers/specs/2026-10-21-ui-rebuild-design.md` (mục 7.5, 7.6, 8). Yêu cầu: `docs/report/donatefy-v2-plan.md` FR-30…FR-33, FR-35, TC-03. Bản mẫu: `.superpowers/brainstorm/playlists-options.html` phần **A** (dòng 44–62 CSS, 227–260 JS; **bỏ** đĩa trượt ra), `playlist-detail-grid.html`.

## Global Constraints

- Nhánh frontend `v2/library` (từ `v2/main`); nhánh backend `v2/playlist-api` (từ `main` của repo backend). Commit tiếng Việt, kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Thứ tự bài trong playlist không đổi được**, luôn theo ngày thêm (thứ tự trong `videos`); đổi thứ tự chỉ có ở hàng chờ (đã có). Không làm kéo thả trong playlist, không có API đổi thứ tự.
- Không sửa `src/app/**` có sẵn (reducer / selector / store), `src/contexts/**`. Phát playlist dùng `playContext({ songs, startIndex })` + `setCurrentPlaylist(playlist)` như v1.
- Không đụng giao diện v1 ngoài việc bỏ route `/v1` (memory `ignore-v1-ui`). File v1 không còn dùng để GĐ6 dọn.
- Không thêm thư viện. Phân quyền theo người dùng là GĐ3 (chưa làm): GĐ4a vẫn dùng API không token như hiện tại.
- Xem trước bài lấy ở client: oEmbed `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` (đã kiểm 23/10: cho CORS từ `localhost`) + 4 khung `https://i.ytimg.com/vi/<id>/{hqdefault,hq1,hq2,hq3}.jpg`; khung lỗi tải thì ẩn.
- Backend chỉ nhận `thumbnail` dạng ảnh `i.ytimg.com` của **chính** `videoId` đó (không cho lưu URL tuỳ ý).
- Mỗi task frontend: `npm test`, `npm run build`, `npx eslint` file đã đụng, preview không lỗi đỏ. Mỗi task backend: `npm test` (backend), gọi thử bằng `curl` lên backend local `http://localhost:8404` (bạn chạy), cập nhật `docs/openapi.yml` cùng commit.
- Soát cuối (memory `review-cost`): `graphify update .`, gói diff thu gọn, **Sonnet** (không đụng trình phát).

## Review Focus

1. **Mở thẳng link `/playlist/:id` sau khi tải lại trang** (link chia sẻ) → hiện đúng playlist, không bị đá về trang khác như v1. Test: Task 6 Step 3.
2. **Thêm bài đã có trong playlist / link hỏng / video bị xoá** → báo ngay dưới ô dán, nút Thêm khoá; không gửi request. Test: Task 4 `parseYouTubeId`, Task 7 Step 3.
3. **Gỡ bài rồi bấm Hoàn tác trong 5 giây, hoặc rời trang trong 5 giây** → hoàn tác: bài trở lại, không có request xoá; rời trang: request xoá vẫn được gửi (không mất thao tác). Test: Task 8 Step 2.
4. **Thư viện trống / 1 playlist / nhiều playlist, lăn chuột nhanh** → không vỡ bố cục, bìa "Tạo playlist" luôn ở cuối, lướt từng bìa. Test: Task 5 Step 3.
5. **Gửi `thumbnail` lạ hoặc `name` dài / rỗng lên backend** → 400, không lưu. Test: Task 1 `normalizeMeta`.

---

## File Structure

| Repo | File | Trách nhiệm |
|---|---|---|
| backend | `utils/playlistSongs.js`, `utils/playlistSongs.test.js` | Mới: `orderAndMerge`, `normalizeMeta` |
| backend | `models/CustomPlaylist.js` | Thêm `meta: Map` |
| backend | `routes/api.js`, `routes/public.js`, `services/songService.js` | add-song nhận meta; `PATCH /api/playlists/:id`; `GET /api/songs` theo thứ tự + meta; bìa cố định; remove-song xoá meta |
| backend | `docs/openapi.yml`, `package.json` | Cập nhật API; script `test` |
| frontend | `src/services/api/playlistService.js` | Sửa `addSong`, thêm `rename`, `editSong` |
| frontend | `src/utils/youtube.js`, `youtube.test.js` | Mới: `parseYouTubeId`, `frameUrls`, `fetchOembed` |
| frontend | `src/features/library/libraryMath.js`, `libraryMath.test.js` | Mới: `libraryOrder`, `fanTransform`, `totalDuration` |
| frontend | `src/features/library/LibraryPage.jsx`, `PlaylistMenu.jsx` | Trang Thư viện |
| frontend | `src/features/playlist/PlaylistPage.jsx`, `PlaylistHeader.jsx`, `SongTile.jsx`, `SongDialog.jsx`, `UndoBar.jsx` | Trang chi tiết |
| frontend | `src/routes/AppRouter.jsx`, `src/layouts/Rail.jsx`, `src/features/player/NowPlaying.jsx` | Route mới, bỏ `/v1` |

---

### Task 1: Backend · logic thuần + script test

**Files:**
- Create: `utils/playlistSongs.js`, `utils/playlistSongs.test.js` (repo backend)
- Modify: `package.json` (backend: `"test": "node --test"`)

**Interfaces:**
- Produces:
  - `orderAndMerge(videos: string[], songs: {id, name, artist, thumbnail, duration}[], meta: Record<string, {name?, artist?, thumbnail?}> | Map): Song[]`: trả bài theo đúng thứ tự `videos` (bỏ id không có bài), mỗi bài là bản sao có trường của `meta[id]` ghi đè (chỉ trường có giá trị), thêm `custom: true` nếu có ghi đè.
  - `normalizeMeta(videoId: string, input: {name?, artist?, thumbnail?}): { ok: true, meta } | { ok: false, error: string }`: `name` / `artist` trim, rỗng → bỏ trường, > 200 ký tự → lỗi `"Tên tối đa 200 ký tự"`; `thumbnail` phải khớp `^https://i\.ytimg\.com/vi/<videoId>/(hqdefault|hq1|hq2|hq3)\.jpg$` (đúng `videoId`), sai → lỗi `"Ảnh bìa không hợp lệ"`.
- [ ] **Step 1: Test** `utils/playlistSongs.test.js`:

```js
test("giữ thứ tự videos, bỏ id thiếu bài, ghi đè meta", () => {
  const songs = [{ id: "b", name: "B" }, { id: "a", name: "A", artist: "x" }];
  const out = orderAndMerge(["a", "zz", "b"], songs, { a: { name: "A mới" } });
  assert.deepEqual(out.map((s) => s.id), ["a", "b"]);
  assert.equal(out[0].name, "A mới");
  assert.equal(out[0].artist, "x");
  assert.equal(out[0].custom, true);
  assert.equal(out[1].custom, undefined);
});
test("meta là Map của mongoose", () => {
  const out = orderAndMerge(["a"], [{ id: "a", name: "A" }], new Map([["a", { artist: "y" }]]));
  assert.equal(out[0].artist, "y");
});
test("normalizeMeta", () => {
  const id = "jfKfPfyJRdk";
  assert.deepEqual(normalizeMeta(id, { name: "  Lofi  ", artist: "", thumbnail: `https://i.ytimg.com/vi/${id}/hq2.jpg` }),
    { ok: true, meta: { name: "Lofi", thumbnail: `https://i.ytimg.com/vi/${id}/hq2.jpg` } });
  assert.deepEqual(normalizeMeta(id, { name: "x".repeat(201) }), { ok: false, error: "Tên tối đa 200 ký tự" });
  assert.deepEqual(normalizeMeta(id, { thumbnail: "https://evil.com/a.jpg" }), { ok: false, error: "Ảnh bìa không hợp lệ" });
  assert.deepEqual(normalizeMeta(id, { thumbnail: "https://i.ytimg.com/vi/AAAAAAAAAAA/hq1.jpg" }), { ok: false, error: "Ảnh bìa không hợp lệ" });
});
```

- [ ] **Step 2:** `npm test` (backend) → FAIL (module chưa có). **Step 3:** viết `playlistSongs.js`. **Step 4:** `npm test` → pass.
- [ ] **Step 5: Commit** (backend, nhánh `v2/playlist-api`) `Feat: Logic trộn tên/bìa riêng của playlist và kiểm tra dữ liệu`

---

### Task 2: Backend · route playlist

**Files:**
- Modify: `models/CustomPlaylist.js`, `routes/api.js`, `routes/public.js`, `services/songService.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `orderAndMerge`, `normalizeMeta` (Task 1).
- Produces (API):
  - `CustomPlaylist.meta: { type: Map, of: new Schema({ name: String, artist: String, thumbnail: String }, { _id: false }), default: {} }`.
  - `POST /api/playlist/:id/add-song` body `{ videoIds: string[], name?, artist?, thumbnail? }`: meta chỉ nhận khi `videoIds.length === 1` (qua `normalizeMeta`, lỗi → 400 `{ error }`); bài chưa có trong `CustomSong` mới tạo (await, không ghi đè bài đã có); id đã có trong playlist thì bỏ qua; trả `{ playlist, added: number }`. Sửa lỗi hiện tại: sau `Res.error` vẫn chạy tiếp và trả lời lần hai.
  - `PATCH /api/playlists/:id` body `{ name?: string (1–60 sau trim), song?: { id, name?, artist?, thumbnail? } }`: đổi tên và / hoặc ghi meta của một bài đang có trong playlist (`song.id` không có → 404). Trả playlist (có `cover`).
  - `GET /api/songs?playlistId=` → `songService.getSongs` trả `orderAndMerge(playlist.videos, songsOfThoseIds, playlist.meta)`; truy vấn `CustomSong.find({ id: { $in: videos } })` thay cho tải toàn bộ; playlist không tồn tại → 404.
  - `GET /api/playlists`, `GET /playlists/:id` (public): `cover = playlist.thumbnail` (cố định), không gọi `getRandomPlaylistCover()` mỗi lần (vẫn dùng khi tạo).
  - `POST /api/playlists/:id/remove-song`: xoá luôn `meta[videoId]`.
  - `openapi.yml`: thêm `PATCH`, body mới của add-song, trường `meta` / `custom`.
- [ ] **Step 1: Viết thay đổi.**
- [ ] **Step 2: Thử bằng curl** trên backend local (playlist thử tạo mới, xoá khi xong): add-song với `name` + `thumbnail` hợp lệ → `GET /api/songs?playlistId=` có tên mới, `custom: true`, đúng thứ tự thêm; `thumbnail` lạ → 400; `PATCH` đổi tên 0 / 61 ký tự → 400; `GET /api/playlists` hai lần → `cover` giống nhau; remove-song rồi add lại → không còn tên cũ. Playlist cũ của bạn (không có `meta`) vẫn trả đủ bài.
- [ ] **Step 3: Commit** `Feat: API playlist lưu tên/bìa riêng, đổi tên, bìa cố định`

---

### Task 3: Frontend · route mới, bỏ `/v1`

**Files:**
- Modify: `src/routes/AppRouter.jsx`, `src/layouts/Rail.jsx`, `src/features/player/NowPlaying.jsx`, `src/layouts/AppShell.jsx`
- Create: `src/features/library/LibraryPage.jsx`, `src/features/playlist/PlaylistPage.jsx` (khung rỗng, Task 5/6 làm thật)

**Interfaces:**
- Produces: route `/library` → `<AppShell><LibraryPage/></AppShell>`, `/playlist/:id` → `<AppShell><PlaylistPage/></AppShell>`, cả hai trong `PlayerLayout` (Music Layer hiện khi có bài). Bỏ route `/v1` và `V1Layout`. Rail: "Trang chủ" `/listen`, "Thư viện" `/library`; bỏ "Bài đã thích" tới GĐ4b. `NowPlaying` nút "Mở thư viện" → `/library`. `AppShell` thêm `pb-28` cho vùng nội dung khi có bài và đường dẫn khác `/listen` (để Music Layer không che).
- [ ] **Step 1: Viết**; **Step 2: Kiểm tra tay**: `/library`, `/playlist/<id>` mở được, có header / rail; đang phát thì có Music Layer; `/v1` → 404.
- [ ] **Step 3: Commit** `Feat: Route Thư viện và Chi tiết playlist mới, bỏ giao diện v1`

---

### Task 4: Frontend · service + tiện ích YouTube + logic thư viện

**Files:**
- Modify: `src/services/api/playlistService.js`
- Create: `src/utils/youtube.js`, `src/utils/youtube.test.js`, `src/features/library/libraryMath.js`, `src/features/library/libraryMath.test.js`

**Interfaces:**
- Produces:
  - `playlistService.addSong(id, { videoId, name?, artist?, thumbnail? })` → `POST /api/playlist/${id}/add-song` body `{ videoIds: [videoId], name, artist, thumbnail }`; `rename(id, name)` / `editSong(id, song)` → `PATCH /api/playlists/${id}`.
  - `parseYouTubeId(text: string): string | null`: nhận `youtube.com/watch?v=ID` (có thêm tham số), `youtu.be/ID`, `music.youtube.com/watch?v=ID`, `youtube.com/shorts/ID`, hoặc chính ID 11 ký tự `[\w-]{11}`; còn lại `null`.
  - `frameUrls(id): string[]` = 4 URL `hqdefault, hq1, hq2, hq3`.
  - `fetchOembed(id): Promise<{ name, artist } | null>` (oEmbed: `title` → `name`, `author_name` → `artist`; lỗi / 401 / 404 → `null`).
  - `libraryOrder(playlists, playingId): Playlist[]`: playlist đang phát lên đầu, còn lại mới tạo trước (`createdAt` giảm dần); không đổi mảng gốc.
  - `fanTransform(offset: number): string`: đúng công thức bản mẫu dòng 249: `` `translateX(${o*15}cqw) translateY(${a*1.6}cqw) rotate(${o*5}deg) scale(${1 - Math.min(a,3)*.14})` `` với `a = |o|`; số `scale` làm tròn 2 chữ số (tránh `0.5800000000000001`).
  - `totalDuration(songs): number` (giây, bỏ `duration` thiếu).
- [ ] **Step 1: Test** `youtube.test.js` + `libraryMath.test.js`:

```js
test("parseYouTubeId", () => {
  const id = "jfKfPfyJRdk";
  for (const t of [`https://www.youtube.com/watch?v=${id}&t=10`, `youtu.be/${id}?si=x`, `https://music.youtube.com/watch?v=${id}`, `https://youtube.com/shorts/${id}`, id, `  ${id} `])
    assert.equal(parseYouTubeId(t), id, t);
  for (const t of ["", "abc", "https://vimeo.com/123", "https://www.youtube.com/watch?v=short"]) assert.equal(parseYouTubeId(t), null, t);
});
test("frameUrls", () => assert.deepEqual(frameUrls("x").map((u) => u.split("/").pop()), ["hqdefault.jpg", "hq1.jpg", "hq2.jpg", "hq3.jpg"]));
test("libraryOrder: đang phát lên đầu, rồi mới nhất", () => {
  const p = [{ _id: "a", createdAt: "2026-01-01" }, { _id: "b", createdAt: "2026-03-01" }, { _id: "c", createdAt: "2026-02-01" }];
  assert.deepEqual(libraryOrder(p, "a").map((x) => x._id), ["a", "b", "c"]);
  assert.deepEqual(libraryOrder(p, null).map((x) => x._id), ["b", "c", "a"]);
  assert.deepEqual(p.map((x) => x._id), ["a", "b", "c"]);
});
test("fanTransform", () => {
  assert.equal(fanTransform(0), "translateX(0cqw) translateY(0cqw) rotate(0deg) scale(1)");
  assert.equal(fanTransform(-1), "translateX(-15cqw) translateY(1.6cqw) rotate(-5deg) scale(0.86)");
  assert.equal(fanTransform(4), "translateX(60cqw) translateY(6.4cqw) rotate(20deg) scale(0.58)");
});
test("totalDuration", () => assert.equal(totalDuration([{ duration: 60 }, {}, { duration: 30.4 }]), 90.4));
```

- [ ] **Step 2–4:** chạy → FAIL → viết → pass. **Step 5: Commit** `Feat: Tiện ích link YouTube, thứ tự thư viện và service playlist`

---

### Task 5: Trang Thư viện (A · Xoè bìa)

**Files:**
- Modify: `src/features/library/LibraryPage.jsx`
- Create: `src/features/library/PlaylistMenu.jsx`

**Interfaces:**
- Consumes: `playlistService.getAll/create/rename/delete`, `songService.getSongs`, `setAllPlaylists`, `addPlaylist`, `removePlaylist`, `setCurrentPlaylist`, `playContext`, `getAllPlaylists`, `getCurrentPlaylist`, `getCurrentSong`, `libraryOrder`, `fanTransform`, `totalDuration`, `useConfirm`, `useToastContext().showToast`, `Matcappa`, `Glass`, `Button`, `IconButton`.
- Produces: `LibraryPage()`: khối tối như bản mẫu A (`rgba(10,16,9,.82)` + quầng matcha, bo 28px, lấp vùng nội dung), tiêu đề "Playlist của bạn" + số lượng, chữ ma; dải bìa xoè `container-type:inline-size`, bìa ở `offset` dùng `fanTransform`, `|offset| > 3` ẩn; bìa giữa có bóng + viền; **không** có đĩa trượt ra. Bìa = ảnh `playlist.cover`; bìa cuối là thẻ "Tạo playlist" (dấu +). Lướt: ‹ › (`IconButton`), ←/→ (khi focus trong trang, không phải ô nhập), lăn chuột trên dải bìa (cộng dồn như landing, một cú một bìa), bấm bìa bên cạnh. Dưới bìa giữa: tên, `${n} bài · ${phút}`, nhãn "Đang phát" (khi `currentPlaylist._id` trùng và có bài), nút "Phát" (tải bài → `setCurrentPlaylist` + `playContext({ songs, startIndex: 0 })`), "Mở" (→ `/playlist/:id`), ⋯ (`PlaylistMenu`: "Đổi tên" — ô nhập tại chỗ 1–60 ký tự, Enter lưu / Esc huỷ; "Xoá" — `useConfirm`, xoá xong toast). Bìa "Tạo playlist" ở giữa: ô nhập tên + "Tạo"; tạo xong bìa mới nằm giữa. Thư viện trống: Matcappa `hug-knees` + câu "Chưa có chồng đĩa nào, tạo cái đầu tiên nha ~" + thẻ Tạo.
- [ ] **Step 1: Viết.**
- [ ] **Step 2: Kiểm tra tay với dữ liệu thật**: lướt bằng nút / phím / lăn / bấm bìa; tạo playlist "Thử GĐ4a" → nằm giữa, toast; đổi tên; Phát → Music Layer hiện, nhãn "Đang phát"; xoá playlist thử (xác nhận) → biến mất.
- [ ] **Step 3: Review Focus 4**: tạm thời giả 0 / 1 / 12 playlist bằng `__store.dispatch(setAllPlaylists(...))` → không vỡ, thẻ Tạo luôn ở cuối; lăn nhanh 20 cú nhỏ → lướt 1 bìa. Chụp màn hình.
- [ ] **Step 4: Commit** `Feat: Trang Thư viện xoè bìa`

---

### Task 6: Trang Chi tiết playlist (lưới 16:9)

**Files:**
- Modify: `src/features/playlist/PlaylistPage.jsx`
- Create: `src/features/playlist/PlaylistHeader.jsx`, `src/features/playlist/SongTile.jsx`

**Interfaces:**
- Consumes: `playlistService.getById`, `songService.getSongs`, `setCurrentPlaylist`, `playContext`, `toggleShuffle` / `getIsShuffle`, `getCurrentSong`, `getCurrentPlaylist`, `totalDuration`, `formatDuration`, `Vinyl`, `Matcappa`.
- Produces:
  - `PlaylistPage()`: tự tải playlist theo `:id` (không phụ thuộc store đã có → sửa lỗi link chia sẻ v1); 404 → `NotFound`. Trạng thái `songs` cục bộ (Task 7/8 cập nhật).
  - `PlaylistHeader({ playlist, songs, onPlay, onShuffle, onAdd })`: dải ngang theo `playlist-detail-grid.html`: bìa vuông + `Vinyl` thò ra (nhãn = bìa), nhãn PLAYLIST, tên, `${n} bài · ${tổng thời lượng}`, nút "Phát" (primary), "Trộn bài" (bật shuffle nếu đang tắt rồi phát từ đầu), "Thêm bài" (+). Phát / Trộn khoá khi 0 bài.
  - `SongTile({ song, index, playing, onPlay, onRemove, onEdit })`: thẻ 16:9 (ảnh `song.thumbnail`), tên 2 dòng, kênh, thời lượng; bài đang phát (`currentSong.id === song.id` và `currentPlaylist._id` trùng) viền matcha-4 + nhãn "Đang phát"; ▶ giữa, ✕ "Gỡ khỏi playlist" góc phải, ⋯ "Sửa tên và bìa" góc trái — hiện khi rê chuột **và** khi thẻ có focus (`group-focus-within`). Bấm thẻ = phát từ bài đó.
  - Lưới `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`, ô cuối "+ Thêm bài". Trống: đĩa trống + Matcappa `hug-knees` + "Dán một link YouTube để thêm bài đầu tiên nha ~".
- [ ] **Step 1: Viết.**
- [ ] **Step 2: Kiểm tra tay**: HEHEHEHE 11 bài đúng thứ tự thêm, tổng thời lượng; Phát / Trộn / bấm thẻ → đúng bài, Music Layer + viền "Đang phát"; Tab tới thẻ thấy nút.
- [ ] **Step 3: Review Focus 1**: mở thẳng `/playlist/<id>` rồi tải lại trang → vẫn ở đúng playlist; id sai → 404.
- [ ] **Step 4: Commit** `Feat: Trang chi tiết playlist dạng lưới`

---

### Task 7: Hộp thêm bài / sửa bài (`SongDialog`)

**Files:**
- Create: `src/features/playlist/SongDialog.jsx`
- Modify: `src/features/playlist/PlaylistPage.jsx`

**Interfaces:**
- Consumes: `parseYouTubeId`, `frameUrls`, `fetchOembed` (Task 4), `playlistService.addSong` / `editSong`, `songService.getSongs`, `showToast`.
- Produces: `SongDialog({ mode: "add" | "edit", playlistId, existingIds: string[], song?, onDone(songs), onClose })`: hộp kính giữa màn hình (`role="dialog"`, `aria-modal`, Esc / ✕ đóng, focus ô đầu khi mở). Bố cục theo `playlist-detail-grid.html` (Thêm bài):
  - `add`: ô dán link (tự đọc khi dán / gõ, debounce 300ms) → `parseYouTubeId`; `null` → "Link này không phải YouTube rồi ~"; id có trong `existingIds` → "Bài này có trong chồng đĩa rồi ~" và khoá; hợp lệ → `fetchOembed` (lỗi → "Không đọc được video này, thử link khác nha ~") rồi hiện ô **Tên bài** và **Kênh** (điền sẵn, sửa được), 4 khung hình chọn 1 (`role="radiogroup"`, khung tải lỗi thì ẩn, mặc định khung đầu tải được), xem trước bìa + nhãn `Vinyl`. Nút "Thêm vào playlist": khoá khi đang gửi / chưa hợp lệ; gửi `addSong` với `name` / `artist` (chỉ gửi khi khác oEmbed) + `thumbnail` đã chọn; thành công → tải lại bài (`getSongs`) → `onDone(songs)`, toast `Đã thả "<tên>" vào chồng đĩa`.
  - `edit`: không có ô link; điền sẵn tên / kênh / bìa hiện tại của `song`; lưu bằng `editSong(playlistId, { id, name, artist, thumbnail })`.
  - Lỗi server → mapping thân thiện ("Quán đang mất sóng một chút, bạn thử lại sau nhé." khi mạng, câu `error` của backend khi 400).
- [ ] **Step 1: Viết**, gắn vào ô "+ Thêm bài", nút "Thêm bài" ở header, và ⋯ của thẻ.
- [ ] **Step 2: TC-03 (viết lại cho một link)**: dán link hỏng → báo; dán link bài đã có → báo, khoá; dán link hợp lệ, sửa tên, chọn khung 3, Thêm → thẻ mới cuối lưới đúng tên / bìa; tải lại vẫn đúng; bài đó trong playlist khác không đổi. Sửa tên bài có sẵn qua ⋯ → đổi ngay.
- [ ] **Step 3: Review Focus 2**: các trường hợp trên không gửi request (xem `read_network_requests`).
- [ ] **Step 4: Commit** `Feat: Thêm bài một link có chọn bìa, sửa tên bài trong playlist`

---

### Task 8: Gỡ bài có hoàn tác 5 giây

**Files:**
- Create: `src/features/playlist/UndoBar.jsx`
- Modify: `src/features/playlist/PlaylistPage.jsx`

**Interfaces:**
- Consumes: `playlistService.removeSong(id, { videoId })` (đường dẫn backend `POST /api/playlists/:id/remove-song`, đã khớp).
- Produces: bấm ✕ trên thẻ → ẩn thẻ ngay, hiện `UndoBar` (Glass nổi phía trên Music Layer: `Đã gỡ "<tên>"` + nút "Hoàn tác", tự đóng sau 5000ms, `role="status"`); hết 5s mới gọi `removeSong`; Hoàn tác → hiện lại đúng vị trí, không gọi API; gỡ bài thứ hai khi bài trước còn chờ → bài trước được gửi xoá ngay; rời trang (unmount) khi còn chờ → gửi xoá ngay. Lỗi xoá → hiện lại thẻ + toast lỗi.
- [ ] **Step 1: Viết.**
- [ ] **Step 2: Review Focus 3** (dùng playlist thử, không dùng playlist thật của bạn): gỡ → Hoàn tác trong 5s → bài trở lại, không có request `remove-song`; gỡ → chờ 5s → có 1 request, tải lại vẫn mất; gỡ rồi bấm "Thư viện" ngay → request vẫn được gửi.
- [ ] **Step 3: Commit** `Feat: Gỡ bài khỏi playlist có hoàn tác 5 giây`

### Checkpoint GĐ4a
- [ ] `npm test` (cả 2 repo), `npm run build` sạch; TC-03 qua.
- [ ] Soát cuối Sonnet theo memory `review-cost`.
- [ ] Bạn duyệt → merge `v2/library` → `v2/main`; backend `v2/playlist-api` → `main` của repo backend (bạn tự deploy Render).

## Ghi chú

- GĐ4b (tìm kiếm, bài đã thích) đã bỏ (25/10/2026).
- Đổi thứ tự bài trong playlist: không làm (bạn chốt 23/10).
- `playlistService.update` (PUT, backend không có) giữ nguyên, không dùng.
