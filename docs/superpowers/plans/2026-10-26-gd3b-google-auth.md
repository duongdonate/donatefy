# GĐ3b · Đăng nhập Google: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nút "Tiếp tục với Google" ở trang đăng nhập/đăng ký (vào thẳng app với tên, ảnh Google), route playlist thống nhất `/api/playlists/:id`, và app chạy được trên Vercel + Render Free (chuyển tiếp `/api`, chờ Render thức dậy).

**Architecture:** Frontend dùng Google Identity Services lấy ID token → `POST /api/auth/google` → backend kiểm bằng `google-auth-library`, tìm/tạo user theo `googleId`, cấp phiên bằng `issueSession` có sẵn từ GĐ3. Không gộp tài khoản. Vercel rewrite `/api`, `/upload`, `/uploads` sang Render nên cookie là cùng site. Khởi động app chỉ coi 401 là chưa đăng nhập; lỗi mạng thì thử lại tới ~60 giây.

**Tech Stack:** Backend Express 4 + Mongoose 8 (repo `E:\music-player-app-master\backend`), thêm `google-auth-library`. Frontend React 19 + Vite + axios, test `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-26-gd3b-google-auth-design.md` (nối tiếp `2026-10-25-gd3-auth-per-user-design.md`).

## Global Constraints

- Nhánh `v2/google-auth` ở cả hai repo: backend cắt từ `main` (3516063) **mang theo phần người dùng đang sửa dở** (đổi `POST /api/playlist/:id/add-song` → `/api/playlists/:id/add-song`, format `routes/api.js`, `docs/openapi.yml`) làm commit đầu; frontend cắt từ `v2/main`. Không push, không merge khi người dùng chưa bảo.
- Commit tiếng Việt (`Feat:`/`Fix:`/`Docs:`), kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Google Client ID: `572253459004-cnmm5io8dq6kj3hmjptu84nb26tle2fj.apps.googleusercontent.com` — backend `GOOGLE_CLIENT_ID`, frontend `VITE_GOOGLE_CLIENT_ID` (cả hai trong `.env` local; không commit `.env`).
- Backend Render: `https://donatefy-backend.onrender.com`.
- Tìm user Google **chỉ theo `googleId`** (= `payload.sub`); không bao giờ ghép theo email/username. Mỗi lần đăng nhập Google cập nhật `displayName` và `avatar` theo Google.
- `username` tự sinh: 3–30 ký tự, chỉ `[A-Za-z0-9_.]`, không trùng.
- User không có `password` → đăng nhập mật khẩu trả 401 như sai mật khẩu.
- Thư viện mới duy nhất: `google-auth-library` (backend). Frontend tải script `https://accounts.google.com/gsi/client` lúc chạy, không cài gói.
- Không One Tap (không gọi `google.accounts.id.prompt()`).
- Copy: nút "Tiếp tục với Google"; đường kẻ "hoặc"; dòng chữ nhỏ trang đăng ký: *"Đăng ký bằng Google sẽ dùng luôn tên và ảnh Google của bạn, một chạm là xong."*; màn hình chờ khi Render ngủ: *"Quán đang mở cửa, chờ xíu nha…"*.
- Trang đăng nhập: Google → "hoặc" → form mật khẩu. Trang đăng ký: form (avatar, tên, mật khẩu) → "hoặc" → Google → dòng chữ nhỏ.
- `axiosClient` timeout 60 000 ms; refresh lúc khởi động timeout 60 000 ms.
- Không sửa `src/app/**`. Được sửa `src/contexts/AuthContext.jsx`. Không đụng giao diện v1 (memory `ignore-v1-ui`).
- Mỗi task backend: `npm test`, curl lên server riêng `PORT=8405 BASE_URL=http://localhost:8405 node index.js` (dừng sau khi thử), cập nhật `docs/openapi.yml` cùng commit, Redocly lint 0 lỗi. Mỗi task frontend: `npm test`, `npm run build`, `npx eslint` file đã đụng; preview (Vite `localhost:3000` + backend `localhost:8404`) do controller chạy.
- Claude không đăng nhập Google thật; bước đó người dùng tự bấm.
- Soát cuối (memory `review-cost`): `graphify update .` hai repo, diff thu gọn, **Sonnet**.

## Review Focus

