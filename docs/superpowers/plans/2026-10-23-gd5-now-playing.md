# GĐ5 · Now Playing & Hàng chờ: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến `/listen` thành màn Now Playing (đĩa than, cần đọc, tiến trình, dock 5 bìa, thanh kính phải C) có lớp phủ hàng chờ, phím tắt, mascot theo trạng thái; tách `MusicPlayer` thành bộ phát ẩn + context thời gian; thêm **Music Layer**: thanh phát mini dính đáy ở mọi trang trong app (trừ `/listen`) với nút mở rộng thành Now Playing.

**Architecture:** `PlayerEngine` (ẩn) giữ `ReactPlayer` và các dispatch như cũ, cung cấp `PlaybackTimeContext` (`currentTime`, `duration`, `seek`, `previous`). Engine mount trong route layout `PlayerLayout` bao mọi trang cần đăng nhập, nên nhạc chạy song song, không ngắt khi đổi trang; landing không tải `react-player`. Khi đã có bài, `PlayerLayout` luôn hiện thanh `MusicPlayer` cũ (Music Layer, giữ nguyên giao diện) ở đáy mọi trang, trừ `/listen` (đã là màn mở rộng). Vào landing = huỷ trình phát (`resetPlayer`). Logic thuần (dock, slider, phím tắt, đổi chỗ, mascot, luật "bài trước") nằm trong file `.js` có test.

> **Đổi theo ý bạn (23/10):** (1) Music Layer dính đáy luôn hiện khi đã có nhạc, ở mọi trang trong app (thư viện, playlist…), có nút mở rộng sang Now Playing; chưa có nhạc thì không có thanh. (2) Vào landing thì huỷ trình phát. (3) Bố cục điện thoại để GĐ6 (responsive), không làm ở GĐ5. (4) Backend dùng link Render trong `.env` (`https://donatefy-backend.onrender.com`).

