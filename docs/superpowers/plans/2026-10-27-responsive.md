# Giai đoạn responsive (GĐ7) · Notch điều hướng, dock gộp, 3 cỡ máy: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bỏ header, rail và thanh kính phải. Thay bằng một notch điều hướng dính mép trên và một dock gộp. Làm bố cục mobile, tablet, desktop cho mọi trang trong app, kể cả hàng chờ. Trên mobile, nhập liệu không bị bàn phím che.

**Architecture:** Một lớp `DeviceContext` nhận biết thiết bị, trả về enum `DEVICE` gồm `MOBILE` (< 768), `TABLET` (768–1279), `DESKTOP` (≥ 1280). Component lấy giá trị bằng `useDevice()` rồi chia bố cục theo từng thiết bị bằng `switch` (người dùng chốt: code dài hơn nhưng đọc là biết nhánh nào cho máy nào). Khung giữa làm bằng `mx-auto max-w-*`. Logic thuần JS (`deviceFromWidth`, tính vị trí con trỏ ngang, phím tua) có test. Phần còn lại là JSX/Tailwind, kiểm bằng preview và script đo tràn ngang.

**Tech Stack:** React 19 + Vite + Tailwind 3 + framer-motion, test `node --test`, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-27-responsive-design.md`

## Global Constraints

- Nhánh `v2/responsive` cắt từ `v2/main` (`d4d83da` hoặc mới hơn). Nếu thư mục chính đang có session khác thì làm trong worktree riêng. Không push, không merge khi người dùng chưa bảo.
- Commit tiếng Việt (`Feat:`/`Refactor:`/`Fix:`), **có** dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ở cuối (người dùng chốt cho giai đoạn này).
- **Chia thiết bị bằng `useDevice()` + `switch`**, không rải `md:`/`xl:` trong JSX. Khác biệt về bố cục (thứ tự khối, ẩn hay hiện, kích thước) viết thành nhánh riêng: `switch (device) { case DEVICE.MOBILE: … case DEVICE.TABLET: … case DEVICE.DESKTOP: … }`, hoặc một bảng `LAYOUT[device]` chứa class/kích thước. Nhánh nào dài thì tách thành component con, vd. `NowPlayingMobile`. Trong các task bên dưới, "mobile (`< md`)", "`md+`", "`xl`" nghĩa là các nhánh `DEVICE.MOBILE`, `TABLET`/`DESKTOP`, `DESKTOP`; class kiểu `hidden md:block` trong task chỉ để mô tả ý, khi viết code thì đổi thành nhánh `switch`.
- **Thiên về logic, ít mẹo CSS** (người dùng không rành CSS): kích thước, khoảng cách khác nhau theo thiết bị để trong một bảng JS (vd. `const SIZES = { [DEVICE.MOBILE]: {...}, ... }`) rồi truyền qua `style` hoặc chọn class tĩnh. Kích thước phụ thuộc màn hình (vd. đĩa ở desktop) thì tính bằng JS từ `innerWidth`/`innerHeight` (nghe `resize`), không dùng `clamp()`/`calc()` lồng nhau. Class Tailwind tĩnh vẫn dùng bình thường.
- Mốc: `MOBILE` < 768, `TABLET` 768–1279, `DESKTOP` ≥ 1280. Khung: `/playlists*` tối đa 1280px, `/listen` tối đa 1600px; lề mobile 16px, tablet 24px.
- Notch: dính mép trên, giữa màn hình, chỉ bo hai góc dưới. Nền `rgba(10,14,8,.92)`, chữ `#eef3e6`, ở cả theme sáng lẫn tối. Nút tối thiểu 40px (mobile 44px). Không có logo, không có chữ thương hiệu.
- Ô nhập trên mobile: chữ 16px. Chỉ trang hoặc hộp có ô nhập mới xử lý bàn phím.
- Không sửa `src/app/**`, `src/App.css`, `src/index.css`, `public/` (trừ khi task ghi rõ), backend.
- Mỗi task: `npm test`, `npm run build` qua; `npx eslint` các file đã đụng không có lỗi mới (lỗi cũ: `motion` không dùng ở `MusicLayer/ProgressMusicBar.jsx`).
- Preview: `.claude/launch.json` `donatefy-dev` (cổng 3000) + backend local 8404. Nếu làm trong worktree thì vite phải chạy với thư mục làm việc là worktree, vì Tailwind quét `./src` theo cwd. User test và playlist test ghi ở sổ theo dõi, không ghi ra chat.
- Đo tràn ngang ở mỗi task giao diện: chạy `document.documentElement.scrollWidth <= innerWidth` ở 375×812, 768×1024, 1024×768, 1440×900, 1920×1080 trên các trang task đụng tới.
- Soát cuối (memory `review-cost`): `graphify update .`, diff thu gọn, **Sonnet**. Giai đoạn này chỉ đổi giao diện trình phát, không đụng luồng phát.