1. **Cùng một tài khoản Google đăng nhập lần hai** → vào đúng user cũ, không tạo user mới. Test: Task 1 (curl/kiểm logic `findOrCreateGoogleUser`) + Task 5 bước người dùng.
2. **Tên Google có dấu, có khoảng trắng, quá ngắn hoặc quá dài, hoặc trùng** → `username` hợp lệ, không trùng. Test: Task 1 `makeUsername`.
3. **Render đang ngủ lúc mở app (refresh lỗi mạng/hết giờ/5xx)** → màn hình chờ, không về `/login`; 401 thì về `/login`. Test: Task 3 `retryStartup`.
4. **Script Google không tải được (chặn quảng cáo, mất mạng)** → khối Google ẩn, form mật khẩu vẫn dùng được. Test: Task 4 Step 4.
5. **User Google bị thử đăng nhập bằng mật khẩu** → 401, không 500. Test: Task 1 Step 4.

---

## File Structure

| Repo | File | Trách nhiệm |
|---|---|---|
| backend | `utils/googleUser.js`, `utils/googleUser.test.js` | Mới: `makeUsername` |
| backend | `models/User.js` | `googleId`, `displayName`, `password` tuỳ điều kiện |
| backend | `services/googleAuth.js` | Mới: `verifyGoogleCredential`, `findOrCreateGoogleUser` |
| backend | `routes/auth.js` | `POST /google`, chặn login mật khẩu với user Google, `/me` trả `displayName` + URL avatar Google |
| backend | `routes/api.js` | `GET /api/playlists/:id` |
| backend | `docs/openapi.yml`, `README.md`, `package.json` | Tài liệu, env, thư viện |
| frontend | `src/services/api/playlistService.js` | `getById`, `addSong` đường mới |
| frontend | `src/services/authSession.js`, `.test.js`, `src/services/axiosClient.js` | `retryStartup`, timeout 60 s |
| frontend | `src/contexts/AuthContext.jsx`, `src/routes/AppRouter.jsx` (FullLoader) | Khởi động có thử lại, `loginWithGoogle`, câu chờ |
| frontend | `src/components/Avatar.jsx` | Dùng URL avatar `http…` trực tiếp |
| frontend | `src/features/auth/GoogleButton.jsx`, `AuthPage.jsx` | Nút Google, bố cục hai trang |
| frontend | `vercel.json`, `.env`, `README.md` | Chuyển tiếp, env |

---

### Task 1: Backend · đăng nhập Google

**Files:** Create `utils/googleUser.js`, `utils/googleUser.test.js`, `services/googleAuth.js`; Modify `models/User.js`, `routes/auth.js`, `package.json`, `docs/openapi.yml`, `README.md`.

**Interfaces:**
- Consumes: `issueSession(res, userId)` (`services/sessionService.js`, GĐ3).
- Produces:
  - `makeUsername(source: string, suffix?: string): string` — `source` là email hoặc tên; lấy phần trước `@`, bỏ dấu (`normalize("NFD")` + bỏ dấu kết hợp, `đ→d`), thay ký tự ngoài `[A-Za-z0-9_.]` bằng `_`, gộp `_` liên tiếp, cắt sao cho cả `suffix` (dạng `_1234`) vẫn ≤ 30; ngắn hơn 3 → đệm thành `user` + phần có được. Không có suffix thì không thêm.
  - `verifyGoogleCredential(credential: string): Promise<{ sub, email, name, picture }>` — `OAuth2Client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })`; lỗi → throw.
  - `findOrCreateGoogleUser(payload): Promise<User>` — `findOne({ googleId: sub })`; có → cập nhật `displayName = name`, `avatar = picture`, save; chưa → `create` với `username = makeUsername(email || name)`, trùng (`exists` hoặc lỗi E11000) → thử `makeUsername(…, "_" + 4 số ngẫu nhiên)` tối đa 5 lần.
  - `POST /api/auth/google` body `{ credential }` → 200 `{ access_token }` + cookie; thiếu/sai → 401 `{ message: "Đăng nhập Google thất bại" }`.
  - `GET /api/auth/me` → `user` có thêm `displayName`; `avatar` bắt đầu bằng `http` thì trả nguyên.