**Tech Stack:** React 19, Redux Toolkit, react-player 2 (`react-player/youtube`), framer-motion 12 (`layoutId`, `Reorder`), Tailwind 3, lucide-react, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-21-ui-rebuild-design.md` (mục 3, 4.5, 5, 7.3, 7.4, 8, 9, 10). Yêu cầu gốc: `docs/report/donatefy-v2-plan.md` mục 6.3, 6.4, FR-10…FR-17, FR-20…FR-22, FR-50, FR-52, TC-04…TC-06. Bản mẫu: `.superpowers/brainstorm/visual-direction-v3.html` (trung tâm, dock; **bỏ** 2 khối 3D), `controls-options.html` phương án C, `queue-overlay.html`.

## Global Constraints

- Nhánh `v2/now-playing` (cắt từ `v2/main`). Commit tiếng Việt, kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Không sửa** reducer có sẵn trong `src/app/slices/playerSlice.js`, `src/app/store.js`, `src/app/selectors/*`, `src/services/**`, `src/contexts/**`, `src/utils/**`. Đọc state player bằng `useSelector((s) => s.player.<field>)` hoặc selector có sẵn.
- Luồng một chiều giữ nguyên: Redux → `ReactPlayer` (url / playing / volume / loop); `onPlay` / `onPause` / `onEnded` / `onError` → dispatch. Thời gian phát **không** đưa vào Redux.
- Không thêm thư viện.
- Thanh kính phải (phương án C) **luôn hiện**; header + rail tự ẩn (đã có `AppShell`).
- Màu / font / chuyển động theo kế hoạch GĐ1. Đĩa quay 6s/vòng (`Vinyl`), cần đọc xoay −18° khi dừng, chuyển 0,8s `cubic-bezier(.3,1.3,.5,1)`. Reduced motion: đĩa không quay, cần đọc / bìa bay / mascot đổi tức thì.
- Mọi nút chỉ có icon có `aria-label` tiếng Việt; nút bật/tắt có `aria-pressed`; thanh trượt `role="slider"` + `aria-valuemin/max/now` + `aria-valuetext`.
- Mỗi task: `npm test` qua, `npm run build` sạch, `npx eslint` file đã đụng sạch, preview `donatefy-dev` không lỗi đỏ ngoài lỗi mạng khi backend tắt.
- **Backend Render chặn CORS từ `localhost`** (kiểm 23/10: chỉ cho `https://donatefy.vercel.app`). Tới khi backend cho phép `http://localhost:3000`, dựng hàng chờ thử bằng `store.dispatch(playContext(...))` qua `window.__store` **chỉ trong DEV** (Task 1 gắn `if (import.meta.env.DEV) window.__store = store` trong `main.jsx`) với vài `videoId` YouTube công khai.

## Review Focus

1. **Đổi trang khi đang phát** (`/listen` → `/v1` → `/playlist/:id` → `/listen`) → nhạc không ngắt, không khởi động lại, thời gian chạy tiếp; Music Layer hiện ở `/v1`, `/playlist/:id`, ẩn ở `/listen`; vào landing rồi đăng nhập lại thì không còn bài cũ. Test: Task 1 Step 6, Task 3 Step 3.
2. **Bấm "Bài trước" khi đã phát > 3 giây** → về đầu bài; ≤ 3 giây → lùi bài; bài đầu và không lặp tất cả → về đầu bài. Test: Task 1 `previousAction`.
3. **Phím tắt khi đang gõ trong ô nhập** (Space, M, Q, ←/→) → không bắt; phím có Ctrl/Meta/Alt (trừ Alt+↑/↓ trong hàng chờ) → không bắt. Test: Task 2 `hotkeyAction`.
4. **Hàng chờ ít hơn 5 bài, bài đầu, bài cuối** → dock không có ô trống xấu, nút ‹ › khoá đúng lúc; hàng chờ trống → trạng thái trống. Test: Task 2 `dockWindow`, Task 5 Step 3.
5. **Shuffle bật rồi tắt khi đang phát** → nhạc không ngắt, "Tiếp theo" đổi đúng thứ tự (TC-04). Test: Task 7 Step 5.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/features/player/PlaybackTime.jsx` | Context `currentTime`, `duration`, `seek`, `previous`; hook `usePlaybackTime()` |
| `src/features/player/PlayerEngine.jsx` | Bộ phát ẩn: `ReactPlayer`, dispatch sự kiện, lưu âm lượng, Media Session |
| `src/features/player/playerMath.js`, `playerMath.test.js` | Logic thuần: `previousAction`, `parseSavedVolume`, `dockWindow`, `valueFromPointer`, `moveItem`, `hotkeyAction`, `mascotFor` |
| `src/components/MusicPlayer/MusicPlayer.jsx` | Music Layer: **giữ giao diện**, sửa logic đọc `usePlaybackTime()` (Task 1), thêm nút mở rộng (Task 3) |
| `src/main.jsx`, `src/routes/AppRouter.jsx` | Sửa: bỏ `<MusicPlayer />` khỏi `main.jsx`; route layout `PlayerLayout` mount `PlayerEngine` + Music Layer (thanh `MusicPlayer` cũ) |
| `src/features/player/NowPlaying.jsx`, `Tonearm.jsx`, `ProgressBar.jsx` | Trung tâm màn chính |
| `src/features/player/Dock.jsx` | Dock 5 bìa |
| `src/features/player/GlassBar.jsx`, `VolumeSlider.jsx` | Thanh kính phải C |
| `src/features/queue/QueueOverlay.jsx`, `QueueRow.jsx` | Lớp phủ hàng chờ |
| `src/hooks/useHotkeys.js` | Phím tắt toàn cục (file mới) |
| `src/features/player/PlayerMascot.jsx` | Mascot theo trạng thái + trạng thái trống |
| `src/pages/ListenPage.jsx` | Xoá (thay bằng `NowPlaying`) |

---

### Task 1: Tách `MusicPlayer` → `PlayerEngine` + `PlaybackTime`

**Files:**
- Create: `src/features/player/PlaybackTime.jsx`, `src/features/player/PlayerEngine.jsx`, `src/features/player/playerMath.js`, `src/features/player/playerMath.test.js`
- Modify: `src/components/MusicPlayer/MusicPlayer.jsx`, `src/main.jsx`, `src/routes/AppRouter.jsx`

**Interfaces:**
- Produces:
  - `previousAction(played: number, position: number, repeat: "off"|"all"|"one"): "restart" | "previous"`: `played > 3` → `"restart"`; `position === 0 && repeat !== "all"` → `"restart"`; còn lại `"previous"` (đúng luật đang có trong `MusicPlayer.handlePrevious`).
  - `parseSavedVolume(raw: string | null): { volume: number, muted: boolean } | null`: JSON `{ volume, muted }`, `volume` số trong `[0, 1]`, `muted` boolean; sai dạng → `null`.
  - `VOLUME_KEY = "donatefy.volume"`.
  - `PlaybackTimeProvider` (nội bộ của Engine) và `usePlaybackTime(): { currentTime: number, duration: number, seek(seconds: number): void, previous(): void, next(): void, togglePlay(): void }`. Ngoài provider trả giá trị mặc định (thời gian 0, hàm rỗng) để component không vỡ.
  - `PlayerEngine({ children })`: render `children` trong provider + `ReactPlayer` ẩn (`width="0" height="0"`), giữ nguyên props / sự kiện của `MusicPlayer` hiện tại (`url`, `playing`, `volume`, `loop`, `progressInterval={500}`, `onPlay`, `onPause`, `onProgress`, `onDuration`, `onEnded → next`, `onError → songFailed`, `playsinline`). Khi mount: đọc `localStorage[VOLUME_KEY]` qua `parseSavedVolume` → `dispatch(setVolume)` (+ `toggleMute` nếu cần); khi `volume` / `muted` đổi → ghi lại. Media Session chuyển nguyên từ `MusicPlayer` sang đây (dùng `previous` của context). Không có bài thì vẫn render `children`, không render `ReactPlayer`.
  - Route: `PlayerLayout` = `<PlayerEngine><Outlet/></PlayerEngine>` bọc toàn bộ nhánh `RequireAuth` (tải `PlayerEngine` bằng `React.lazy` để landing / auth không tải `react-player`). `PlayerLayout` hiện thanh `<MusicPlayer />` (Music Layer) ở mọi trang; Task 3 thêm nút mở rộng và ẩn ở `/listen`.

- [ ] **Step 1: Test** `playerMath.test.js`:

```js
test("bài trước: quá 3 giây thì về đầu bài", () => {
  assert.equal(previousAction(3.5, 4, "off"), "restart");
  assert.equal(previousAction(3, 4, "off"), "previous");
  assert.equal(previousAction(0, 0, "off"), "restart");
  assert.equal(previousAction(0, 0, "one"), "restart");
  assert.equal(previousAction(0, 0, "all"), "previous");
});
test("âm lượng đã lưu", () => {
  assert.deepEqual(parseSavedVolume('{"volume":0.4,"muted":true}'), { volume: 0.4, muted: true });
  assert.equal(parseSavedVolume(null), null);
  assert.equal(parseSavedVolume("rác"), null);
  assert.equal(parseSavedVolume('{"volume":2,"muted":false}'), null);
  assert.equal(parseSavedVolume('{"volume":0.5}'), null);
});
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL (module chưa có).
- [ ] **Step 3: Viết** `playerMath.js` (2 hàm trên + `VOLUME_KEY`). Chạy `npm test` → pass.
- [ ] **Step 4: Viết** `PlaybackTime.jsx`, `PlayerEngine.jsx`; rút `MusicPlayer.jsx` còn giao diện (giữ `ProgressMusicBar`, `ControlPlayer`, `AdditionalControls`, `Marquee`), lấy `currentTime` / `duration` / `seek` / `previous` / `next` / `togglePlay` từ `usePlaybackTime()`; vẫn `return null` khi chưa có bài.
- [ ] **Step 5: Nối route**: bỏ `<MusicPlayer />` khỏi `main.jsx`; thêm `PlayerLayout` (hiện `<MusicPlayer />`). `main.jsx`: `if (import.meta.env.DEV) window.__store = store`.
- [ ] **Step 6: Kiểm tra tay**: build → landing chunk không chứa `react-player` (`grep -l "youtube.com/iframe_api" dist/assets/*.js` không ra chunk landing / index). Trong preview (user giả như GĐ1): `window.__store.dispatch({type:"player/playContext", payload:{songs:[{_id:"t1",id:"jfKfPfyJRdk",name:"lofi",artist:"Lofi Girl",thumbnail:"https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"}], startIndex:0}})` ở `/v1` → thanh v1 hiện, thời gian chạy; chuyển `/listen` → `/v1`: thời gian chạy tiếp, không về 0 (đọc qua thanh v1). Đổi âm lượng, tải lại trang → âm lượng giữ.
- [ ] **Step 7: Commit** `Refactor: Tách bộ phát ẩn và context thời gian khỏi thanh phát v1`

---

### Task 2: Logic thuần cho giao diện trình phát

**Files:**
- Modify: `src/features/player/playerMath.js`, `src/features/player/playerMath.test.js`

**Interfaces:**
- Produces:
  - `dockWindow(orderLength: number, position: number, size = 5): { pos: number, offset: number }[]`: các vị trí trong `order` có `offset = pos - position` thuộc `[-floor(size/2), floor(size/2)]` và `0 ≤ pos < orderLength`, theo thứ tự `offset` tăng dần. `position < 0` → `[]`.
  - `valueFromPointer(clientY: number, rect: { top: number, height: number }, inset = 0.1): number`: giá trị 0–1 của thanh trượt dọc (dưới = 0), bỏ `inset` hai đầu như bản mẫu (`(bottom - y - h*inset) / (h*(1-2*inset))`), kẹp `[0, 1]`, làm tròn 2 chữ số.
  - `moveItem(list: T[], index: number, delta: -1 | 1): T[]`: trả mảng mới đổi chỗ phần tử `index` với `index + delta`; vượt biên → trả **chính** `list` (cùng tham chiếu).
  - `hotkeyAction(e: { key, shiftKey, ctrlKey, metaKey, altKey, target }): string | null`: bỏ qua (`null`) khi `target` là `input`, `textarea`, `select` hoặc `isContentEditable`, hoặc có `ctrlKey` / `metaKey` / `altKey`. Bảng: `" "` → `"toggle"`; `ArrowLeft` → `"back5"`; `ArrowRight` → `"fwd5"`; Shift+`ArrowLeft` → `"previous"`; Shift+`ArrowRight` → `"next"`; `m`/`M` → `"mute"`; `q`/`Q` → `"queue"`; `/` → `"search"`. Khác → `null`. Space / ← → **không** bắt khi `target` là `button`, `a`, hoặc có `role="slider"` (để nút / thanh trượt tự xử lý).
  - `mascotFor({ hasSong: boolean, isPlaying: boolean }): { pose, propeller }`: chưa có bài → `{ pose: "hug-knees", propeller: "still" }`; đang phát → `{ pose: "hug-vinyl", propeller: "spin" }`; có bài, đang dừng → `{ pose: "doze", propeller: "droop" }`.

- [ ] **Step 1: Test** thêm vào `playerMath.test.js`:

```js
test("dock 5 ô, sát hai đầu và hàng chờ ngắn", () => {
  assert.deepEqual(dockWindow(10, 4).map((d) => d.pos), [2, 3, 4, 5, 6]);
  assert.deepEqual(dockWindow(10, 0).map((d) => d.offset), [0, 1, 2]);
  assert.deepEqual(dockWindow(10, 9).map((d) => d.offset), [-2, -1, 0]);
  assert.deepEqual(dockWindow(2, 1).map((d) => d.pos), [0, 1]);
  assert.deepEqual(dockWindow(3, 1, 3).map((d) => d.pos), [0, 1, 2]);
  assert.deepEqual(dockWindow(0, -1), []);
});
test("thanh trượt dọc", () => {
  const rect = { top: 100, height: 200 };
  assert.equal(valueFromPointer(300, rect), 0);
  assert.equal(valueFromPointer(100, rect), 1);
  assert.equal(valueFromPointer(200, rect), 0.5);
  assert.equal(valueFromPointer(500, rect), 0);
});
test("đổi chỗ", () => {
  const l = ["a", "b", "c"];
  assert.deepEqual(moveItem(l, 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveItem(l, 1, 1), ["a", "c", "b"]);
  assert.equal(moveItem(l, 0, -1), l);
  assert.equal(moveItem(l, 2, 1), l);
});
test("phím tắt", () => {
  const body = { tagName: "BODY" }, input = { tagName: "INPUT" }, btn = { tagName: "BUTTON", getAttribute: () => null };
  const k = (key, o = {}) => hotkeyAction({ key, target: body, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...o });
  assert.equal(k(" "), "toggle");
  assert.equal(k("ArrowLeft"), "back5");
  assert.equal(k("ArrowRight", { shiftKey: true }), "next");
  assert.equal(k("M"), "mute");
  assert.equal(k("q"), "queue");
  assert.equal(k("/"), "search");
  assert.equal(k("m", { target: input }), null);
  assert.equal(k(" ", { target: btn }), null);
  assert.equal(k("ArrowRight", { ctrlKey: true }), null);
  assert.equal(k("x"), null);
});
test("mascot theo trạng thái", () => {
  assert.deepEqual(mascotFor({ hasSong: false, isPlaying: false }), { pose: "hug-knees", propeller: "still" });
  assert.deepEqual(mascotFor({ hasSong: true, isPlaying: true }), { pose: "hug-vinyl", propeller: "spin" });
  assert.deepEqual(mascotFor({ hasSong: true, isPlaying: false }), { pose: "doze", propeller: "droop" });
});
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL (hàm chưa có).
- [ ] **Step 3: Viết** 5 hàm. **Step 4: Chạy** `npm test` → pass.
- [ ] **Step 5: Commit** `Feat: Logic dock, thanh trượt, phím tắt và mascot của trình phát`

---

### Task 3: Music Layer = thanh `MusicPlayer` cũ + nút mở rộng; huỷ trình phát ở landing

> Bạn chốt 23/10: thanh `MusicPlayer` v1 đã là thanh mini dính đáy → **giữ nguyên giao diện**, chỉ sửa logic (đã đọc context từ Task 1) và thêm nút mở rộng. Không viết thanh mới.

**Files:**
- Modify: `src/components/MusicPlayer/MusicPlayer.jsx` (thêm nút mở rộng), `src/routes/AppRouter.jsx` (`PlayerLayout`), `src/features/landing/LandingPage.jsx`

**Interfaces:**
- Consumes: `MusicPlayer` (đã đọc `usePlaybackTime()` sau Task 1), `resetPlayer` (GĐ2), `useNavigate`.
- Produces:
  - `MusicPlayer`: giữ nguyên bố cục, màu, component con (`ProgressMusicBar`, `ControlPlayer`, `AdditionalControls`, `Marquee`). Chỉ thêm **một nút mở rộng** cạnh `AdditionalControls`, cùng kiểu nút tròn đang có trong thanh, icon `Maximize2` (lucide), `aria-label="Mở Now Playing"` → `navigate("/listen")`.
  - `PlayerLayout`: `<PlayerEngine><Outlet/>{pathname !== "/listen" && <MusicPlayer/>}</PlayerEngine>` → Music Layer có mặt ở mọi trang trong app (`/v1`, `/playlist/:id`, sau này thư viện…), trừ `/listen`; chưa có bài thì thanh tự `return null` như cũ. Nội dung trang không bị thanh che: khi có bài, `V1Layout` bọc `DefaultLayout` trong khung chừa đáy bằng chiều cao thanh (đo bằng mắt từ thanh hiện tại, khoảng `pb-28`).
  - `LandingPage` khi mount: `dispatch(resetPlayer())` (vào landing = huỷ trình phát; Engine đã unmount vì landing nằm ngoài `PlayerLayout`).
- [ ] **Step 1: Thêm nút mở rộng** vào `MusicPlayer.jsx`; `PlayerLayout` ẩn thanh ở `/listen`; `V1Layout` chừa đáy.
- [ ] **Step 2: Landing** dispatch `resetPlayer()` khi mount.
- [ ] **Step 3: Kiểm tra tay** (hàng chờ thử qua `__store`): thanh hiện ở `/v1`, `/playlist/<id>`; không hiện ở `/listen`; bấm "Mở Now Playing" → `/listen`; bấm ‹ khi đã chạy > 3s về đầu bài; nội dung `/v1` không bị thanh che. Mở `/` rồi quay lại `/listen` → không còn bài (`__store.getState().player.position === -1`). Giao diện thanh giống hệt trước (chụp màn hình so).
- [ ] **Step 4: Commit** `Feat: Music Layer ở mọi trang với nút mở rộng sang Now Playing`

---

### Task 4: Trung tâm Now Playing

**Files:**
- Create: `src/features/player/NowPlaying.jsx`, `src/features/player/Tonearm.jsx`, `src/features/player/ProgressBar.jsx`
- Modify: `src/routes/AppRouter.jsx`
- Delete: `src/pages/ListenPage.jsx`

**Interfaces:**
- Consumes: `usePlaybackTime()` (Task 1), `Vinyl` (GĐ2), `Marquee` (`src/components/Marquee.jsx`), `formatDuration` (`src/utils/formatDuration.js`, xem chữ ký trong file), `getCurrentSong`, `getIsPlaying`, `getCurrentPlaylist`.
- Produces:
  - `NowPlaying()`: route `/listen` trong `AppShell`. Dòng nhỏ viết hoa `` `${playlist?.name ?? "Hàng chờ"} · ${position+1}/${order.length}` `` (+ `" · Shuffle"` khi bật); tên bài (`Marquee`, 800, cỡ `clamp(24px,3.6vw,48px)`); nghệ sĩ; `Vinyl` cỡ `min(34vw, 46vh, 420px)` với `label` = `url(${song.thumbnail}) center/cover`, `spinning={isPlaying}`; `Tonearm`; `ProgressBar` ngay dưới đĩa, rộng bằng đĩa. Đổi bài: chữ + nhãn mờ đi rồi hiện (220ms). Chỗ cho `Dock` (Task 5), `GlassBar` (Task 6), `PlayerMascot` (Task 8).
  - `Tonearm({ down: boolean })`: SVG cần đọc của bản mẫu (`visual-direction-v3.html` dòng 171), `transform-origin: 70% 10%`, `down=false` → `rotate(-18deg)`.
  - `ProgressBar({ currentTime, duration, onSeek })`: thanh cao 0,45cqw-tương-đương (~6px), nền `matcha-4/15`, phần đã chạy `matcha-4`; thời gian hai đầu (`tabular-nums`). `role="slider"`, `aria-label="Tiến trình bài hát"`, `aria-valuetext` dạng `"1:23 / 4:11"`; bấm / kéo để tua; ← / → tua 5 giây, Home / End.
- [ ] **Step 1: Viết 3 component**, route `/listen` → `<AppShell><NowPlaying/></AppShell>`, xoá `ListenPage.jsx`.
- [ ] **Step 2: Kiểm tra tay** (hàng chờ thử qua `__store`): đĩa quay / dừng đúng góc khi `togglePlay`; cần đọc hạ / nhấc; tua bằng chuột và phím trên thanh; tên bài dài chạy chữ. Reduced motion (đọc rule CSS): đĩa không quay. Chụp màn hình.
- [ ] **Step 3: Commit** `Feat: Trung tâm Now Playing với đĩa than, cần đọc và thanh tiến trình`

---

### Task 5: Dock 5 bìa

**Files:**
- Create: `src/features/player/Dock.jsx`
- Modify: `src/features/player/NowPlaying.jsx`

**Interfaces:**
- Consumes: `dockWindow` (Task 2), `usePlaybackTime()` (`previous`, `next`, `togglePlay`), `playAt`.
- Produces: `Dock({ size = 5 })`: Glass bo 2,8cqw-tương-đương ở đáy (`left/right 12%`, cao ~15,5% chiều rộng khung bản mẫu → dùng `clamp(96px, 15vw, 170px)`); nút ‹ › tròn (`IconButton` "Bài trước" / "Bài sau"; ‹ không khoá vì luôn về đầu bài được, › khoá khi bài cuối và không lặp tất cả); băng chuyền phối cảnh: ô có `offset` `o` đặt `translateX(o*7.4cqw-tương-đương) translateZ(...) rotateY(-sign(o)*min(|o|,1)*40deg)`, ô giữa `scale(1.12)` + viền matcha-4 + nút ▶/❚❚ (`aria-label` "Phát"/"Tạm dừng"); ô bên trái `saturate(.45) brightness(.92)`; mask mờ hai đầu (`linear-gradient(to right, transparent 0, #000 16%, #000 84%, transparent)`); bấm ô khác → `playAt(pos)`. Bìa là `<button>` có `aria-label` = tên bài. Ô giữa có `layoutId="now-cover"` (Task 7 dùng).
- [ ] **Step 1: Viết `Dock`**, gắn vào `NowPlaying`.
- [ ] **Step 2: Kiểm tra tay** với hàng chờ 1, 2, 10 bài: không có ô trống; bài đầu / cuối; bấm ô bên phải chuyển bài; ‹ khi đã chạy > 3s về đầu bài.
- [ ] **Step 3: Commit** `Feat: Dock 5 bìa lướt bài`

---

### Task 6: Thanh kính phải (phương án C)

**Files:**
- Create: `src/features/player/GlassBar.jsx`, `src/features/player/VolumeSlider.jsx`
- Modify: `src/features/player/NowPlaying.jsx` (truyền `GlassBar` vào `AppShell` qua prop `right`) hoặc `AppRouter.jsx` nếu `right` đặt ở route

**Interfaces:**
- Consumes: `valueFromPointer` (Task 2), `toggleShuffle`, `toggleQueue`, `setVolume`, `toggleMute`, `getIsShuffle`, `getIsShowQueue`, `getVolume`, `getIsMuted`.
- Produces:
  - `GlassBar()`: Glass dọc rộng 6cqw-tương-đương (`w-16`), bo tròn, theo bản mẫu `controls-options.html` dòng 113–120: `IconButton` "Trộn bài" (`pressed`), "Hàng chờ" (`pressed` = đang mở, `aria-expanded`), vạch ngăn, nút loa (icon theo mức: tắt / < 0,5 / ≥ 0,5; `aria-label` "Tắt tiếng"/"Bật tiếng"), `VolumeSlider`, số % (`"Tắt"` khi tắt tiếng).
  - `VolumeSlider({ value, muted, onChange })`: dọc cao `clamp(120px, 18vh, 180px)`, rãnh `matcha-4/18`, phần đầy `matcha-4`, núm trắng tròn; kéo bằng pointer (`setPointerCapture`) dùng `valueFromPointer`; ↑/↓ ±0,05; `role="slider"`, `aria-orientation="vertical"`, `aria-valuenow` 0–100.
- [ ] **Step 1: Viết 2 component**, gắn vào `/listen`.
- [ ] **Step 2: Kiểm tra tay**: kéo âm lượng; ↑/↓; bấm loa tắt / bật; shuffle bật thì dòng nhỏ có "· Shuffle" và nhạc không ngắt (TC-04 bước 1–2); thanh không ẩn khi header ẩn.
- [ ] **Step 3: Commit** `Feat: Thanh kính phải với shuffle, hàng chờ và âm lượng dọc`

---

### Task 7: Lớp phủ hàng chờ

**Files:**
- Create: `src/features/queue/QueueOverlay.jsx`, `src/features/queue/QueueRow.jsx`
- Modify: `src/features/player/NowPlaying.jsx`

**Interfaces:**
- Consumes: `getIsShowQueue` / `toggleQueue`; `reorderUpNext(order[])`, `playAt(pos)`, `toggleShuffle`, `cycleRepeat`; `moveItem` (Task 2); `usePlaybackTime()`; `Vinyl`; `layoutId="now-cover"` (Task 5); cách dùng `Reorder` + `useDragControls` trong `src/components/SongQueue/QueueContainer.jsx` dòng 30–95, 199–214.
- Produces: `QueueOverlay()`: `role="dialog"`, `aria-modal`, `aria-label="Hàng chờ"`, nền tối (spec 4.1: `rgba(10,16,9,.82)` + quầng matcha + blur), chữ `#eef3e6`; chữ ma "QUEUE".
  - Trên: "Hàng chờ" + meta `` `${playlist?.name ?? "Hàng chờ"} · ${n} bài · đang phát bài ${position+1}` `` + nút ✕ "Đóng".
  - Trái (hero): bìa lớn `layoutId="now-cover"` (bay từ dock, 0,65s), `Vinyl` trượt ra sau bìa (`translateX(-6cqw)` → 0, trễ 0,15s), nút ▶/❚❚ góc dưới phải bìa; "Đang phát", tên, nghệ sĩ, thanh tiến trình nhỏ; nút "Trộn bài" (`pressed`) và "Lặp: tắt / tất cả / một bài" (`cycleRepeat`).
  - Phải: Glass, 2 tab "Tiếp theo (n)" / "Đã phát (n)" (`role="tablist"`, gạch chân trượt, ←/→ đổi tab); "Tiếp theo" = `Reorder.Group` các dòng sau bài đang phát (tay nắm ⋮⋮ kéo, `select-none` khi kéo), lặp tất cả thì thêm mục mờ "Sau đó phát lại từ đầu" + các bài trước đó; "Đã phát" = các bài trước, mờ 60%, không kéo được. Dòng: tay nắm, ảnh 16:9 nhỏ, tên (marquee khi rê), nghệ sĩ, thời lượng, bấm dòng = `playAt`. Dòng hiện lần lượt (trễ 30ms/dòng, tối đa 10 dòng đầu).
  - Bàn phím: dòng là phần tử focus được; Alt+↑/↓ trên dòng "Tiếp theo" → `reorderUpNext(moveItem(upNext, i, ±1))` và giữ focus ở dòng vừa dời; Enter = phát.
  - Mở (`showQueue` true): focus nút ✕; Tab / Shift+Tab giữ trong lớp phủ; Esc hoặc ✕ → `toggleQueue()`, trả focus về nút "Hàng chờ" của `GlassBar`. Reduced motion: không bay bìa, không trượt đĩa, hiện tức thì.
- [ ] **Step 1: Viết `QueueRow`, `QueueOverlay`**, gắn vào `NowPlaying` trong `AnimatePresence`.
- [ ] **Step 2: Kiểm tra tay**: mở bằng nút Hàng chờ → bìa bay lên; ✕ / Esc → bìa bay về; focus về nút Hàng chờ.
- [ ] **Step 3: TC-06**: kéo bài thứ 5 lên đầu "Tiếp theo" → `__store.getState().player.order` đổi đúng; chữ không bị bôi đen khi kéo; `next()` phát đúng bài vừa kéo.
- [ ] **Step 4: Alt+↑/↓** trên dòng thứ 2 → đổi chỗ, focus theo dòng.
- [ ] **Step 5: TC-04**: phát bài 3/10, bật shuffle → nhạc không ngắt, "Tiếp theo" đã xáo, không chứa bài 3; tắt shuffle → "Tiếp theo" là 4, 5, 6…
- [ ] **Step 6: Commit** `Feat: Lớp phủ hàng chờ với bìa bay, kéo thả và phím Alt+↑/↓`

---

### Task 8: Phím tắt, mascot theo trạng thái, trạng thái trống

**Files:**
- Create: `src/hooks/useHotkeys.js`, `src/features/player/PlayerMascot.jsx`
- Modify: `src/features/player/NowPlaying.jsx`, `src/mascot/lines.js`, `src/mascot/lines.test.js`

**Interfaces:**
- Consumes: `hotkeyAction`, `mascotFor` (Task 2); `usePlaybackTime()`; `toggleMute`, `toggleQueue`; `Matcappa`, `MascotSpeech`, `pickLine`; `Vinyl`, `Button`.
- Produces:
  - `useHotkeys(handlers: Record<string, () => void>)`: lắng nghe `keydown` trên `window`, `hotkeyAction(e)` → gọi `handlers[action]` nếu có rồi `preventDefault`. Gắn ở `NowPlaying` với `toggle`, `back5` / `fwd5` (`seek(currentTime ∓ 5)`, kẹp `[0, duration]`), `previous`, `next`, `mute`, `queue`; `search` để trống tới GĐ4.
  - `PLAYER_LINES = { empty: string[], playing: string[], paused: string[] }`: mỗi nhóm 3 câu, giọng mascot (xưng "mình", gọi "bạn", kết bằng "~"). `empty[0]` = `"Dán link YouTube đầu tiên với mình nha ~"`.
  - `PlayerMascot()`: Matcappa cỡ 120 ngồi cạnh mép trái-dưới đĩa (không che đĩa / dock); tư thế theo `mascotFor`; bấm vào nói một câu theo trạng thái (`MascotSpeech`).
  - Trạng thái trống (`NowPlaying`, khi không có bài): `Vinyl spinning` với nhãn trơn, quay chậm (`animationDuration` 18s), Matcappa `hug-knees` nói `empty[0]` ngay khi vào, nút `Button` "Mở thư viện" → `/v1` (tạm tới GĐ4); không hiện dock, thanh tiến trình.
- [ ] **Step 1: Test** thêm vào `lines.test.js`: `PLAYER_LINES` có 3 nhóm × 3 câu, kết bằng `"~"`, `empty[0]` đúng câu trên. Chạy → FAIL; thêm → pass.
- [ ] **Step 2: Viết** `useHotkeys`, `PlayerMascot`, trạng thái trống.
- [ ] **Step 3: Kiểm tra tay**: từng phím tắt (FR-16); gõ "m" trong ô nhập không tắt tiếng (nhập thử trong DevTools một `input` tạm); phím media vẫn chạy (Media Session từ Task 1); mascot đổi 3 tư thế theo phát / dừng / trống; trạng thái trống có nút "Mở thư viện".
- [ ] **Step 4: Commit** `Feat: Phím tắt, mascot theo trạng thái và màn trống của Now Playing`

---

### Checkpoint GĐ5
- [ ] `npm test`, `npm run build` sạch; TC-04, TC-06 qua (hàng chờ thử); TC-05 cần video bị chặn nhúng thật → nhờ bạn thử với backend.
- [ ] Soát cuối theo memory `review-cost`: `/graphify . --update`, gói diff thu gọn, **Opus** (giai đoạn đụng trình phát).
- [ ] Bạn duyệt → merge `v2/now-playing` → `v2/main`.

## Ghi chú

- `/v1`, `/playlist/:id` (v1) có Music Layer ở đáy tới khi GĐ4 thay các trang này.
- Vào landing `/` = huỷ trình phát (bạn chốt 23/10): Engine unmount và `resetPlayer()` (Task 3).
- Bố cục điện thoại (< 768px) để GĐ6 (bạn chốt 23/10).
- Lớp phủ hàng chờ dùng `showQueue` trong Redux (đã có), không cần route riêng (spec 7.4).