## Review Focus

1. **Màn thấp hoặc zoom 200% (vd. 1440×600)** → tên bài, đĩa, thanh tiến trình, dock vẫn thấy; thanh âm lượng không bị cắt. Test: Task 3 Step 4.
2. **Mobile đang gõ ở hộp thêm bài, chiều cao còn ~450px** → ô link và nút "Thêm vào playlist" đều thấy; notch và Music Layer ẩn tạm. Test: Task 7 Step 4.
3. **Vuốt cuộn hàng chờ trên mobile** → không đổi thứ tự; kéo bằng tay nắm thì đổi. Test: Task 5 Step 3.
4. **Notch đang mở rộng mà màn chuyển sang đứng yên (idle)** → notch không ẩn khi đang mở, và vẫn đóng được bằng Esc. Test: Task 4 Step 4.
5. **Kéo thanh tiến trình ra ngoài thanh hoặc thả ngoài cửa sổ** → tua đúng mốc 0 hoặc cuối, không kẹt ở trạng thái kéo. Test: Task 1 (`ratioFromPointerX` kẹp 0..1) + Task 3 Step 4.

---

## File Structure

| File | Việc |
|---|---|
| `src/utils/device.js`, `device.test.js` | Mới: `DEVICE` enum, `deviceFromWidth` |
| `src/contexts/DeviceContext.jsx` | Mới: `DeviceProvider`, `useDevice()` |
| `src/main.jsx` | Bọc `DeviceProvider` |
| `src/features/player/playerMath.js`, `playerMath.test.js` | Thêm `ratioFromPointerX`, `seekKeyStep` |
| `src/features/player/Dock.jsx` | Gộp Shuffle, Hàng chờ (trái) và âm lượng (phải); mobile chỉ còn bìa đang phát |
| `src/features/player/VolumeSlider.jsx` | Đổi sang thanh ngang |
| `src/features/player/GlassBar.jsx` | Xoá |
| `src/features/player/ProgressBar.jsx` | Vùng bấm lớn, núm, bóng giờ, phím tua |
| `src/features/player/NowPlaying.jsx` | Bố cục 3 cỡ, thanh tiến trình bám dock, đĩa lớn ở desktop |
| `src/layouts/Notch.jsx` | Mới: notch điều hướng + thẻ tài khoản |
| `src/layouts/AppShell.jsx` | Dùng Notch, bỏ `right`, `h-dvh`, ẩn đốm màu trên mobile |
| `src/layouts/Header.jsx`, `src/layouts/Rail.jsx` | Xoá |
| `src/routes/AppRouter.jsx` | Bỏ `right={<GlassBar />}` |
| `src/features/queue/QueueOverlay.jsx`, `QueueRow.jsx` | Mobile toàn màn, một cột; kéo chỉ bằng tay nắm |
| `src/features/library/LibraryPage.jsx`, `src/features/playlist/{PlaylistPage,PlaylistHeader,SongTile}.jsx` | Bố cục 3 cỡ, khung giữa |
| `src/features/player/MusicLayer/MusicLayer.jsx` | Mobile rút gọn, căn khung |
| `src/hooks/useTyping.js` | Mới: `true` khi đang focus ô nhập trên mobile |
| `index.html` | `interactive-widget=resizes-content` |
| `src/features/auth/{AuthPage,Field}.jsx`, `src/features/playlist/SongDialog.jsx` | `dvh`, chữ 16px, kiểu bàn phím, tấm trượt dưới trên mobile, ẩn mascot mobile |