- [ ] **Step 0 (controller):** `git checkout -b v2/google-auth` trong backend (đang ở `main` có thay đổi chưa commit của người dùng), commit nguyên phần đó: `Refactor: Thống nhất route thêm bài /api/playlists/:id/add-song, format lại api.js` (không thêm Co-Authored-By vì là code người dùng).
- [ ] **Step 1: Test `utils/googleUser.test.js`**: `makeUsername("duong.hnh@gmail.com")` → `"duong.hnh"`; `makeUsername("Dương Hải")` → `"Duong_Hai"`; `makeUsername("ab@x.com")` → độ dài ≥ 3 và khớp `/^[A-Za-z0-9_.]{3,30}$/`; chuỗi 50 ký tự + suffix `"_1234"` → dài đúng 30, kết thúc bằng `_1234`; `makeUsername("a  b!!c@x")` không có `__`. Mọi kết quả khớp `/^[A-Za-z0-9_.]{3,30}$/`.
- [ ] **Step 2:** `npm test` → FAIL; viết `utils/googleUser.js`; `npm test` → PASS.
- [ ] **Step 3:** `npm i google-auth-library`; viết model (`googleId: { type: String, unique: true, sparse: true }`, `displayName: String`, `password: { type: String, required: function () { return !this.googleId; } }`), `services/googleAuth.js`, route `/google`; login: user không có `password` → 401 cùng thông điệp sai mật khẩu; `/me` theo Interfaces. Thêm `GOOGLE_CLIENT_ID` vào `.env` local (giá trị ở Global Constraints) và README.
- [ ] **Step 4: curl (server 8405):** `POST /api/auth/google` không body → 401; `{ "credential": "rac" }` → 401 (không 500); đăng ký tài khoản thử `gd3b_a` (mật khẩu sinh ngẫu nhiên, ghi vào workspace SDD) rồi login mật khẩu → 200 (đăng nhập cũ không hỏng). Kiểm `findOrCreateGoogleUser` hai lần với cùng payload giả (`node -e` gọi trực tiếp, payload `sub: "test-gd3b"`) → cùng `_id`, lần hai đổi được `displayName`; tạo thêm payload có cùng email phần trước `@` khác `sub` → `username` có hậu tố. Thử login mật khẩu với `username` của user `test-gd3b` → 401. Xoá các user `test-gd3b*` sau khi thử.
- [ ] **Step 5:** openapi: `/api/auth/google`, `/me` có `displayName`; lint 0 lỗi. Commit `Feat: Đăng nhập bằng Google, tạo tài khoản theo googleId`.

### Task 2: Backend · `GET /api/playlists/:id`

**Files:** Modify `routes/api.js`, `docs/openapi.yml`.

**Interfaces:** `GET /api/playlists/:id` (sau `router.use(checkAuth)`) → 200 `{ ...playlist.toJSON(), cover }`; không phải chủ / id sai → 404 `{ error: "Không tìm thấy playlist" }`; không token → 401. Dùng chung `findOwned` + `withCover` có sẵn trong `api.js`.

- [ ] **Step 1:** Thêm route. **Step 2:** curl 8405 với `gd3b_a` (từ Task 1) và `gd3b_b` (đăng ký mới, ghi mật khẩu vào workspace SDD): chủ → 200 có `cover`; người khác → 404; `abc` → 404; không token → 401. Xoá playlist thử. **Step 3:** openapi + lint; `npm test`. Commit `Feat: Lấy một playlist qua /api/playlists/:id`.

### Task 3: Frontend · Render ngủ, đường API mới, tên/ảnh

**Files:** Modify `src/services/authSession.js`, `src/services/authSession.test.js`, `src/services/axiosClient.js`, `src/services/api/playlistService.js`, `src/contexts/AuthContext.jsx`, `src/routes/AppRouter.jsx`, `src/components/Avatar.jsx`.

**Interfaces:**
- Produces (`authSession.js`): `retryStartup(fn: () => Promise<T>, { isFatal: (err) => boolean, totalMs = 60000, delays = [1000, 2000, 4000, 8000], now = Date.now, sleep }): Promise<T>` — gọi `fn`; lỗi mà `isFatal(err)` → ném ngay; lỗi khác → chờ theo `delays` (phần tử cuối lặp lại) rồi thử lại, tới khi quá `totalMs` thì ném lỗi cuối. `sleep`/`now` truyền vào để test không chờ thật.
- `axiosClient.js`: `timeout: 60000`; `refreshAccessToken` truyền `timeout: 60000`.
- `AuthContext`: khởi động `retryStartup(refreshAccessToken, { isFatal: (e) => e?.response?.status === 401 })` → `/me`; giá trị context thêm `waking: boolean` (true khi khởi động đã quá ~3 s mà chưa xong).
- `FullLoader` (trong `AppRouter.jsx`): khi `waking` → hiện câu *"Quán đang mở cửa, chờ xíu nha…"* dưới loader.
- `playlistService.getById(id)` → `/api/playlists/${id}`; `addSong` → `/api/playlists/${id}/add-song`.
- `Avatar.jsx`: `user.avatar` là chuỗi bắt đầu bằng `http` → dùng thẳng; không thì dò `/uploads/avatars/<username>` như cũ.

