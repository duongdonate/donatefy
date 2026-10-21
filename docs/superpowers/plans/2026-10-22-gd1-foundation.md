# GĐ1 · Nền tảng & Matcappa: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng nền cho giao diện v2: design tokens + font, component nền (Glass, Button, IconButton), loader chasen, mascot Matcappa + bong bóng nói, khung `AppShell` tự ẩn, và sơ đồ route mới. App vẫn chạy được, phần v1 vẫn dùng được.

**Architecture:** Token màu là CSS variable dạng kênh RGB, khai báo trong Tailwind để dùng được modifier độ mờ. Component mới nằm trong `src/design`, `src/mascot`, `src/layouts`, `src/pages`, không đụng `src/app`, `src/services`, `src/contexts`. Giao diện v1 (HomePage, trang playlist) **tạm thời** vẫn chạy dưới `DefaultLayout` cho tới khi GĐ5/GĐ4 thay.

**Tech Stack:** React 19, Vite 6, Tailwind 3, framer-motion 12, React Router 6, lucide-react. Test là file `*.test.js` chạy bằng `node --test` (Node 20).

**Spec:** `docs/superpowers/specs/2026-10-21-ui-rebuild-design.md` (đọc mục 3, 4, 5, 6). Yêu cầu gốc: `docs/report/donatefy-v2-plan.md`.

## Global Constraints

- Không sửa `src/app/**`, `src/services/**`, `src/contexts/**`, `src/hooks/**` (chỉ được **thêm** file mới trong `src/hooks`).
- Không thêm thư viện mới.
- Màu: matcha-1 `#a7c4a7`, matcha-2 `#87a96b`, matcha-3 `#688e31`, matcha-4 `#497300`, cream `#f4f1df`, ink `#1f2e17`, ink-soft `#55624c`, mascot `#d8eca0`.
- Font: Be Vietnam Pro 400–800 (mọi nội dung); Yellowtail **chỉ** chữ không dấu; Dancing Script cho chữ viết tay có dấu.
- Chuyển động: 200 / 400 / 900ms, `cubic-bezier(.2,.8,.2,1)`; chỉ animate `transform` / `opacity`; `prefers-reduced-motion: reduce` thì tắt quay / bay / nhún.
- Kính: dùng class `.glass` có sẵn trong `src/App.css`, blur thêm tại chỗ (mặc định 18px), tối đa 2 lớp kính chồng.
- Mascot: SVG 2D, **không bóng đổ** (bỏ ellipse bóng dưới chân có trong bản mẫu), không phát sáng.
- Chữ trên giao diện: tiếng Việt, giọng thân mật; nút chỉ có icon phải có `aria-label` tiếng Việt.
- Mỗi task kết thúc: `npm test` qua, `npm run build` không lỗi, mở preview `donatefy-dev` (`.claude/launch.json`, cổng 3000) không lỗi đỏ trong console, phát / dừng một bài ở `/playlist/:id` v1 vẫn chạy.
- Commit tiếng Việt dạng `Feat: …` / `Chore: …`, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Làm trên nhánh `v2/foundation`.

## Review Focus