---

### Task 1: Lớp nhận biết thiết bị, hàm thuần cho thanh ngang và phím tua

**Files:**
- Create: `src/utils/device.js`, `src/utils/device.test.js`, `src/contexts/DeviceContext.jsx`
- Modify: `src/main.jsx`, `src/features/player/playerMath.js`
- Test: `src/features/player/playerMath.test.js`

**Interfaces:**
- Produces: `DEVICE = Object.freeze({ MOBILE: "mobile", TABLET: "tablet", DESKTOP: "desktop" })` và `deviceFromWidth(width: number) → DEVICE.*` (`< 768` → MOBILE, `< 1280` → TABLET, còn lại DESKTOP) trong `src/utils/device.js`. `DeviceProvider` (giá trị đầu lấy đồng bộ từ `window.innerWidth` để khỏi nháy; nghe `matchMedia("(min-width: 768px)")` và `(min-width: 1280px)` `change`) và `useDevice() → DEVICE.*` trong `src/contexts/DeviceContext.jsx`. `main.jsx` bọc `DeviceProvider` ngoài `App`.
- Produces: `ratioFromPointerX(clientX: number, rect: {left, width}) → number` (0..1, kẹp hai đầu, làm tròn 0,001). `seekKeyStep(key: string, current: number, duration: number, step = 5) → number | null` (giây mới, kẹp `[0, duration]`; phím không liên quan thì trả `null`).

- [ ] **Step 1: Viết test hỏng**

```js
// src/utils/device.test.js
test("deviceFromWidth", () => {
  assert.equal(deviceFromWidth(375), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(767), DEVICE.MOBILE);
  assert.equal(deviceFromWidth(768), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1279), DEVICE.TABLET);
  assert.equal(deviceFromWidth(1280), DEVICE.DESKTOP);
});
// src/features/player/playerMath.test.js
test("ratioFromPointerX kẹp 0..1", () => {
  const rect = { left: 100, width: 200 };
  assert.equal(ratioFromPointerX(100, rect), 0);
  assert.equal(ratioFromPointerX(200, rect), 0.5);
  assert.equal(ratioFromPointerX(50, rect), 0);
  assert.equal(ratioFromPointerX(999, rect), 1);
});
test("seekKeyStep", () => {
  assert.equal(seekKeyStep("ArrowRight", 10, 100), 15);
  assert.equal(seekKeyStep("ArrowLeft", 3, 100), 0);
  assert.equal(seekKeyStep("ArrowRight", 98, 100), 100);
  assert.equal(seekKeyStep("Home", 50, 100), 0);
  assert.equal(seekKeyStep("End", 50, 100), 100);
  assert.equal(seekKeyStep("a", 50, 100), null);
});
```

- [ ] **Step 2: `npm test`** → FAIL vì `deviceFromWidth`, `ratioFromPointerX`, `seekKeyStep` chưa có.
- [ ] **Step 3: Viết `device.js`, hai hàm trong `playerMath.js`, `DeviceContext.jsx`; bọc `DeviceProvider` trong `main.jsx`.**
- [ ] **Step 4: `npm test`** → PASS.
- [ ] **Step 5: Kiểm `useDevice` trên preview**: đổi viewport 375 → 1024 → 1440, giá trị đổi đúng MOBILE → TABLET → DESKTOP (tạm `console.log` hoặc React DevTools, gỡ trước khi commit).
- [ ] **Step 6: Commit** `Feat: Lớp nhận biết thiết bị và hàm tính thanh ngang, phím tua`.

