# Notch trình phát Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bỏ Music Layer, đưa điều khiển nhạc vào notch: thẻ "đang phát" + thẻ tài khoản, có hàng chấm chuyển thẻ; điện thoại có thẻ nhạc mỏng luôn hiện.

**Architecture:** Logic chọn thẻ là hàm thuần trong `src/layouts/notchCards.js` (test node). `Notch.jsx` giữ thẻ đang chọn, vẫn dùng lớp nền goo + lớp nội dung; các thẻ mới nằm ở file riêng trong `src/layouts/notch/`. `AppShell` vẫn giữ `open` boolean.

**Tech Stack:** React 19, Vite, Tailwind, framer-motion, Redux, lucide-react, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-notch-player-design.md`

## Global Constraints

- Theo thiết bị bằng `useDevice()` + `switch (device)` + bảng số liệu theo `DEVICE`; không rải `md:`/`xl:`.
- Dùng lại: `Marquee` (`components/Marquee`), `Vinyl` (`components`, props `size, label, spinning, duration, style`), `ProgressBar` (`features/player/ProgressBar`, props `currentTime, duration, onSeek, alwaysThumb, className`), `IconButton`, `usePlaybackTime()` (`currentTime, duration, seek, previous, next, togglePlay`), `swipeDir(start, end)` từ `features/landing/stepper.js` (trả 1 / -1 / 0).
- Không giữ lời bài hát, không vạch sóng nhạc.
- Giữ nguyên hiệu ứng goo (biến thể `DROP`/`CARD` trong `Notch.jsx`); mọi thẻ đều nằm trong DOM, thẻ không chọn thì `inert`.
- Không sửa `src/app/**`, `public/`, `App.css`, `index.css`.
- Commit tiếng Việt, cuối có `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Làm trong worktree riêng (nhánh `v2/notch-player` từ `v2/main`); preview vite phải chạy với cwd là worktree.

## Review Focus

1. Bài đổi khi notch đang mở ở thẻ "đang phát" → thẻ cập nhật ngay (tên, bìa, thời gian), không nháy đóng/mở. Kiểm ở Task 5 bước thử trên trình duyệt.
2. Hết hàng chờ / xoá bài đang phát khi đang ở thẻ "đang phát" → về thẻ tài khoản hoặc đóng, không còn thẻ trống. Test `cardsFor` + `fallbackCard` ở Task 1.
3. Kéo thanh tiến trình trong notch rồi nhả chuột ngoài notch (máy tính, mở bằng rê chuột) → không đóng notch giữa lúc kéo. Kiểm ở Task 5.
4. Lướt ngang trên thẻ nhạc mỏng (điện thoại) không làm cuộn trang hay mở `/listen` nhầm; chạm thường vào nút vẫn bấm được. Test `swipeDir` ngưỡng ở Task 1, thử tay ở Task 5.
5. Điện thoại vào `/listen` hoặc chưa có bài → viên trở lại chỉ hàng icon, notch vẫn luôn hiện. Test `restingCard` ở Task 1.

---

### Task 1: Logic chọn thẻ notch

**Files:**
- Create: `src/layouts/notchCards.js`
- Test: `src/layouts/notchCards.test.js`

**Interfaces:**
- Produces:
  - `CARD = { NOW: "now", ACCOUNT: "account" }`
  - `cardsFor({ hasSong, onListen, loggedIn }) -> string[]` — thứ tự `[NOW, ACCOUNT]`; bỏ `NOW` khi `!hasSong || onListen`; bỏ `ACCOUNT` khi `!loggedIn`.
  - `openCard(cards, via) -> string | null` — `via` là `"hover" | "avatar"`; hover → `NOW` nếu có, không thì `cards[0] ?? null`; avatar → `ACCOUNT`.
  - `stepCard(cards, current, dir) -> string` — `dir` 1/-1, kẹp hai đầu (không vòng).
  - `fallbackCard(cards, current) -> string | null` — `current` còn trong `cards` thì giữ, không thì `cards[0] ?? null`.
  - `restingCard({ device, hasSong, onListen }) -> string | null` — chỉ `DEVICE.MOBILE && hasSong && !onListen` → `NOW` (thẻ nhạc mỏng của viên thu gọn), còn lại `null`.

- [ ] **Step 1: Viết test**

```js
test("cardsFor: có bài ngoài /listen thì 2 thẻ, /listen hoặc chưa có bài thì chỉ tài khoản", () => {
  assert.deepEqual(cardsFor({ hasSong: true, onListen: false, loggedIn: true }), ["now", "account"]);
  assert.deepEqual(cardsFor({ hasSong: true, onListen: true, loggedIn: true }), ["account"]);
  assert.deepEqual(cardsFor({ hasSong: false, onListen: false, loggedIn: true }), ["account"]);
  assert.deepEqual(cardsFor({ hasSong: false, onListen: false, loggedIn: false }), []);
});
test("openCard: rê chuột vào đang phát, bấm avatar vào tài khoản", () => {
  assert.equal(openCard(["now", "account"], "hover"), "now");
  assert.equal(openCard(["account"], "hover"), "account");
  assert.equal(openCard(["now", "account"], "avatar"), "account");
  assert.equal(openCard([], "hover"), null);
});
test("stepCard: kẹp hai đầu", () => {
  assert.equal(stepCard(["now", "account"], "now", 1), "account");
  assert.equal(stepCard(["now", "account"], "account", 1), "account");
  assert.equal(stepCard(["now", "account"], "account", -1), "now");
});
test("fallbackCard: thẻ đang chọn biến mất thì về thẻ đầu còn lại", () => {
  assert.equal(fallbackCard(["account"], "now"), "account");
  assert.equal(fallbackCard(["now", "account"], "now"), "now");
  assert.equal(fallbackCard([], "now"), null);
});
test("restingCard: chỉ điện thoại có bài ngoài /listen mới có thẻ nhạc mỏng", () => {
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: true, onListen: false }), "now");
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: true, onListen: true }), null);
  assert.equal(restingCard({ device: DEVICE.MOBILE, hasSong: false, onListen: false }), null);
  assert.equal(restingCard({ device: DEVICE.DESKTOP, hasSong: true, onListen: false }), null);
});
```

- [ ] **Step 2:** `npm test` → FAIL (module chưa có).
- [ ] **Step 3:** Viết `notchCards.js` theo Interfaces (import `DEVICE` từ `../utils/device.js`, có đuôi `.js` để node chạy được).
- [ ] **Step 4:** `npm test` → PASS (51 cũ + 5 mới).
- [ ] **Step 5:** Commit `Feat: Logic chọn thẻ notch (đang phát / tài khoản)`.

### Task 2: Bỏ Music Layer

**Files:**
- Delete: `src/features/player/MusicLayer/` (cả thư mục)
- Modify: `src/routes/AppRouter.jsx` (bỏ import + dòng `{pathname !== "/listen" && <MusicLayer />}`; bỏ `pathname` nếu không còn dùng)
- Modify: `src/layouts/AppShell.jsx` (bỏ `pad`, `pb-28`, import `getCurrentSong`/`useSelector`/`useLocation` nếu thừa)
- Modify: `src/features/library/LibraryPage.jsx:295-298`, `src/features/playlist/PlaylistPage.jsx:146` — `${song ? "pb-28" : "pb-4"}` → `pb-4`; sửa comment nhắc Music Layer.

- [ ] **Step 1:** `grep -rn "MusicLayer\|ProgressMusicBar\|ControlPlayer\|AdditionalControls\|pb-28" src` → chỉ còn các chỗ trên.
- [ ] **Step 2:** Sửa/xoá như trên.
- [ ] **Step 3:** Lặp lại grep → không còn kết quả; `npx vite build` → `✓ built`; `npm test` → PASS.
- [ ] **Step 4:** Commit `Refactor: Bỏ Music Layer, notch sẽ thay`.

### Task 3: Nút "Đang phát" thành đĩa nhỏ khi có bài

**Files:**
- Create: `src/layouts/notch/ListenIcon.jsx`
- Modify: `src/layouts/Notch.jsx` (`LINKS`/`NotchLink`: mục `/listen` render `<ListenIcon />` thay `Disc3`)

**Interfaces:**
- Produces: `ListenIcon({ size }: { size: number })` — đọc `getCurrentSong`, `getIsPlaying`. Có bài → `<Vinyl size={size} label={thumbnail ? \`url(${thumbnail}) center/cover\` : undefined} spinning={isPlaying} duration={6} style={{ width: size, height: size }} />`; không bài → `<Disc3 size={size} />`.

- [ ] **Step 1:** Viết `ListenIcon`, cỡ đĩa 26 (nút 40/44).
- [ ] **Step 2:** `NotchLink` nhận `Icon` là component có prop `size`; mục `/listen` dùng `ListenIcon`, giữ `aria-label="Đang phát"`.
- [ ] **Step 3:** Thử trên trình duyệt (Task 5 có trang giả đăng nhập): có bài → đĩa xoay, dừng → đứng yên; chưa có bài → icon Disc3.
- [ ] **Step 4:** Commit `Feat: Nút Đang phát trên notch thành đĩa nhỏ khi có bài`.

### Task 4: Thẻ đang phát, thẻ nhạc mỏng, hàng chấm

**Files:**
- Create: `src/layouts/notch/NowPlayingCard.jsx`, `src/layouts/notch/MiniPlayer.jsx`, `src/layouts/notch/NotchDots.jsx`

**Interfaces:**
- Consumes: `usePlaybackTime()`, `getCurrentSong`, `getIsPlaying`, `ProgressBar`, `Marquee`, `Vinyl`, `IconButton`.
- Produces:
  - `NowPlayingCard()` — bìa vuông 88px bo 14px (không bìa → `Vinyl` 88); cột phải: tên (Marquee, đậm), ca sĩ (nhỏ, mờ), `ProgressBar` + hai mốc giờ `m:ss`, hàng ‹‹ ▶/❚❚ ›› (`SkipBack`/`Play|Pause`/`SkipForward`, nút giữa to hơn). Bấm tên → `navigate("/listen")`.
  - `MiniPlayer()` — một hàng cao 44px: trái tên (Marquee) + ca sĩ 12px; phải 3 nút cỡ 40. Bấm tên → `/listen`.
  - `NotchDots({ cards, current, onPick })` — hàng ngang giữa, gap 8px; chấm chọn `h-2 w-6 bg-matcha-4`, chấm khác `h-2 w-2 bg-white/30`, đổi bằng `transition-all duration-300 ease-matcha` (giống `LandingPage.jsx:165`); mỗi chấm là `<button aria-label="Thẻ đang phát" | "Thẻ tài khoản" aria-current>`; `cards.length < 2` → `null`.
- Định dạng giờ: dùng hàm đã có nếu `grep -rn "formatTime\|m:ss" src` thấy; không có thì thêm `formatTime(sec)` vào `features/player/playerMath.js` + test (`formatTime(0) === "0:00"`, `formatTime(187) === "3:07"`, `formatTime(NaN) === "0:00"`).

- [ ] **Step 1:** (nếu cần) test + `formatTime`, `npm test` → PASS.
- [ ] **Step 2:** Viết 3 component trên, nền chữ sáng trên nền tối (`text-[#eef3e6]`, nút dùng `onDark` như `Notch.jsx`).
- [ ] **Step 3:** `npx vite build` → `✓ built`.
- [ ] **Step 4:** Commit `Feat: Thẻ đang phát, thẻ nhạc mỏng và hàng chấm cho notch`.

### Task 5: Ghép thẻ vào notch

**Files:**
- Modify: `src/layouts/Notch.jsx`, `src/layouts/AppShell.jsx`

**Interfaces:**
- Consumes: mọi thứ từ Task 1, 3, 4.
- `Notch({ open, onOpenChange })` giữ nguyên chữ ký; thêm state `card` (string | null).

Hành vi (theo spec, mục "Hành vi đã chốt" + "Quyết định của người viết"):
- `cards = cardsFor({ hasSong, onListen: pathname === "/listen", loggedIn: !!user })`; `resting = restingCard(...)`.
- Rê chuột mở (`hoverOpen`) → `setCard(openCard(cards, "hover"))`; bấm avatar → `setCard(openCard(cards, "avatar"))`, bấm lại khi đang ở tài khoản thì đóng. Đã mở bằng bấm thì rê chuột không đổi thẻ.
- `useEffect` trên `cards`: `card` không còn → `fallbackCard`; nếu notch đang mở bằng hover và thẻ bị mất là `NOW` thì đóng.
- Điện thoại: khi `!open` mà `resting` có → lớp nội dung hiện `MiniPlayer` ngay dưới hàng icon (viên cao lên, nền goo viên thu gọn tính cả `MiniPlayer`: đo `nav` + mini bằng ResizeObserver như hiện nay). Khi mở, các thẻ hiển thị như máy lớn nhưng thẻ `NOW` trên điện thoại vẫn là `MiniPlayer` (không vẽ lại lần nữa ở viên). Esc / bấm ngoài → đóng = về viên có `MiniPlayer`.
- Khi mở: thẻ đang chọn hiện, thẻ còn lại `inert` + ẩn; chuyển thẻ trượt ngang (`x: ±24`, opacity) theo hướng; `NotchDots` ở đáy khi `cards.length >= 2`.
- Lướt ngang trên vùng thẻ: `onPointerDown` lưu `clientX`, `onPointerUp` → `dir = swipeDir(startX, endX)` → `setCard(stepCard(cards, card, dir))`; vùng thẻ `touchAction: "pan-y"`.
- Bề ngang mở: một giá trị chung trong bảng `NOTCH` (tablet 400 → 440, desktop 420 → 460 cho thẻ đang phát vừa bìa 88 + cột chữ).
- Kéo `ProgressBar` (Review Focus 3): khi đang kéo (pointer capture trong notch) không đóng vì `mouseleave` — chặn `onMouseLeave` đóng khi `e.buttons !== 0`.
- `AppShell`: điện thoại không tự ẩn — `useIdle(2500, { hold: device === DEVICE.MOBILE || hover || focusIn || notchOpen })`; vẫn ẩn khi `typing`.

- [ ] **Step 1:** Sửa `Notch.jsx` + `AppShell.jsx` như trên.
- [ ] **Step 2:** `npm test` → PASS; `npx vite build` → `✓ built`.
- [ ] **Step 3:** Thử trên trình duyệt bằng trang giả đăng nhập tạm (`notch-test.html` ở gốc worktree: chép `index.html`, thêm script giả XHR trả `/api/auth/refresh` → `{ access_token: "fake" }`, `/api/auth/me` → `{ user }`, `/api/*` khác → rỗng, `history.replaceState` sang `/playlists`; dựng hàng chờ qua `window.__store`). Kiểm ở 1280×800, 820×1180, 390×844:
  - máy lớn: rê chuột → thẻ đang phát; bấm chấm / lướt → tài khoản; bấm avatar → tài khoản; kéo thanh tiến trình ra ngoài notch không đóng.
  - đổi bài khi đang mở → thẻ cập nhật, không nháy.
  - xoá hàng chờ khi đang ở thẻ đang phát → về tài khoản / đóng.
  - điện thoại: viên có thẻ nhạc mỏng, không tự ẩn sau 3s; bấm avatar → tài khoản + chấm; Esc → về thẻ mỏng; `/listen` → chỉ hàng icon.
  - không cuộn ngang trang ở mọi cỡ (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 4:** Xoá `notch-test.html`. Commit `Feat: Notch có thẻ đang phát thay Music Layer`.

### Task 6: Soát cuối

- [ ] **Step 1:** `graphify update .`; diff thu gọn `git diff v2/main...HEAD` (phần chỉ xoá Music Layer liệt kê tên file).
- [ ] **Step 2:** Soát bằng subagent **Opus** (memory `review-cost`: đụng trình phát) với Review Focus ở trên.
- [ ] **Step 3:** Sửa Critical/Important; báo người dùng góp ý; sửa góp ý rồi gộp commit một lượt; merge vào `v2/main` khi người dùng bảo.