1. **Đã đăng nhập, mở thẳng link chia sẻ `/playlist/:id` sau khi tải lại trang** → phải tới đúng playlist, không bị đá về `/login` trong lúc `AuthContext` còn đang `loading`. Test: Task 8 Step 4 (thử tay có `loading`).
2. **Chưa đăng nhập, mở `/playlist/:id`** → `/login` → đăng nhập xong quay lại đúng `/playlist/:id`, không về `/listen`. Test: Task 8 Step 4.
3. **Người dùng bật giảm chuyển động** → mascot không nhún, chong chóng không quay (vẫn hiện dạng đĩa tĩnh), loader đứng yên, header/rail hiện/ẩn tức thì. Test: Task 4, 5, 7 bước kiểm tra với DevTools "Emulate prefers-reduced-motion".
4. **Dùng bàn phím trong AppShell**: Tab vào header khi nó đang ẩn → header hiện ra và **không ẩn lại** khi focus còn bên trong. Test: Task 7 Step 3.
5. **`pickLine` với danh sách 1 câu hoặc rỗng** → không lặp vô hạn (bản mẫu dùng `do…while` sẽ treo khi chỉ có 1 câu). Test: Task 6 Step 1.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `package.json` | Sửa: chuyển thư viện chạy thật sang `dependencies`, thêm script `test` |
| `index.html` | Sửa: `lang="vi"`, tải Google Fonts |
| `tailwind.config.js` | Sửa: màu `matcha-*`, `cream`, `ink`, `ink-soft`, `mascot`; font; thời lượng + easing |
| `src/index.css` | Sửa: biến kênh RGB cho sáng/tối, utility `bg-cafe` |
| `.superpowers/brainstorm/dark-palette.html` | Tạo: bản mẫu bảng màu tối để bạn chọn |
| `src/design/Glass.jsx`, `Button.jsx`, `IconButton.jsx`, `index.js` | Tạo: component nền |
| `src/pages/DevUI.jsx` | Tạo: trang trưng bày (chỉ dev) |
| `src/components/Loader/PageLoader/Loader.jsx`, `Loader.module.css` | Viết lại: loader chasen |
| `src/mascot/Matcappa.jsx`, `matcappa.css` | Tạo: mascot |
| `src/mascot/lines.js`, `lines.test.js`, `MascotSpeech.jsx` | Tạo: chọn câu + bong bóng |
| `src/hooks/useIdle.js` | Tạo: phát hiện đứng yên |
| `src/layouts/AppShell.jsx`, `Header.jsx`, `Rail.jsx` | Tạo: khung v2 |
| `src/pages/ListenPage.jsx`, `LandingStub.jsx`, `NotFound.jsx` | Tạo: trang tạm cho `/listen`, `/` và 404 |
| `src/routes/AppRouter.jsx` | Viết lại: sơ đồ route mới |

---

### Task 1: Dọn `package.json` + `npm test`

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: lệnh `npm test` chạy mọi `**/*.test.js` (ngoài `node_modules`) bằng `node --test`.

- [ ] **Step 1: Chuyển sang `dependencies`**: `@reduxjs/toolkit`, `axios`, `lucide-react`, `react-player`, `react-redux`, `react-router-dom`. Giữ nguyên phiên bản. Thêm `"test": "node --test"` vào `scripts`.
- [ ] **Step 2: Cập nhật lockfile**: `npm install`. Kỳ vọng: không đổi phiên bản nào, chỉ đổi mục `dev` trong `package-lock.json`.
- [ ] **Step 3: Chạy test**: `npm test`. Kỳ vọng: 2 file (`playerSlice.test.js`, `marquee.test.js`) báo `pass`, `fail 0`.
- [ ] **Step 4: Build**: `npm run build`. Kỳ vọng: không lỗi. Nếu lỗi ở `SearchBarWithDropdown.jsx` (import `{ Loader }` không tồn tại) thì **ghi lại, không sửa** trong task này; báo trong phần tổng kết.
- [ ] **Step 5: Commit** `Chore: Chuyển thư viện chạy thật sang dependencies, thêm npm test`

---

### Task 2: Design tokens, font, Tailwind kênh RGB + bản mẫu màu tối

**Files:**
- Modify: `index.html`, `tailwind.config.js`, `src/index.css`
- Create: `.superpowers/brainstorm/dark-palette.html`

**Interfaces:**
- Produces (class Tailwind dùng ở mọi task sau): `bg/text/border-matcha-{1,2,3,4}`, `cream`, `ink`, `ink-soft`, `mascot` (đều nhận `/<độ mờ>`); `font-sans` (Be Vietnam Pro), `font-script` (Yellowtail), `font-hand` (Dancing Script); `duration-200|400|900`; `ease-matcha`; utility `bg-cafe` (nền sáng của app).