### Task 2: Dock gộp, bỏ thanh kính phải

**Files:**
- Modify: `src/features/player/Dock.jsx`, `src/features/player/VolumeSlider.jsx`, `src/routes/AppRouter.jsx`
- Delete: `src/features/player/GlassBar.jsx`

**Interfaces:**
- Consumes: `ratioFromPointerX` (Task 1).
- Produces: `VolumeSlider({ value, muted, onChange })`, giữ chữ ký cũ nhưng là thanh ngang `role="slider"` `aria-orientation="horizontal"`, phím ←/→/↑/↓ bước 0,05. Dock không còn phụ thuộc `GlassBar`.

- [ ] **Step 1: Dời phần Shuffle, Hàng chờ (giữ `data-queue-toggle`, `aria-expanded`), nút loa, `VolumeSlider`, phần trăm từ `GlassBar` vào `Dock`.**
  - Trái: Shuffle, Hàng chờ.
  - Giữa: ‹, dải bìa, ›.
  - Phải: loa, thanh ngang `w-[120px]`, phần trăm.
  - Mobile (`< md`):
    - dải bìa chỉ còn bìa đang phát (ẩn bìa trước/sau);
    - phần âm lượng thu thành nút loa; bấm thì bung một viên kính nổi ngay trên dock, chứa thanh ngang;
    - bấm ra ngoài hoặc Esc thì đóng viên đó.
- [ ] **Step 2: `VolumeSlider` dùng `ratioFromPointerX`; xoá `GlassBar.jsx`; bỏ `right={<GlassBar />}` và import trong `AppRouter.jsx`.**
- [ ] **Step 3: Kiểm.**
  - Lệnh: `npm test`, `npm run build`, `npx eslint` các file đã đụng.
  - Preview `/listen` khi đang phát, ở 375, 1024, 1440: Shuffle, Hàng chờ, âm lượng bấm được; âm lượng lưu lại sau khi tải lại trang; không tràn ngang.
- [ ] **Step 4: Commit** `Refactor: Gộp shuffle, hàng chờ, âm lượng vào dock, bỏ thanh kính phải`.

### Task 3: Thanh tiến trình và bố cục `/listen`

**Files:**
- Modify: `src/features/player/ProgressBar.jsx`, `src/features/player/NowPlaying.jsx`

**Interfaces:**
- Consumes: `ratioFromPointerX`, `seekKeyStep` (Task 1); `Dock` (Task 2).
- Produces: `ProgressBar({ currentTime, duration, onSeek, className })` giữ chữ ký.
  - Vùng bấm `min-h-11`; thanh 6px, phình 10px khi hover/kéo.
  - Núm: hiện khi hover/kéo ở `md+`, luôn hiện ở mobile.
  - Bóng giờ `formatDuration` theo con trỏ.
  - Kéo bằng `setPointerCapture`; chỉ gọi `onSeek` khi `pointerup`/`pointercancel`; trong lúc kéo, phần đã chạy vẽ theo vị trí kéo.

- [ ] **Step 1: Viết lại `ProgressBar`** theo Interfaces. Giữ `role="slider"` và các `aria-*`; `onKeyDown` dùng `seekKeyStep`.
- [ ] **Step 2: `NowPlaying` bố cục mới.**
  - Bỏ `style={{ width: DECK }}` của `ProgressBar`; đặt thanh ngay trên dock, rộng bằng dock (cùng khung `inset-x`/`max-w` với dock).
  - Chừa đỉnh cho notch (`pt` ≥ chiều cao notch + 12px); tên bài tối đa 2 dòng ở `md+`, 1 dòng chạy chữ ở mobile.
  - Đĩa:
    - mobile: `min(100vw - 32px, 46dvh)`;
    - tablet: giữ `DECK` cũ;
    - desktop: `min(42vw, 100dvh - 360px, 720px)` (đổi 360 cho khớp tổng chiều cao notch + tên bài + thanh + dock đo được).
  - Mascot cạnh đĩa: `hidden md:block`.
  - Khung `xl`: `mx-auto max-w-[1600px]`.