- [ ] **Step 0 (controller):** `git checkout -b v2/google-auth` từ `v2/main` (frontend), sau khi commit spec + plan lên `v2/main`.
- [ ] **Step 1: Test `retryStartup`**: thành công lần 1 → trả giá trị, gọi 1 lần; lỗi thường 2 lần rồi thành công → trả giá trị, gọi 3 lần, `sleep` nhận `1000, 2000`; lỗi fatal → ném ngay, gọi 1 lần; lỗi thường mãi với `totalMs: 5000` và `now` giả tăng theo `sleep` → ném lỗi cuối, không quá 5000.
- [ ] **Step 2:** `npm test` FAIL → viết → PASS.
- [ ] **Step 3:** sửa các file còn lại theo Interfaces. `npm test`, `npm run build`, eslint sạch. Commit `Feat: Chờ Render thức dậy khi mở app, dùng đường /api/playlists mới`.
- [ ] **Step 4 (controller, preview):** đăng nhập mật khẩu, mở playlist, thêm bài một link → chạy với đường mới; dừng backend 8404, tải lại trang → màn hình chờ và câu chờ sau ~3 s, bật lại backend trong 60 s → vào app không qua `/login`.

### Task 4: Frontend · nút Google và bố cục trang

**Files:** Create `src/features/auth/GoogleButton.jsx`; Modify `src/features/auth/AuthPage.jsx`, `src/contexts/AuthContext.jsx`, `vercel.json`, `.env` (không commit), `README.md`.

**Interfaces:**
- `AuthContext.loginWithGoogle(credential: string): Promise<{ success, message }>` → `POST /api/auth/google` → `startSession`.
- `GoogleButton({ onCredential })`: tải script GIS một lần (thẻ `<script src="https://accounts.google.com/gsi/client" async>`, dùng lại nếu đã có), `initialize({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, callback: (r) => onCredential(r.credential) })`, `renderButton(el, { theme: "outline", size: "large", text: "continue_with", shape: "pill", locale: "vi", width: <bề rộng ô nhập> })`. Script lỗi hoặc thiếu client id → render `null` (cha ẩn luôn đường "hoặc").
- `vercel.json`: `rewrites` theo thứ tự `/api/:path*`, `/upload/:path*`, `/uploads/:path*` → `https://donatefy-backend.onrender.com/<cùng đường>`, rồi rewrite SPA hiện có.

- [ ] **Step 1:** Viết `GoogleButton`, `loginWithGoogle`, bố cục: `/login` = Google → "hoặc" → form; `/register` = form → "hoặc" → Google → dòng chữ nhỏ (copy ở Global Constraints). Thành công → đi tiếp như login thường (`GuestOnly` đưa về `from` hoặc `/listen`); thất bại → hiện thông điệp lỗi trong thẻ như lỗi đăng nhập hiện có. `.env` thêm `VITE_GOOGLE_CLIENT_ID`. README: biến Vercel (`VITE_API_URL` rỗng, `VITE_GOOGLE_CLIENT_ID`), biến Render (`GOOGLE_CLIENT_ID`, `BASE_URL`, `FRONTEND_URL`), lưu ý thêm origin cho link xem thử.
- [ ] **Step 2:** `npm test`, `npm run build`, eslint sạch; `node -e "JSON.parse(require('fs').readFileSync('vercel.json'))"` hợp lệ. Commit `Feat: Nút Tiếp tục với Google ở trang đăng nhập, đăng ký; chuyển tiếp API qua Vercel`.
- [ ] **Step 3 (controller, preview):** hai trang đúng thứ tự, nút Google hiện, chữ nhỏ đúng copy, ảnh chụp cả hai trang ở 375px và 1280px.
- [ ] **Step 4 (controller):** chặn `accounts.google.com` (hoặc xoá `VITE_GOOGLE_CLIENT_ID` tạm) → khối Google và "hoặc" ẩn, đăng nhập mật khẩu vẫn chạy.
- [ ] **Step 5 (người dùng):** bấm Google bằng tài khoản thật → vào `/listen`, header có ảnh Google, thư viện trống; đăng xuất, bấm Google lại → cùng tài khoản (DB chỉ một user với `googleId` đó).

### Task 5: Soát cuối giai đoạn

- [ ] `graphify update .` hai repo → gói diff thu gọn (bỏ lockfile) → reviewer **Sonnet** theo spec + Review Focus → một lượt sửa → báo người dùng duyệt (kèm danh sách quyết định của Claude và việc phải làm khi phát hành: thêm `GOOGLE_CLIENT_ID` trên Render, `VITE_*` trên Vercel). Góp ý sau đó: sửa, chờ vừa ý rồi commit gộp (memory `feedback-batch-commit`).