- [ ] **Step 1: `index.html`**: `lang="vi"`; thêm `preconnect` + link Google Fonts `Be+Vietnam+Pro:wght@400;500;600;700;800`, `Yellowtail`, `Dancing+Script:wght@500;700`, `display=swap`.
- [ ] **Step 2: `src/index.css`**: trong `@layer base`, thêm vào `:root` các biến kênh RGB (`--matcha-1: 167 196 167;` … `--mascot: 216 236 160;`). Trong `.dark`, thêm cùng tên biến với giá trị **đề xuất** (cream → nền tối `24 32 20`, ink → `238 243 230`, ink-soft → `176 190 166`, matcha giữ nguyên). Không xoá biến shadcn cũ (v1 còn dùng). Thêm `@layer utilities { .bg-cafe { background: linear-gradient(160deg,#dfe8c9 0%,#f4efe1 55%,#e7ecd8 100%); } .dark .bg-cafe { … bản tối … } }`.
- [ ] **Step 3: `tailwind.config.js`**: trong `theme.extend.colors` thêm `matcha: { 1: "rgb(var(--matcha-1) / <alpha-value>)", … }`, `cream`, `ink`, `"ink-soft"`, `mascot` cùng mẫu; `fontFamily: { sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"], script: ["Yellowtail", "cursive"], hand: ['"Dancing Script"', "cursive"] }`; `transitionDuration: { 400: "400ms", 900: "900ms" }`; `transitionTimingFunction: { matcha: "cubic-bezier(.2,.8,.2,1)" }`.
- [ ] **Step 4: Kiểm tra**: mở preview, trong console chạy `getComputedStyle(Object.assign(document.body.appendChild(document.createElement('div')),{className:'bg-matcha-4/50'})).backgroundColor`. Kỳ vọng: `rgba(73, 115, 0, 0.5)`. Trang v1 vẫn hiển thị bình thường (chỉ đổi font).
- [ ] **Step 5: Bản mẫu màu tối**: tạo `.superpowers/brainstorm/dark-palette.html`, gồm 2–3 phương án tối đặt cạnh nhau. Mỗi phương án là một khung Now Playing rút gọn (nền, kính, đĩa, chữ ink/ink-soft, nút matcha-4), lấy bố cục từ `visual-direction-v3.html`. **Dừng lại, hỏi bạn chọn phương án nào**, rồi điền giá trị đã chọn vào `.dark` ở Step 2.
- [ ] **Step 6: Commit** `Feat: Design tokens matcha, font và màu Tailwind dạng kênh RGB`

---

### Task 3: Component nền `Glass`, `Button`, `IconButton` + `/dev/ui`

**Files:**
- Create: `src/design/Glass.jsx`, `src/design/Button.jsx`, `src/design/IconButton.jsx`, `src/design/index.js`, `src/pages/DevUI.jsx`
- Modify: `src/routes/AppRouter.jsx` (chỉ thêm route `/dev/ui`)

**Interfaces:**
- Produces:
  - `Glass({ as = "div", blur = 18, className, style, ...props })`: render `as` với class `glass` + `style.backdropFilter = blur(${blur}px)` (kèm `WebkitBackdropFilter`).
  - `Button({ variant = "primary" | "secondary" | "ghost", size = "md" | "sm", ...buttonProps })`: `primary` nền `matcha-4` chữ trắng; `secondary` kính sáng chữ `ink`; `ghost` trong suốt. Bo tròn hoàn toàn (`rounded-full`).
  - `IconButton({ label, pressed, size = 40, children, ...buttonProps })`: `aria-label={label}`, `title={label}`, `aria-pressed` chỉ khi `pressed !== undefined`; tròn; khi `pressed` thì nền `white/55` chữ `matcha-4` (như `.sbtn.on` trong `queue-overlay.html`).
  - Cả ba: `focus-visible:ring-2 ring-matcha-4 ring-offset-2`; `export { Glass, Button, IconButton }` từ `src/design/index.js`.
  - Route `/dev/ui` (component `DevUI`) chỉ khi `import.meta.env.DEV`, dùng `React.lazy` để không vào bản build production.