- [ ] **Step 3: Kiểm.**
  - Lệnh: `npm test`, `npm run build`, eslint.
  - Preview đang phát, đo tràn ở 5 cỡ.
  - Chụp ảnh `/listen` ở 375×812, 1024×768, 1440×900, 1920×1080: đĩa căn giữa khung (lệch tâm ≤ 8px so với tâm khung).
- [ ] **Step 4: Kiểm màn thấp và kéo.**
  - Ở 1440×600: tên bài, đĩa, thanh, dock và thanh âm lượng đều thấy.
  - Kéo núm ra quá mép trái/phải rồi thả: tua về 0 hoặc gần cuối.
  - Nhấn ←/→ khi focus thanh: lùi hoặc tới 5 giây.
- [ ] **Step 5: Commit** `Feat: Thanh tiến trình dễ kéo và bố cục Now Playing theo 3 cỡ máy`.

### Task 4: Notch điều hướng thay header và rail

**Files:**
- Create: `src/layouts/Notch.jsx`
- Modify: `src/layouts/AppShell.jsx`
- Delete: `src/layouts/Header.jsx`, `src/layouts/Rail.jsx`

**Interfaces:**
- Produces: `Notch({ open, onOpenChange })`, một khối duy nhất.
  - Hàng icon: `NavLink` Trang chủ `/listen` và Thư viện `/playlists` (sáng cả khi ở `/playlists/…`), dời `LINKS` từ Rail; nút theme (`useTheme`); nút avatar `aria-expanded={open}` `aria-haspopup="true"`.
  - Khi `open`: thẻ tài khoản gồm `Avatar` lớn, `user.displayName ?? user.username`, `@username`, nút "Đăng xuất" (`useLogout`).
  - Đóng bằng Esc, bấm ra ngoài, `mouseleave` (chỉ khi mở bằng rê), hoặc bấm lại avatar.
- `AppShell({ children })` (bỏ prop `right`):
  - Notch đặt `fixed inset-x-0 top-0 z-20 flex justify-center`.
  - Tự ẩn khi idle như cũ, nhưng `hold` cả khi notch đang mở.
  - Khung `h-dvh` thay `h-screen`; đốm màu `hidden md:block`.

- [ ] **Step 1: Viết `Notch.jsx`.**
  - Dáng: `rounded-b-[22px]`, `px-3 py-2`, nở xuống bằng `motion.div layout` (hoặc `AnimatePresence` cho thẻ), `transition` 0,22s.
  - Mobile: `w-[calc(100%-32px)] max-w-sm`; desktop: vừa nội dung.
  - Rê để mở chỉ khi `(hover: hover)`.
- [ ] **Step 2: Sửa `AppShell`**: dùng `Notch`, xoá `Header.jsx`, `Rail.jsx`; `grep -rn "layouts/Header\|layouts/Rail\|GlassBar" src` = 0.
- [ ] **Step 3: Kiểm.**
  - Lệnh: `npm test`, `npm run build`, eslint.
  - Preview `/listen`, `/playlists`, `/playlists/:id` ở 375, 1024, 1440:
    - notch giữa, dính mép trên, không che tên bài;
    - điều hướng đúng trang, nút trang hiện tại sáng;
    - đổi theme được;
    - avatar mở thẻ, có tên; Đăng xuất về `/login`.
