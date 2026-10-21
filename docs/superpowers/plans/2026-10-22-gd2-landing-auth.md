# GĐ2 · Landing & Đăng nhập: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay landing tạm bằng landing cuộn 3 bước có Matcappa bay/nói; làm lại trang Đăng nhập/Đăng ký **giữ bố cục v1** (một thẻ giữa màn hình) bằng component + màu matcha, có Matcappa bay lượn quanh; đăng xuất thì dừng nhạc và về landing.

> **Đổi theo ý bạn (22/10):** trang đăng nhập/đăng ký KHÔNG theo `auth.html`: giữ bố cục v1 (`SignInForm` / `SignUpForm`: thẻ giữa màn hình, tiêu đề, ô nhập xếp dọc, nút, dòng chuyển chế độ), chỉ đổi component và màu; **bỏ** khu 4 thẻ tự lướt; **thêm** Matcappa bay lượn.

**Architecture:** Logic thuần (bước landing, vị trí mascot, kiểm tra form, ánh xạ lỗi) tách vào file `.js` có test `node --test`; component React chỉ nối logic với giao diện. Đĩa than thành component dùng chung `Vinyl` (GĐ5 dùng lại). Đăng nhập vẫn gọi `login` / `register` của `AuthContext`, không sửa context.

**Tech Stack:** React 19, Vite 6, Tailwind 3, framer-motion 12, React Router 6, lucide-react, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-21-ui-rebuild-design.md` (mục 3, 4, 5, 6, 7.1, 7.2, 10). Yêu cầu gốc: `docs/report/donatefy-v2-plan.md` mục 6.1, 6.2, FR-01…FR-05, FR-51. Kế hoạch GĐ1 (đã xong): `docs/superpowers/plans/2026-10-22-gd1-foundation.md`.

## Global Constraints

- Nhánh `v2/landing-auth` (cắt từ `v2/main`). Commit tiếng Việt `Feat:` / `Fix:` / `Chore:`, kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Không sửa `src/services/**`, `src/contexts/**`, `src/hooks/**` có sẵn, `src/utils/**`. `src/app/slices/playerSlice.js` chỉ được **thêm** reducer, kèm test.
- Không thêm thư viện.
- Màu / font / chuyển động / kính theo Global Constraints của kế hoạch GĐ1 (token `matcha-1..4`, `cream`, `ink`, `ink-soft`, `mascot`; `font-script` chỉ chữ không dấu; `font-hand` cho chữ viết tay có dấu; `ease-matcha`; `duration-200|400|900`).
- Mascot: không bóng đổ, không né chuột, bong bóng không nút, tự tắt 2600ms, rộng tối đa 360px.
- Bản mẫu là chuẩn hình cho landing: `.superpowers/brainstorm/landing-mascot.html` (câu chữ lấy nguyên). Trang đăng nhập/đăng ký: bố cục v1, câu chữ tiếng Việt lấy từ `auth.html` (`TEXT` dòng 256–261), không dùng phần trái của `auth.html`.
- Mỗi task kết thúc: `npm test` qua, `npm run build` không lỗi, `npx eslint` trên file đã đụng không lỗi, mở preview `donatefy-dev` (cổng 3000) không lỗi đỏ ngoài lỗi mạng khi backend tắt.

## Review Focus

1. **Lăn touchpad nhanh / quán tính** (hàng chục sự kiện `wheel` nhỏ liên tiếp) → chỉ sang đúng 1 bước mỗi cú, không nhảy 2 bước, không kẹt. Test: Task 2 `wheel cộng dồn`, Task 4 Step 4 thử tay.
2. **Màn hình thấp (cao 600px) hoặc hẹp (360px)** → mỗi bước thu nhỏ vừa khung, không có thanh cuộn, mascot không che nút "Bắt đầu nghe". Test: Task 2 `fitScale`, Task 4 Step 4 + Task 5 Step 4 bằng `resize_window`.
3. **Bấm Tab qua landing** → chỉ focus được nút của bước đang hiện (bước khác `inert`), Enter trên chấm điều hướng đổi bước. Test: Task 4 Step 4.
4. **Đăng ký với tên đã tồn tại / sai mật khẩu / mất mạng** → lỗi hiện dưới ô liên quan (tên trùng) hoặc dưới form (sai đăng nhập, mất mạng) bằng câu thân thiện, không lộ lỗi kỹ thuật; form không bị xoá. Test: Task 6 `mapAuthError`, Task 7 Step 4.
5. **Bấm gửi 2 lần liên tục** khi đang chờ API → chỉ gọi 1 lần. Test: Task 7 Step 4.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/app/slices/playerSlice.js`, `playerSlice.test.js` | Thêm reducer `resetPlayer` (dừng nhạc khi đăng xuất) |
| `src/hooks/useLogout.js` | Mới: đăng xuất = `resetPlayer` + `logout` + về `/` |
| `src/routes/AppRouter.jsx` | Sửa: giữ `#hash`, `GuestOnly` chờ `loading`, `/` và `/login` `/register` dùng trang mới (lazy) |
| `src/mascot/Matcappa.jsx`, `matcappa.css` | Sửa: thêm `talking`, `look`, `bob`; reduced-motion tắt fade lá |
| `src/design/Vinyl.jsx` | Mới: đĩa than latte-matcha dùng chung |
| `src/components/Loader/PageLoader/Loader.jsx` | Sửa: thêm `decorative` |
| `src/features/landing/stepper.js`, `stepper.test.js` | Mới: logic bước, cuộn, phím, vuốt, thu nhỏ |
| `src/mascot/flight.js`, `flight.test.js` | Mới: vị trí góc + điểm bay lượn của mascot (dùng chung landing và auth) |
| `src/mascot/FlyingMascot.jsx` | Mới: mascot nổi bay tới điểm cho trước, nhìn theo chuột, nói khi chuột lại gần |
| `src/mascot/lines.js` | Sửa: thêm `AUTH_LINES` |
| `src/features/landing/LandingPage.jsx`, `scenes.jsx` | Mới: landing |
| `src/features/auth/authForm.js`, `authForm.test.js` | Mới: kiểm tra form, ánh xạ lỗi, kiểm tra ảnh |
| `src/features/auth/AuthPage.jsx`, `AvatarPicker.jsx` | Mới: trang đăng nhập / đăng ký (bố cục v1) |
| `src/pages/LandingStub.jsx` | Xoá |

---

### Task 1: Dừng nhạc khi đăng xuất + sửa các minor GĐ1

**Files:**
- Modify: `src/app/slices/playerSlice.js`, `src/app/slices/playerSlice.test.js`, `src/routes/AppRouter.jsx`, `src/mascot/matcappa.css`, `src/layouts/Header.jsx`, `src/components/LogoutButton.jsx`
- Create: `src/hooks/useLogout.js`

**Interfaces:**
- Produces:
  - action `resetPlayer()`: trả state về `initialState` nhưng **giữ** `volume` và `muted`.
  - `useLogout(): () => void`: `dispatch(resetPlayer())`, gọi `useAuth().logout()`, `navigate("/", { replace: true })`.

- [ ] **Step 1: Viết test** cuối `playerSlice.test.js` (cùng kiểu `assert` đang dùng, import thêm `resetPlayer`):

```js
// Đăng xuất: dừng nhạc, xoá hàng chờ, giữ âm lượng
s = run(playContext({ songs, startIndex: 1 }), setVolume(0.3), toggleMute(), resetPlayer());
assert.equal(current(s), undefined);
assert.equal(s.isPlaying, false);
assert.deepEqual(s.queue, []);
assert.equal(s.position, -1);
assert.equal(s.volume, 0.3);
assert.equal(s.muted, true);
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL (`resetPlayer` không phải hàm / undefined).
- [ ] **Step 3: Thêm reducer `resetPlayer`** vào `playerSlice.js` và export.
- [ ] **Step 4: Chạy** `npm test`. Kỳ vọng: pass hết.
- [ ] **Step 5: `useLogout`** theo interface; dùng ở `Header.jsx` (nút "Đăng xuất") và `LogoutButton.jsx` v1 thay cho `logout` trực tiếp.
- [ ] **Step 6: Minor GĐ1:**
  - `AppRouter.jsx` `GuestOnly`: `if (!user && loading) return <FullLoader />`; đích quay lại là `` `${from.pathname}${from.search}${from.hash}` ``.
  - `matcappa.css`: trong `@media (prefers-reduced-motion: reduce)` thêm `.mc-leaves, .mc-whirl { transition: none; }`.
- [ ] **Step 7: Kiểm tra tay**: với user giả trong `localStorage` (như GĐ1, không token), đang phát… không có backend thì chỉ kiểm: bấm "Đăng xuất" trên header ở `/listen` → về `/`, `localStorage.user` bị xoá. Dọn `localStorage` sau khi thử.
- [ ] **Step 8: Commit** `Feat: Đăng xuất dừng nhạc và về landing, sửa các lỗi nhỏ của GĐ1`

---

### Task 2: Logic landing thuần (`stepper.js`)

**Files:**
- Create: `src/features/landing/stepper.js`, `src/features/landing/stepper.test.js`, `src/mascot/flight.js`, `src/mascot/flight.test.js`

**Interfaces:**
- Produces:
  - `STEP_COUNT = 3`, `LOCK_MS = 1000`, `WHEEL_THRESHOLD = 40`, `SWIPE_MIN = 50`.
  - `accumulateWheel(acc: number, deltaY: number): { acc: number, dir: -1 | 0 | 1 }`: cộng dồn; khi `|acc + deltaY| > 40` trả `dir = sign`, `acc = 0`; ngược lại `dir = 0`. (Việc reset `acc` sau 160ms không lăn nằm ở component.)
  - `stepFromKey(key: string, step: number, count = STEP_COUNT): number | null`: `ArrowDown` / `PageDown` / `" "` → `step + 1`; `ArrowUp` / `PageUp` → `step - 1`; `Home` → `0`; `End` → `count - 1`; phím khác → `null`. Kết quả bị kẹp trong `[0, count - 1]`.
  - `swipeDir(startY: number, endY: number): -1 | 0 | 1`: `startY - endY > 50` → `1`; `< -50` → `-1`; còn lại `0`.
  - `clampStep(n: number, count = STEP_COUNT): number`.
  - `MASCOT_SPOTS = [{ corner: "bl", pose: "stand" }, { corner: "tr", pose: "hug-vinyl" }, { corner: "br", pose: "hug-knees" }]`.
  - `fitScale(avail: {w, h}, box: {w, h}): number` = `Math.min(1, avail.h / box.h, avail.w / box.w)`.
- Produces (`src/mascot/flight.js`, dùng chung):
  - `cornerXY(corner: "bl"|"tr"|"br"|"tl", pet: {w, h}, view: {W, H}): {x, y}`: đúng công thức bản mẫu `landing-mascot.html` dòng 387–390 (`pad = W < 820 ? 12 : 24`; trái `x = pad`; phải `x = W - w - pad - (top ? 8 : 0)`; trên `y = pad`; dưới `y = H - h - (W < 820 ? 56 : 72)`).
  - `pickWanderSpot(pet: {w, h}, view: {W, H}, avoid: {x, y, w, h}, last: {x, y} | null, rand = Math.random): {x, y}`: điểm ngẫu nhiên trong màn hình (cách mép `pad` như trên), **không đè** lên hình chữ nhật `avoid` (thẻ form, nới thêm 16px mỗi phía) và cách `last` ít nhất `min(W, H) / 4`; thử tối đa 20 lần, không được thì trả góc `cornerXY` xa `last` nhất.

- [ ] **Step 1: Viết test** `stepper.test.js` (`node:test`):

```js
test("wheel cộng dồn: nhiều cú nhỏ chỉ ra 1 bước", () => {
  let acc = 0, dirs = [];
  for (const d of [8, 9, 10, 12, 15, 20]) { const r = accumulateWheel(acc, d); acc = r.acc; if (r.dir) dirs.push(r.dir); }
  assert.deepEqual(dirs, [1]);
});
test("wheel lên", () => assert.deepEqual(accumulateWheel(-30, -20), { acc: 0, dir: -1 }));
test("phím", () => {
  assert.equal(stepFromKey("ArrowDown", 0), 1);
  assert.equal(stepFromKey(" ", 1), 2);
  assert.equal(stepFromKey("PageUp", 0), 0);
  assert.equal(stepFromKey("End", 0), 2);
  assert.equal(stepFromKey("Home", 2), 0);
  assert.equal(stepFromKey("ArrowDown", 2), 2);
  assert.equal(stepFromKey("a", 1), null);
});
test("vuốt", () => {
  assert.equal(swipeDir(500, 400), 1);
  assert.equal(swipeDir(400, 500), -1);
  assert.equal(swipeDir(400, 430), 0);
});
test("fitScale không phóng to, thu theo chiều chật hơn", () => {
  assert.equal(fitScale({ w: 1000, h: 800 }, { w: 500, h: 400 }), 1);
  assert.equal(fitScale({ w: 1000, h: 300 }, { w: 500, h: 600 }), 0.5);
  assert.equal(fitScale({ w: 250, h: 900 }, { w: 500, h: 400 }), 0.5);
});
test("MASCOT_SPOTS khớp 3 bước", () => assert.deepEqual(MASCOT_SPOTS.map((s) => s.corner), ["bl", "tr", "br"]));
```

  và `src/mascot/flight.test.js`:

```js
test("góc mascot trên máy tính và điện thoại", () => {
  assert.deepEqual(cornerXY("bl", { w: 110, h: 119 }, { W: 1440, H: 900 }), { x: 24, y: 709 });
  assert.deepEqual(cornerXY("tr", { w: 110, h: 119 }, { W: 1440, H: 900 }), { x: 1298, y: 24 });
  assert.deepEqual(cornerXY("br", { w: 76, h: 82 }, { W: 360, H: 640 }), { x: 272, y: 502 });
});
test("bay lượn: không đè thẻ form, đủ xa điểm cũ, nằm trong màn hình", () => {
  const pet = { w: 110, h: 119 }, view = { W: 1440, H: 900 }, card = { x: 520, y: 200, w: 400, h: 500 };
  let last = null;
  for (let n = 0; n < 300; n++) {
    const p = pickWanderSpot(pet, view, card, last);
    const overlap = p.x < card.x + card.w + 16 && p.x + pet.w > card.x - 16 && p.y < card.y + card.h + 16 && p.y + pet.h > card.y - 16;
    assert.equal(overlap, false);
    assert.ok(p.x >= 24 && p.x + pet.w <= 1440 - 24 && p.y >= 24 && p.y + pet.h <= 900 - 24);
    if (last) assert.ok(Math.hypot(p.x - last.x, p.y - last.y) >= 900 / 4);
    last = p;
  }
});
test("bay lượn: màn quá chật thì về góc xa nhất", () => {
  const p = pickWanderSpot({ w: 76, h: 82 }, { W: 360, H: 640 }, { x: 0, y: 0, w: 360, h: 640 }, { x: 12, y: 12 }, () => 0.5);
  assert.deepEqual(p, cornerXY("br", { w: 76, h: 82 }, { W: 360, H: 640 }));
});
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL (module chưa có).
- [ ] **Step 3: Viết `stepper.js` và `src/mascot/flight.js`** theo interface.
- [ ] **Step 4: Chạy** `npm test`. Kỳ vọng: pass hết.
- [ ] **Step 5: Commit** `Feat: Logic bước landing và vị trí bay của mascot`

---

### Task 3: Hình dùng chung: `Vinyl`, loader trang trí, Matcappa nói/nhìn

**Files:**
- Create: `src/design/Vinyl.jsx`
- Modify: `src/design/index.js`, `src/components/Loader/PageLoader/Loader.jsx`, `src/mascot/Matcappa.jsx`, `src/mascot/matcappa.css`, `src/pages/DevUI.jsx`

**Interfaces:**
- Produces:
  - `Vinyl({ size = 236, label, spinning = true, className, style })`: đĩa latte-matcha theo `landing-mascot.html` dòng 64–76 (`conic-gradient` + rãnh + 2 đốm kem + `sheen`, quay 6s/vòng; viền trong 5px matcha-4 tỉ lệ theo `size`). `label`: chuỗi CSS `background` cho nhãn giữa (inset 35%, viền kem); mặc định `radial-gradient(circle,#e9e6da 0 7%,#3f6b1c 8% 100%)`. `spinning=false` → `animation-play-state: paused`. Reduced motion: không quay. `aria-hidden`. Export từ `src/design/index.js`.
  - `PageLoader({ ..., decorative = false })`: `decorative` thì không có `role="status"` và nhãn ẩn, cả khối `aria-hidden="true"`.
  - `Matcappa({ ..., talking = false, look = null, bob = true })`:
    - `talking`: mỏ nhấp (`scaleY(1.7)`, 0,22s, alternate, như bản mẫu dòng 151–152).
    - `look`: `{ x, y }` px dịch nhóm mắt (bản mẫu dòng 420: tối đa ±3 / ±2,5); transition 0,25s ease-out.
    - `bob=false` tắt nhún (dùng lúc đang bay).
    - Reduced motion: tắt `talking`.

- [ ] **Step 1: Viết `Vinyl.jsx`**, thêm `decorative` cho loader, thêm 3 prop cho Matcappa.
- [ ] **Step 2: `DevUI`**: thêm khu "Đĩa than" (`Vinyl` 160 quay, 160 dừng, nhãn hồng `#e3b6c4`); trong khu Matcappa thêm 1 bản `talking` và 1 bản `look={{x:3,y:2.5}}`.
- [ ] **Step 3: Kiểm tra** `/dev/ui`: đĩa giống bản mẫu (mở `http://127.0.0.1:5178/landing-mascot.html` so); bản dừng không quay; mỏ nhấp; mắt lệch phải-dưới. Chụp màn hình.
- [ ] **Step 4: Commit** `Feat: Đĩa than dùng chung, loader trang trí, Matcappa nói và nhìn`

---

### Task 4: Trang landing 3 bước

**Files:**
- Create: `src/features/landing/LandingPage.jsx`, `src/features/landing/scenes.jsx`
- Modify: `src/routes/AppRouter.jsx`
- Delete: `src/pages/LandingStub.jsx`

**Interfaces:**
- Consumes: `stepper.js` (Task 2), `Vinyl`, `PageLoader decorative` (Task 3), `Button` (GĐ1), `useAuth().user`.
- Produces:
  - `LandingPage()` (default export, route `/`, tải bằng `React.lazy`). Giữ state `step` (0–2); Task 5 gắn `FlyingMascot` theo `step`.
  - `scenes.jsx` export `SCENES: { label: string, ghost: string, Body: (props: { onStart }) => JSX }[]` đúng 3 phần tử: `"Giới thiệu"/"Matcha"`, `"Trải nghiệm"/"Vinyl"`, `"Về Matcha Cha-Cha-Cha"/"Cha-Cha"`.

- [ ] **Step 1: `scenes.jsx`**: chép nội dung và bố cục 3 bước từ bản mẫu dòng 170–242 (chữ giữ nguyên). Bước 1: bìa "Cha-Cha-Cha" + `Vinyl` trượt ra (khi không phải bước hiện tại thì đĩa trượt vào bìa: `translateX(-110px)` + mờ). Bước 2: máy tính bảng minh hoạ (khung đen, màn `bg-cafe`, `Vinyl` nhãn `#e3b6c4`, dock 5 ô màu, thanh kính phải), nghiêng `rotateY(-14deg) rotateX(6deg)`, rê chuột bớt nghiêng. Bước 3: `PageLoader decorative size={348}` + chữ + "Thong thả thôi ~" (`font-hand`). Mọi nút "▶ Bắt đầu nghe" gọi `onStart`.
- [ ] **Step 2: `LandingPage.jsx`**:
  - Nền: gradient bản mẫu dòng 15 + 2 blob dịch theo `data-step` (dòng 24–28) + chữ ma `font-script` theo bước (dòng 30–33).
  - Mỗi cảnh `position: fixed; inset: 0`, lớp `prev/current/next` như bản mẫu dòng 46–53; phần tử con xuất hiện so le (`--d` 0,05s…0,5s), chuyển cảnh 900ms. Cảnh không hiện: `inert` + `aria-hidden`, dừng animation bên trong.
  - Điều khiển: `wheel` (listener `passive: false`, `preventDefault`, `accumulateWheel`, reset `acc` sau 160ms), `keydown` (`stepFromKey`), `touchstart`/`touchend` (`swipeDir`), chấm điều hướng (Glass, `aria-current="step"`), bộ đếm `01 / 03`, gợi ý "LĂN CHUỘT" ẩn ở bước cuối. Khoá `LOCK_MS` sau mỗi lần đổi bước.
  - `fit`: mỗi lần `resize` và sau `document.fonts.ready`, đặt `style.scale = fitScale(...)` cho khối nội dung của từng cảnh (padding cảnh `56px 24px 72px`).
  - `onStart`: `navigate(user ? "/listen" : "/login")`.
  - `html, body` không cuộn khi đang ở landing (đặt lúc mount, trả lại lúc unmount).
  - Reduced motion: đổi cảnh tức thì, đĩa / chasen đứng yên.
  - `< 820px`: bước 2 và 3 thành 1 cột căn giữa; bỏ nghiêng máy tính bảng; ẩn gợi ý (bản mẫu dòng 119–126).
- [ ] **Step 3: Route** `/` → `LandingPage` (lazy, fallback `FullLoader`). Xoá `LandingStub.jsx`.
- [ ] **Step 4: Kiểm tra tay** ở preview:
  - Lăn 1 nấc → bước 2; cuộn liên tục bằng JS `for (let i=0;i<30;i++) dispatchEvent(new WheelEvent('wheel',{deltaY:6}))` → chỉ +1 bước.
  - Phím ↓ ↑ Home End; bấm chấm thứ 3.
  - Tab: chỉ focus được nút trong bước hiện tại và các chấm.
  - `resize_window` 1440×600 và 360×640: không thanh cuộn, nội dung thu nhỏ vừa; chụp màn hình cả hai.
  - "Bắt đầu nghe" khi chưa đăng nhập → `/login`.
- [ ] **Step 5: Commit** `Feat: Landing cuộn 3 bước`

---

### Task 5: Mascot bay `FlyingMascot` + gắn vào landing

**Files:**
- Create: `src/mascot/FlyingMascot.jsx`
- Modify: `src/mascot/lines.js`, `src/mascot/lines.test.js`, `src/features/landing/LandingPage.jsx`

**Interfaces:**
- Consumes: `cornerXY`, `MASCOT_SPOTS` (Task 2), `Matcappa` + `talking` / `look` / `bob` (Task 3), `MascotSpeech`, `pickLine`, `LANDING_LINES` (GĐ1).
- Produces:
  - `FlyingMascot({ target: {x, y}, pose, lines: string[] })`: lớp `fixed` z-40, `pointer-events: none` trừ SVG; kích thước 110×119 (≥ 820px) hoặc 76×82. Export thêm `useMascotSize(): {w, h}` (theo `innerWidth`, cập nhật khi `resize`) để trang cha tính `target`.
  - `AUTH_LINES: string[]` (5 câu, giọng mascot: xưng "mình", gọi "bạn", kết bằng "~"): `"Nhập tên với mật khẩu là vào quán liền ~"`, `"Mình giữ chỗ cho bạn rồi nè ~"`, `"Chưa có tài khoản? Tạo một cái, nhanh lắm ~"`, `"Mình bay vòng vòng chờ bạn đó ~"`, `"Vào rồi mình pha nhạc cho nghe nha ~"`.

- [ ] **Step 1: Test** thêm vào `lines.test.js`: `AUTH_LINES` có 5 câu, câu nào cũng kết thúc bằng `"~"`. Chạy `npm test` → FAIL; thêm `AUTH_LINES` → pass.
- [ ] **Step 2: `FlyingMascot.jsx`**: khi `target` đổi thì bay (bản mẫu `landing-mascot.html` dòng 397–413): bật chong chóng (`propeller="spin"`, `bob={false}`), chờ 250ms, `element.animate` 4 khung (lên 40px nghiêng ±10° theo hướng bay, đỉnh cong `max(10, min(ay, by) - 90)`, hạ cánh) 1300ms `ease-in-out`, hẹn giờ dự phòng 1450ms gọi `anim.finish()`; xong đặt `transform` ở đích, chờ 200ms rồi hiện `pose` (`hug-vinyl` thì chong chóng quay, còn lại đứng yên). Đang bay mà `target` đổi tiếp: bay xong rồi bay tới `target` mới nhất. Lần đầu mount thì đặt thẳng vào `target`, không bay. Reduced motion: đặt thẳng đích, không bay.
  - Nhìn và nói (bản mẫu dòng 417–424, 449–461): `pointermove` trên `window` → `look`; chuột vào trong `1.1 × rộng` từ tâm (khi không bay) → `pickLine(lines, last)` rồi hiện `MascotSpeech` (bên phải nếu mascot ở nửa trái màn hình, ngược lại bên trái; luôn nằm trong màn hình), `talking` 900ms; phải ra xa `> 1.8 × rộng` mới nói lại. Bắt đầu bay thì tắt bong bóng. Bấm vào mascot: nhảy (đã có trong `Matcappa`).
- [ ] **Step 3: Gắn vào landing**: `<FlyingMascot target={cornerXY(MASCOT_SPOTS[step].corner, size, view)} pose={MASCOT_SPOTS[step].pose} lines={LANDING_LINES[step]} />`, tính lại khi `resize`.
- [ ] **Step 4: Kiểm tra tay**: đổi bước 1→2→3→1, mascot tới đúng góc bl / tr / br với tư thế đứng / ôm đĩa / ôm gối; rê chuột lại gần thì nói, rời ra rồi vào lại thì câu khác; bong bóng nằm trong màn hình ở 360×640; mascot không che nút "Bắt đầu nghe" ở 1440×600 và 360×640 (chụp màn hình).
- [ ] **Step 5: Commit** `Feat: Matcappa bay giữa các góc và nói trên landing`

---


### Task 6: Logic form đăng nhập / đăng ký (`authForm.js`)

**Files:**
- Create: `src/features/auth/authForm.js`, `src/features/auth/authForm.test.js`

**Interfaces:**
- Produces:
  - `validateAuth({ mode: "login"|"register", username, password }): { username?: string, password?: string }` (rỗng = hợp lệ). Câu lỗi:
    - tên trống: `"Bạn chưa nhập tên đăng nhập."`
    - (đăng ký) tên không khớp `/^[A-Za-z0-9_.]{3,30}$/`: `"Tên 3–30 ký tự, chỉ gồm chữ, số, _ và ."`
    - mật khẩu trống: `"Bạn chưa nhập mật khẩu."`
    - (đăng ký) < 6 ký tự: `"Mật khẩu cần ít nhất 6 ký tự."`
    - Tên được `trim()` trước khi kiểm; mật khẩu không trim.
  - `mapAuthError(message?: string): { field: "username" | null, text: string }`:
    - chứa `"đã tồn tại"` → `{ field: "username", text: "Tên tài khoản đã tồn tại." }`
    - chứa `"không chính xác"` → `{ field: null, text: "Tên tài khoản hoặc mật khẩu không chính xác." }`
    - `"Network Error"` hoặc rỗng → `{ field: null, text: "Quán đang mất sóng một chút, bạn thử lại sau nhé." }`
    - khác → `{ field: null, text: "Có gì đó chưa ổn, bạn thử lại nhé." }`
  - `validateAvatar(file?: {type, size}): string | null`: không có file → `null`; `type` không thuộc `image/jpeg|image/png|image/gif` → `"Ảnh cần là jpg, png hoặc gif."`; `size > 2 * 1024 * 1024` → `"Ảnh tối đa 2MB."`.

- [ ] **Step 1: Viết test** `authForm.test.js`:

```js
test("đăng nhập chỉ cần có tên và mật khẩu", () => {
  assert.deepEqual(validateAuth({ mode: "login", username: " a ", password: "1" }), {});
  assert.deepEqual(validateAuth({ mode: "login", username: "  ", password: "" }), {
    username: "Bạn chưa nhập tên đăng nhập.", password: "Bạn chưa nhập mật khẩu." });
});
test("đăng ký kiểm tên và độ dài", () => {
  assert.deepEqual(validateAuth({ mode: "register", username: "ab", password: "12345" }), {
    username: "Tên 3–30 ký tự, chỉ gồm chữ, số, _ và .",
    password: "Mật khẩu cần ít nhất 6 ký tự." });
  assert.deepEqual(validateAuth({ mode: "register", username: "duong.donate_1", password: "123456" }), {});
  assert.equal(validateAuth({ mode: "register", username: "có dấu", password: "123456" }).username, "Tên 3–30 ký tự, chỉ gồm chữ, số, _ và .");
});
test("ánh xạ lỗi server", () => {
  assert.deepEqual(mapAuthError("Username đã tồn tại"), { field: "username", text: "Tên tài khoản đã tồn tại." });
  assert.deepEqual(mapAuthError("Tên tài khoản hoặc mật khẩu không chính xác"), { field: null, text: "Tên tài khoản hoặc mật khẩu không chính xác." });
  assert.equal(mapAuthError("Network Error").text, "Quán đang mất sóng một chút, bạn thử lại sau nhé.");
  assert.equal(mapAuthError(undefined).text, "Quán đang mất sóng một chút, bạn thử lại sau nhé.");
  assert.equal(mapAuthError("Lỗi server").text, "Có gì đó chưa ổn, bạn thử lại nhé.");
});
test("ảnh đại diện", () => {
  assert.equal(validateAvatar(undefined), null);
  assert.equal(validateAvatar({ type: "image/png", size: 2 * 1024 * 1024 }), null);
  assert.equal(validateAvatar({ type: "image/webp", size: 10 }), "Ảnh cần là jpg, png hoặc gif.");
  assert.equal(validateAvatar({ type: "image/gif", size: 2 * 1024 * 1024 + 1 }), "Ảnh tối đa 2MB.");
});
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL (module chưa có).
- [ ] **Step 3: Viết `authForm.js`**.
- [ ] **Step 4: Chạy** `npm test`. Kỳ vọng: pass hết.
- [ ] **Step 5: Commit** `Feat: Kiểm tra form đăng nhập, đăng ký và ánh xạ lỗi thân thiện`

---

### Task 7: Trang Đăng nhập / Đăng ký (bố cục v1, giao diện matcha, mascot bay lượn)

**Files:**
- Create: `src/features/auth/AuthPage.jsx`, `src/features/auth/AvatarPicker.jsx`
- Modify: `src/routes/AppRouter.jsx`

**Interfaces:**
- Consumes: `validateAuth`, `mapAuthError`, `validateAvatar` (Task 6); `pickWanderSpot` (Task 2); `FlyingMascot`, `useMascotSize`, `AUTH_LINES` (Task 5); `useAuth().login(username, password)` / `register(username, password, avatarFile)` → `{ success, message }`; `Glass`, `Button`, `IconButton`, `PageLoader decorative`.
- Produces:
  - `AuthPage({ mode })`: `mode` lấy từ route (`/login` → `"login"`, `/register` → `"register"`). Route `/login`, `/register` dùng `AuthPage` (lazy) trong `GuestOnly`; bỏ `AuthFlow` khỏi `AppRouter` (không xoá file trong `contexts`).
  - `AvatarPicker({ file, onChange, error })`: vòng tròn 64px, bấm hoặc Enter/Space để chọn (`accept="image/png,image/jpeg,image/gif"`), xem trước bằng `URL.createObjectURL` (thu hồi khi đổi ảnh / unmount), chưa có ảnh thì hiện dấu +; lỗi hiện dưới.

- [ ] **Step 1: Bố cục giữ như v1** (`src/components/SignInForm.jsx`, `SignUpForm.jsx`): toàn màn hình, một thẻ ở giữa rộng tối đa `max-w-md`, tiêu đề căn giữa, các ô xếp dọc rộng hết thẻ, (đăng ký) ảnh đại diện ở trên cùng, dòng lỗi chung, nút gửi rộng hết thẻ, dòng chuyển chế độ dưới thẻ. Chỉ đổi:
  - nền: `bg-cafe` + 2 blob (matcha-1, `#f2c9c9`) thay gradient tím;
  - thẻ: `Glass` bo 32px, chữ `ink`;
  - ô nhập: nền `white/55`, viền `white/70`, bo 14px, cao 50px, focus viền matcha-3 + quầng `rgba(104,142,49,.18)` (`auth.html` dòng 83–85), lỗi viền `#b3261e`;
  - nút gửi: `Button` primary rộng hết thẻ;
  - câu chữ tiếng Việt: tiêu đề "Đăng nhập" / "Tạo tài khoản", mô tả nhỏ và nút theo `TEXT` trong `auth.html` dòng 256–261; dòng chuyển "Chưa có tài khoản? **Đăng ký ngay**" / "Đã có tài khoản? **Đăng nhập**" (link đổi URL `/register` ↔ `/login`, `replace`, **giữ** `location.state`).
  - Không có khu thẻ tự lướt, không có tab trượt.
- [ ] **Step 2: Ô nhập và gửi**:
  - Trường: (đăng ký) `AvatarPicker`; tên đăng nhập (`autocomplete="username"`); mật khẩu có `IconButton` "Hiện mật khẩu"/"Ẩn mật khẩu" (`aria-pressed`), `autocomplete` `current-password`/`new-password`; (đăng ký) gợi ý "Ít nhất 6 ký tự." dưới ô mật khẩu. **Không** có ô nhập lại mật khẩu (giống v1, bạn chốt 22/10).
  - Mỗi ô có `<label>` (ẩn bằng `sr-only` nếu giữ kiểu placeholder như v1), lỗi riêng dưới ô (`aria-invalid`, `aria-describedby`); lỗi chung `role="alert"`.
  - Gửi: `validateAuth` → có lỗi thì focus ô lỗi đầu tiên; không thì khoá form, phủ lớp chờ lên thẻ (`PageLoader decorative size={160}` + "Đang đánh matcha…" / "Đang pha chén đầu tiên…"), gọi `login`/`register`; thất bại → `mapAuthError` đặt lỗi vào ô `field` hoặc lỗi chung, mở khoá, giữ giá trị. Đang gửi thì bỏ qua lần gửi thứ hai. Thành công thì không làm gì thêm (`GuestOnly` tự chuyển trang).
  - Đổi chế độ: xoá lỗi, giữ tên đăng nhập.
- [ ] **Step 3: Mascot bay lượn**: đo hình chữ nhật thẻ (`getBoundingClientRect`, cập nhật khi `resize`); mỗi 5000ms (không đếm khi tab ẩn) chọn `pickWanderSpot(size, view, cardRect, last)` làm `target` cho `<FlyingMascot pose="stand" lines={AUTH_LINES} />`; lúc đang gửi form thì `pose="hug-vinyl"`. Reduced motion: không bay lượn, đứng yên ở góc dưới-trái.
- [ ] **Step 4: Kiểm tra tay** (backend có thể tắt):
  - `/register` mở thẳng ra form đăng ký; bấm "Đăng nhập" → URL `/login`; `from` vẫn còn trong `history.state` khi trước đó bị chuyển từ `/playlist/x`.
  - Gửi trống / tên "ab" / mật khẩu 5 ký tự (đăng ký) → đúng câu dưới đúng ô, focus ô đầu.
  - Backend tắt, gửi hợp lệ → lớp chờ hiện rồi tắt, lỗi chung "Quán đang mất sóng một chút, bạn thử lại sau nhé.", giá trị còn nguyên.
  - Gọi `form.requestSubmit()` 2 lần liền trong JS → chỉ 1 request `/api/auth/*` trong `read_network_requests`.
  - Ảnh > 2MB hoặc webp → lỗi dưới ô ảnh; png nhỏ → xem trước.
  - Chờ 15 giây: mascot bay ít nhất 2 lần, không lần nào đậu đè lên thẻ; rê chuột lại gần thì nói câu trong `AUTH_LINES`.
  - 360×640 và 1440×900: chụp màn hình.
  - Nếu bạn bật backend: đăng ký tên đã có → "Tên tài khoản đã tồn tại." dưới ô tên (nhờ bạn thử, tui không tạo tài khoản trong database của bạn).
- [ ] **Step 5: Commit** `Feat: Trang đăng nhập, đăng ký giao diện matcha có mascot bay lượn`


### Checkpoint GĐ2
- [ ] `npm test`, `npm run build` sạch; landing + auth chạy ở 360 / 768 / 1440px; console sạch ngoài lỗi mạng.
- [ ] Bạn thử đăng nhập thật với backend (kể cả quay lại `/playlist/:id`).
- [ ] Bạn duyệt. Duyệt xong merge `v2/landing-auth` → `v2/main`. Link xem thử Vercel cần push và cần sửa CORS ở backend (việc B4, chưa làm trong GĐ2).

---

## Ghi chú

- **Landing vẫn tải `react-player`** vì `MusicPlayer` mount ở `main.jsx`. Tách ra (NFR-02) để GĐ5, khi tách `MusicPlayer` thành bộ phát ẩn (spec mục 8, 12).
- **Thanh phát v1** vẫn hiện trên landing nếu đang có bài. Sau Task 1, đăng xuất sẽ xoá hàng chờ nên thanh này biến mất; người dùng đã đăng nhập mở `/` thì vẫn thấy thanh v1 cho tới GĐ5.
- `AuthFlow`, `SignInForm`, `SignUpForm` v1 không còn dùng nhưng chưa xoá được vì `AuthContext` (không sửa) còn import. Dọn ở GĐ6.