- [ ] **Step 1: Viết 3 component** theo interface trên.
- [ ] **Step 2: `DevUI.jsx`**: nền `bg-cafe`; khu "Kính" (Glass blur 8 / 18 / 30); khu "Nút" (mọi variant × size, trạng thái disabled); khu "Icon" (IconButton thường và `pressed`, dùng icon lucide `Shuffle`, `ListMusic`, `Volume2`); nút đổi sáng/tối bằng `useTheme().toggleTheme`. Task 4–6 sẽ thêm khu của mình vào trang này.
- [ ] **Step 3: Route `/dev/ui`** trong `AppRouter.jsx`: `{import.meta.env.DEV && <Route path="/dev/ui" element={<Suspense><DevUI/></Suspense>} />}` với `const DevUI = lazy(() => import("../pages/DevUI"))`. Đặt ngoài các route cần đăng nhập.
- [ ] **Step 4: Kiểm tra**: mở `/dev/ui` ở preview, chụp màn hình sáng + tối. Tab qua từng nút: luôn thấy viền focus. `npm run build`, rồi `grep -r "Kính" dist/assets` không ra kết quả (trang dev không lọt vào bản build).
- [ ] **Step 5: Commit** `Feat: Component nền Glass, Button, IconButton và trang /dev/ui`

---

### Task 4: Loader chasen

**Files:**
- Modify: `src/components/Loader/PageLoader/Loader.jsx`, `src/components/Loader/PageLoader/Loader.module.css`, `src/pages/DevUI.jsx`

**Interfaces:**
- Produces: `PageLoader({ size = 120, label = "Đang pha nhạc…" })` (giữ tên export `PageLoader` từ `src/components/Loader`). `role="status"`, nhãn đọc được bằng trình đọc màn hình.

- [ ] **Step 1: Port phương án A** trong `.superpowers/brainstorm/matcha-effects.html` (khối HTML quanh dòng 110–130, CSS dòng 20–53, hàm vẽ chasen quanh dòng 189). Chén chawan nhìn nghiêng, chasen đi vòng quanh miệng chén **0,8s/vòng**, quẹt qua lại **0,3s**, bọt nổi. Vẽ bằng JSX SVG, CSS trong `Loader.module.css`. Không port phương án B, C.
- [ ] **Step 2: Giảm chuyển động**: trong `@media (prefers-reduced-motion: reduce)` tắt mọi animation; chasen đứng yên trong chén.
- [ ] **Step 3: Thêm khu "Loader"** vào `DevUI` (size 80 và 160).
- [ ] **Step 4: Kiểm tra**: đặt cạnh bản mẫu (`http://127.0.0.1:5178/matcha-effects.html`), nhịp giống nhau; bật "Emulate CSS prefers-reduced-motion: reduce" trong DevTools thì đứng yên. Chụp màn hình.
- [ ] **Step 5: Commit** `Feat: Loader chasen đánh matcha`

---

### Task 5: Component `Matcappa`

**Files:**
- Create: `src/mascot/Matcappa.jsx`, `src/mascot/matcappa.css`
- Modify: `src/pages/DevUI.jsx`

**Interfaces:**
- Produces: `Matcappa({ pose = "stand", propeller, size = 160, label, onClick, className })`
  - `pose`: `"stand" | "hug-knees" | "hug-vinyl" | "doze"` (tương ứng `stand`, `hug`, `vinyl`, `sleep` trong bản mẫu).
  - `propeller`: `"spin" | "still" | "droop"`; mặc định `"droop"` khi `pose === "doze"`, ngược lại `"still"`.
  - `size`: chiều cao px của SVG (`viewBox="0 0 200 216"`).
  - `label`: `aria-label`, mặc định `"Matcappa"`; SVG có `role="img"`.
  - Bấm (`onClick` hoặc không): nhảy (`hop` 0,6s) + quay chong chóng 1,8s rồi về `propeller` hiện tại, sau đó gọi `onClick?.(e)`.