- [ ] **Step 4: Kiểm idle.**
  - Đứng yên 3 giây: notch ẩn; chạm hoặc di chuột: hiện lại.
  - Mở thẻ tài khoản rồi đứng yên 3 giây: notch vẫn hiện.
  - Esc: đóng thẻ, focus về nút avatar.
- [ ] **Step 5: Commit** `Feat: Notch điều hướng dính mép trên thay header và rail`.

### Task 5: Hàng chờ theo 3 cỡ máy

**Files:**
- Modify: `src/features/queue/QueueOverlay.jsx`, `src/features/queue/QueueRow.jsx`

**Interfaces:**
- Consumes: hành vi kéo và xoá hiện có của `DraggableRow` / `StaticRow` (không đổi API).
- Produces: `DraggableRow` đã chỉ kéo từ tay nắm (`dragListener={false}` + `useDragControls`), giữ nguyên. Chỉ tay nắm có `touch-none`, thân hàng cho cuộn dọc (`touch-pan-y`). Hàng cao `min-h-14`, tay nắm vùng chạm ≥ 44px.

- [ ] **Step 1: Mobile (`< md`): overlay `fixed inset-0` một cột.**
  - Trên cùng: "Hàng chờ" + nút đóng.
  - Một hàng gọn bài đang phát: bìa 48px, tên chạy chữ, nút phát/dừng.
  - Hai tab vừa bề ngang.
  - Danh sách `overflow-y-auto`.
  - Chữ chìm "QUEUE" `hidden md:block`.
- [ ] **Step 2: `md+`: giữ hai cột như hiện tại, khung `xl:max-w-[1600px] mx-auto`.**
- [ ] **Step 3: Kiểm.**
  - Lệnh: build, eslint.
  - Preview 375×812:
    - mở Hàng chờ, không tràn, tab "Đã phát" thấy đủ;
    - cuộn danh sách bằng chuột kéo trên thân hàng: thứ tự không đổi;
    - kéo tay nắm: đổi thứ tự (kiểm `__store.getState().player` trước và sau).
  - 1440: vẫn hai cột.
- [ ] **Step 4: Commit** `Feat: Hàng chờ toàn màn một cột trên mobile, kéo bằng tay nắm`.

### Task 6: Thư viện, playlist, Music Layer

**Files:**
- Modify: `src/features/library/LibraryPage.jsx`, `src/features/playlist/PlaylistPage.jsx`, `src/features/playlist/PlaylistHeader.jsx`, `src/features/playlist/SongTile.jsx` (nếu cần), `src/features/player/MusicLayer/MusicLayer.jsx`

- [ ] **Step 1: Thư viện.**
  - Khung `xl:max-w-[1280px] mx-auto`.
  - Chữ chìm "PLAYLISTS" `hidden md:block`.
  - Mobile: tiêu đề và số playlist không xuống dòng lộn xộn (số playlist xuống dòng dưới tiêu đề); hàng nút Phát / Mở / ⋯ vừa bề ngang; dải bìa vuốt ngang.
  - Chừa đỉnh cho notch.
- [ ] **Step 2: Playlist.**
  - Khung `xl:max-w-[1280px] mx-auto`.
  - `PlaylistHeader`: mobile xếp dọc, các nút `flex-wrap`, không tràn.
  - Lưới bài: `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`.
- [ ] **Step 3: Music Layer.**
  - Căn khung `xl:max-w-[1280px] mx-auto`.
  - Mobile: chỉ bìa, tên (Marquee), ‹ ▶ ›, nút mở Now Playing; `AdditionalControls` `hidden md:flex`.
- [ ] **Step 4: Kiểm.**
  - Lệnh: build, eslint.
  - Đo tràn `/playlists`, `/playlists/:id` (đang phát để có Music Layer) ở 5 cỡ.
  - Chụp ảnh ở 375, 1024, 1440.
- [ ] **Step 5: Commit** `Feat: Thư viện, playlist và Music Layer theo 3 cỡ máy`.

### Task 7: Nhập liệu trên mobile