- [ ] **Step 1: Port SVG** từ `.superpowers/brainstorm/matcappa-smiski-v3.html` (hàm `eyes`, `LEAVES`, `DROOP`, `whirl`, `head`, `smiski`, dòng 75–133) sang JSX. **Bỏ** ellipse bóng `rgba(31,46,23,.14)` dưới chân. Id gradient dùng `useId()` để nhiều Matcappa trên một trang không đụng nhau. Chữ "z" chỉ có ở `doze`.
- [ ] **Step 2: CSS** trong `matcappa.css`: `bob` 2,6s, `blink` 4,8s, `streak` 0,28s / 0,2s, `flick` 0,12s, `disc` 3s, `hop` 0,6s, đúng như bản mẫu dòng 31–47. `propeller="spin"` thì ẩn lá, hiện đĩa elip (`whirl`). Reduced motion: tắt hết animation, `spin` vẫn hiện đĩa elip tĩnh.
- [ ] **Step 3: Thêm khu "Matcappa"** vào `DevUI`: lưới 4 tư thế × 3 trạng thái chong chóng, cùng 1 bản lớn bấm được.
- [ ] **Step 4: Kiểm tra**: so với bản mẫu (`http://127.0.0.1:5178/matcappa-smiski-v3.html`); không có bóng dưới chân; bấm thì nhảy + quay rồi dừng; reduced motion đúng như Global Constraints. Chụp màn hình lưới.
- [ ] **Step 5: Commit** `Feat: Mascot Matcappa SVG với 4 tư thế và chong chóng`

---

### Task 6: `pickLine` + bong bóng `MascotSpeech`

**Files:**
- Create: `src/mascot/lines.js`, `src/mascot/lines.test.js`, `src/mascot/MascotSpeech.jsx`
- Modify: `src/pages/DevUI.jsx`

**Interfaces:**
- Produces:
  - `pickLine(lines: string[], lastIndex: number, rand = Math.random): number`: trả về chỉ số câu; `-1` nếu `lines` rỗng; `0` nếu chỉ có 1 câu; ngược lại luôn `!== lastIndex`. **Không** dùng vòng lặp thử lại (chọn trong `length - 1` câu còn lại rồi dịch chỉ số).
  - `LANDING_LINES: string[][]`: 3 nhóm câu theo bước, chép nguyên từ `landing-mascot.html` dòng 435–437.
  - `MascotSpeech({ text, show, side = "right", onHide, duration = 2600 })`: bong bóng `max-w-[360px]`, không nút, không hiệu ứng gõ, `aria-live="polite"`; khi `show` bật thì sau `duration` ms gọi `onHide()`; đổi `text` khi đang hiện thì đếm lại từ đầu. Mũi nhọn chỉ về phía mascot theo `side`.

- [ ] **Step 1: Viết test** `src/mascot/lines.test.js` (dùng `node:test` + `node:assert/strict`):

```js
test("không bao giờ trả lại câu vừa nói", () => {
  const lines = ["a", "b", "c", "d"];
  let last = -1;
  for (let n = 0; n < 1000; n++) { const i = pickLine(lines, last); assert.notEqual(i, last); assert.ok(i >= 0 && i < 4); last = i; }
});
test("biên: 1 câu và rỗng", () => {
  assert.equal(pickLine(["x"], 0), 0);
  assert.equal(pickLine([], -1), -1);
});
test("rand ở hai đầu không vượt biên", () => {
  assert.equal(pickLine(["a", "b", "c"], 0, () => 0), 1);
  assert.equal(pickLine(["a", "b", "c"], 2, () => 0.999), 1);
});
test("LANDING_LINES có 3 nhóm, mỗi nhóm 5 câu", () => {
  assert.equal(LANDING_LINES.length, 3);
  LANDING_LINES.forEach((g) => assert.equal(g.length, 5));
});
```

- [ ] **Step 2: Chạy** `npm test`. Kỳ vọng: FAIL vì `lines.js` chưa tồn tại.
- [ ] **Step 3: Viết `lines.js`** theo interface.
- [ ] **Step 4: Chạy** `npm test`. Kỳ vọng: tất cả pass.
- [ ] **Step 5: Viết `MascotSpeech.jsx`**, rồi thêm vào `DevUI` một Matcappa: rê chuột vào thì hiện câu mới (`pickLine` trên `LANDING_LINES[0]`). Kiểm tra: tự tắt sau ~2,6 giây; rê vào lại ra câu khác; câu dài nhất xuống dòng trong khung 360px.
- [ ] **Step 6: Commit** `Feat: Bong bóng nói của Matcappa và bộ chọn câu không lặp`