**Files:**
- Create: `src/hooks/useTyping.js`
- Modify: `index.html`, `src/layouts/AppShell.jsx`, `src/features/player/MusicLayer/MusicLayer.jsx`, `src/features/auth/{AuthPage,Field}.jsx`, `src/features/library/LibraryPage.jsx` (ô tên playlist), `src/features/playlist/SongDialog.jsx`

**Interfaces:**
- Produces: `useTyping() → boolean`: `true` khi `document.activeElement` là `input`/`textarea`/`[contenteditable]` (trừ checkbox/range/file) **và** `useDevice() === DEVICE.MOBILE`. Nghe `focusin`/`focusout` trên `document`. Khi focus vào ô thì gọi `scrollIntoView({ block: "center" })` sau `setTimeout(…, 300)`, chờ bàn phím mở xong.

- [ ] **Step 1: `index.html`**: thẻ viewport thêm `, interactive-widget=resizes-content`. `useTyping.js` theo Interfaces.
- [ ] **Step 2: Ẩn phần nổi khi gõ.**
  - `AppShell` ẩn notch khi `useTyping()`.
  - `MusicLayer` trả `null` khi `useTyping()`.
  - `AuthPage`: `min-h-dvh`; `FlyingMascot` chỉ hiện ở `md+`.
- [ ] **Step 3: Ô nhập.**
  - `Field.jsx` `inputCls`: `text-base md:text-[15px]`.
  - Tên đăng nhập: `autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next"`.
  - Mật khẩu: `enterKeyHint="go"`.
  - Ô tên playlist ở Thư viện: `text-base`, `enterKeyHint="done"`.
  - `SongDialog`:
    - ô link `type="url" inputMode="url" enterKeyHint="next"`;
    - ô tên, ca sĩ `enterKeyHint="next"`/`"done"`;
    - mobile: hộp thành tấm trượt dưới (`items-end`, `rounded-t-[28px] rounded-b-none`, `max-h-[calc(100dvh-16px)]`, thân `overflow-y-auto`, hàng nút Huỷ / Thêm `sticky bottom-0`);
    - `md+`: giữ như cũ.
- [ ] **Step 4: Kiểm.**
  - Lệnh: build, eslint.
  - Preview 375×812:
    - `/login`: chữ ô 16px (`getComputedStyle(...).fontSize === "16px"`); không có mascot bay.
    - Hộp thêm bài: đổi viewport còn 375×450 (giả lập bàn phím), focus ô link → ô và nút "Thêm vào playlist" nằm trong `0..innerHeight`; notch và Music Layer ẩn; bỏ focus → hiện lại.
  - 1440: hộp thêm bài như cũ.
- [ ] **Step 5: Commit** `Feat: Nhập liệu trên mobile không bị bàn phím che`.

### Task 8: Kiểm toàn cục và soát cuối

- [ ] **Step 1: Đo tràn ngang.** Ở 320×640, 375×812, 768×1024, 1024×768, 1440×900, 1440×600, 1920×1080, đo `/`, `/login`, `/register`, `/listen` (đang phát, mở và đóng hàng chờ), `/playlists`, `/playlists/:id`, 404: `scrollWidth <= innerWidth` ở mọi trang. Trang `/` hoặc 404 có tràn thì sửa tối thiểu cho hết tràn.
- [ ] **Step 2: `grep -rn "h-screen\|min-h-screen" src`**: chỉ còn chỗ không có ô nhập và không nằm trong `AppShell`/`AuthPage` (ghi lại danh sách).
- [ ] **Step 3: `npm test`, `npm run build`, `npm run lint`**: không lỗi mới.
- [ ] **Step 4: Soát cuối** theo Global Constraints. Người dùng góp ý sau soát: sửa rồi commit gộp (memory `feedback-batch-commit`). Gỡ cấu hình preview tạm trong `.claude/launch.json` khi xong.