---

### Task 7: `useIdle` + khung `AppShell`

**Files:**
- Create: `src/hooks/useIdle.js`, `src/layouts/AppShell.jsx`, `src/layouts/Header.jsx`, `src/layouts/Rail.jsx`

**Interfaces:**
- Produces:
  - `useIdle(timeout = 2500, { hold = false } = {}): boolean`: `true` khi không có `mousemove` / `pointerdown` / `keydown` / `touchstart` / `wheel` / `focusin` trên `window` trong `timeout` ms. Khi `hold` là `true` thì luôn `false`, và đếm lại từ đầu khi `hold` tắt. Listener dùng `{ passive: true }` và được gỡ khi unmount.
  - `AppShell({ children, right })`: toàn màn hình, nền `bg-cafe` + 3 blob mờ (matcha-2 / `#f2c9c9` / matcha-1, vị trí như `visual-direction-v3.html` dòng 140–142); render `Header`, `Rail`, `children` ở giữa, `right` ở mép phải (chỗ cho thanh kính C ở GĐ5, **luôn hiện**). Header + rail ẩn khi `useIdle(2500, { hold })`, với `hold` là chuột đang nằm trên header/rail **hoặc** focus đang ở trong header/rail (`focusin`/`focusout` + `contains`).
  - `Header()`: Glass bo tròn; mascot mini (`Matcappa size={32}`) + chữ "Matcha Cha-Cha-Cha" (`font-script`); bên phải là IconButton đổi sáng/tối (`useTheme`), avatar người dùng (`useAuth().user`), IconButton "Đăng xuất" (`useAuth().logout`). Avatar và nút đăng xuất ẩn khi `user` là `null` (vd ở `/dev/ui`). Ô tìm kiếm **chưa có** (thêm ở GĐ4).
  - `Rail()`: Glass dọc, 3 `NavLink`: "Trang chủ" → `/listen`, "Thư viện" → `/v1` (tạm, tới GĐ4), "Bài đã thích" → `/v1` (tạm, tới GĐ4). Link đang chọn có nền `white/55` + chữ `matcha-4`.
  - Ẩn/hiện: header trượt lên (`translateY(-160%)`), rail trượt trái (`translateX(-180%)`), `opacity` 0, 400ms `ease-matcha`; reduced motion thì tức thì. Khi ẩn vẫn **không** `display:none` (để Tab vào được).

- [ ] **Step 1: Viết `useIdle.js`, `Header.jsx`, `Rail.jsx`, `AppShell.jsx`** theo interface.
- [ ] **Step 2: Gắn tạm vào `DevUI`**: nút "Xem AppShell" bật một state hiển thị `<AppShell>` toàn màn hình (con là một Matcappa `stand`), có `IconButton` "Đóng" ở góc. Task 8 mới gắn thật vào `/listen`.
- [ ] **Step 3: Kiểm tra**: đứng yên 2,5 giây thì header + rail ẩn; di chuột thì hiện; để chuột trên rail thì không ẩn; nhấn Tab từ đầu trang thì header hiện, Tab tiếp trong header không bị ẩn giữa chừng; Tab ra khỏi header rồi đứng yên 2,5 giây thì ẩn. Reduced motion: hiện/ẩn tức thì. Chụp màn hình hai trạng thái.
- [ ] **Step 4: Commit** `Feat: Khung AppShell với header và rail tự ẩn`

---

### Task 8: Sơ đồ route mới + 404

**Files:**
- Create: `src/pages/ListenPage.jsx`, `src/pages/LandingStub.jsx`, `src/pages/NotFound.jsx`
- Modify: `src/routes/AppRouter.jsx`

**Interfaces:**
- Consumes: `AppShell` (Task 7), `Matcappa` (Task 5), `Button` (Task 3), `useAuth()` → `{ user, loading }`.
- Produces (route, theo spec mục 6; lớp phủ route để GĐ4 làm cùng màn đầu tiên cần nó):

| Path | Element | Quyền |
|---|---|---|
| `/` | `LandingStub`: Matcappa `stand` + "Matcha Cha-Cha-Cha" + nút "Bắt đầu nghe" (có `user` → `/listen`, không → `/login`). Thay ở GĐ2 | Công khai |
| `/login`, `/register` | `AuthFlow` v1 (thay ở GĐ2) | Chỉ khách; có `user` → `location.state?.from ?? "/listen"` |
| `/listen` | `AppShell` + `ListenPage`: Matcappa `hug-knees` + câu "Đĩa đang được pha, đợi mình xíu nha ~" + nút "Mở chồng đĩa cũ" → `/v1`. Thay ở GĐ5 | Cần đăng nhập |
| `/v1` | `DefaultLayout` + `HomePage` v1 (tạm, xoá ở GĐ4) | Cần đăng nhập |
| `/playlist/:id` | `DefaultLayout` + `PlayListPage` v1 (tạm, thay ở GĐ4) | Cần đăng nhập |
| `/dev/ui` | `DevUI` (Task 3) | Chỉ DEV |
| `*` | `NotFound`: Matcappa `hug-knees`, "Ơ, bàn này chưa có ai đặt…", `Button` "Về quán" → `/` | Công khai |

  - `RequireAuth`: khi `loading` thì hiện `PageLoader`; không có `user` thì `<Navigate to="/login" replace state={{ from: location }} />`.
  - `GuestOnly`: có `user` thì `<Navigate to={location.state?.from ?? "/listen"} replace />`. Bỏ độ trễ 800ms của v1.

- [ ] **Step 1: Viết 3 trang** theo bảng.
- [ ] **Step 2: Viết lại `AppRouter.jsx`** theo bảng, giữ route `/dev/ui` từ Task 3. `from` lưu cả `pathname` + `search`.
- [ ] **Step 3: Kiểm tra trước** xem `AuthContext` có `loading` thật không (đang export `loading` trong value). Nếu `loading` không phủ giai đoạn gọi `/api/auth/me` thì ghi lại và báo, **không sửa** `AuthContext`.
- [ ] **Step 4: Kiểm tra tay** ở preview (cần backend chạy, `VITE_API_URL` trỏ đúng):
  - Chưa đăng nhập mở `/playlist/<id thật>` → `/login` → đăng nhập → đúng `/playlist/<id>`.
  - Đã đăng nhập, tải lại `/playlist/<id>` → ở lại đúng trang, không nháy qua `/login`.
  - Đã đăng nhập mở `/login` → `/listen`.
  - `/abc` → 404, "Về quán" → `/`.
  - Ở `/v1` phát một bài, chuyển sang `/listen` rồi `/playlist/<id>`: nhạc không ngắt.
  - Console không lỗi đỏ.
- [ ] **Step 5: Commit** `Feat: Sơ đồ route v2, trang tạm /listen và trang 404`

### Checkpoint GĐ1
- [ ] `npm test`, `npm run build` sạch; `/dev/ui` đủ khu Kính, Nút, Icon, Loader, Matcappa, Bong bóng; `/listen` có khung tự ẩn; luồng phát v1 vẫn chạy.
- [ ] Bạn duyệt. Duyệt xong merge `v2/foundation` → `v2/main`.

---

## Điều chỉnh so với `tasks/todo.md`

- **T17:** định tuyến lớp phủ (`state.background`) **dời sang GĐ4**, làm cùng lớp phủ đầu tiên cần nó (Thư viện). GĐ1 không có lớp phủ nào để thử, nên viết trước chỉ là code chết.
- **T16:** ô tìm kiếm trên header dời sang GĐ4 (T44).
- Thêm route tạm `/v1` để giữ HomePage v1 dùng được tới GĐ4.
