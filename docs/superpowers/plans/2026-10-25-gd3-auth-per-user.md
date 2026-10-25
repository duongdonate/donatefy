# GĐ3 · Dữ liệu theo người dùng và phân quyền: Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi người chỉ thấy và sửa được playlist của mình (TC-07), phiên đăng nhập giữ 7 ngày bằng refresh token trong cookie `httpOnly`, playlist cũ thuộc về `duongdonate`.

**Architecture:** Backend: access token JWT 1 giờ + refresh token ngẫu nhiên (lưu bản băm trong collection `RefreshToken`, xoay vòng mỗi lần dùng, mã vừa xoay được chấp nhận thêm 30 giây). `checkAuth` có sẵn gắn cho route dữ liệu; playlist luôn tra bằng `{ _id, userId }`, không phải chủ → 404. Frontend: token chỉ ở bộ nhớ trong `src/services/authSession.js`; `axiosClient` gắn token, gặp 401 thì refresh một lần dùng chung rồi gửi lại.

**Tech Stack:** Backend Express 4 + Mongoose 8 + jsonwebtoken (repo `E:\music-player-app-master\backend`), thêm `cookie-parser`. Frontend React 19 + axios, test `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-25-gd3-auth-per-user-design.md`. Yêu cầu: `docs/report/donatefy-v2-plan.md` FR-36, NFR-09, §10.2, TC-07.

## Global Constraints

- Nhánh backend `v2/auth` cắt từ `main` của repo backend (đang ở `1a2856f`, chưa push — không sửa, không push `1a2856f`/`b091856`). Nhánh frontend `v2/auth` cắt từ `v2/main`. Không merge, không push khi người dùng chưa bảo.
- Commit tiếng Việt, dạng `Feat: …`/`Fix: …`/`Docs: …`, kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Access token sống **1 giờ**. Refresh token sống **7 ngày**, trượt (mỗi lần refresh tính lại). Mã vừa xoay được chấp nhận thêm **30 giây**.
- Cookie `refresh_token`: `httpOnly`, `path: "/api/auth"`, `maxAge` 7 ngày; `BASE_URL` bắt đầu bằng `https` → `sameSite: "none", secure: true`, ngược lại `sameSite: "lax"`.
- `userId` lưu dạng **chuỗi** của `User._id` (JWT `id` cũng là chuỗi).
- Không phải chủ / id sai dạng / không có → **404** với đúng body "không có" route đó đang dùng (không trả 403).
- **Không đụng** `GET /api/search` và `GET /api/video/:id` (không thêm `checkAuth`). Mọi route khác trong `routes/api.js` (kể cả `/history*`, `/recommend`, `/songs/info`, `/songs`) cần đăng nhập. `/api/auth/login|register|refresh|logout` không cần. `GET /songs/:id`, `GET /avatars/:username` vẫn công khai.
- Frontend: được sửa `src/contexts/AuthContext.jsx`; **không** sửa `src/app/**`. Không lưu access token vào localStorage.
- Không thêm thư viện ngoài `cookie-parser` (backend).
- Mỗi task backend: `npm test`, thử bằng `curl` lên `http://localhost:8404` (người dùng tự chạy backend; nhớ restart sau khi đổi code nếu nodemon không tự nạp), cập nhật `docs/openapi.yml` cùng commit, `npx @redocly/cli lint docs/openapi.yml` 0 lỗi. curl trong Git Bash làm hỏng tiếng Việt trong body — dùng tên ASCII khi thử.
- Mỗi task frontend: `npm test`, `npm run build`, `npx eslint` file đã đụng, preview (Vite local nối `localhost:8404`) không lỗi đỏ.
- Soát cuối (memory `review-cost`): `graphify update .`, gói diff thu gọn, **Sonnet** (không đụng trình phát).

## Review Focus

1. **Hai tab mở cùng lúc / StrictMode gọi refresh hai lần** → không bị đăng xuất. Test: Task 1 `checkRefresh` (grace), Task 5 `refreshOnce` (đồng thời).
2. **Token hết hạn giữa lúc dùng** → request tự gửi lại sau refresh, người dùng không thấy gì. Test: Task 6 Step 4.
3. **Id playlist sai dạng hoặc của người khác** → 404, không 500, không lộ dữ liệu. Test: Task 1 `ownedFilter`, Task 3 Step 3.
4. **Đăng xuất rồi dùng lại cookie cũ** → 401. Test: Task 2 Step 4.
5. **Chạy script chuyển dữ liệu lần hai** → 0 playlist đổi, không ghi đè playlist đã có chủ. Test: Task 4 Step 3.

---

## File Structure

| Repo | File | Trách nhiệm |
|---|---|---|
| backend | `utils/session.js`, `utils/session.test.js` | Mới: hằng số, tạo/băm refresh token, tuỳ chọn cookie, `checkRefresh`, `ownedFilter` |
| backend | `models/RefreshToken.js` | Mới: `{ userId, tokenHash, prevHash, rotatedAt, expiresAt }`, TTL index |
| backend | `services/sessionService.js` | Mới: `issueSession`, `refreshSession`, `endSession` |
| backend | `routes/auth.js`, `index.js`, `package.json` | refresh/logout, cookie-parser, login/register qua `issueSession`, bỏ `yamljs` |
| backend | `routes/api.js`, `routes/public.js`, `services/songService.js`, `controllers/songController.js` | `checkAuth` + lọc theo chủ |
| backend | `routes/upload.js`, `middleware/checkUploadAvatar.js`, `controllers/uploadAvatarController.js` | Upload avatar theo user trong token |
| backend | `utils/randomPlaylistCover.js` | Đọc thư mục ảnh một lần |
| backend | `scripts/assign-playlists-owner.js`, `README.md` | Script gán chủ |
| backend | `docs/openapi.yml` | Bearer + cookie, refresh/logout, 401/404 |
| frontend | `src/services/authSession.js`, `authSession.test.js` | Mới: token trong bộ nhớ, `refreshOnce`, callback hết phiên |
| frontend | `src/services/axiosClient.js`, `src/services/axiosUpload.js` | Gắn token, `withCredentials`, 401 → refresh → gửi lại |
| frontend | `src/contexts/AuthContext.jsx` | Khởi động bằng refresh, login/register/logout mới |

---

### Task 1: Backend · logic phiên và lọc theo chủ (thuần, có test)

**Files:**
- Create: `utils/session.js`, `utils/session.test.js`
- Modify: `package.json` (thêm `cookie-parser`)

**Interfaces:**
- Produces (`utils/session.js`, CommonJS):
  - `ACCESS_TTL = "1h"`, `REFRESH_MS = 7 * 24 * 3600 * 1000`, `GRACE_MS = 30 * 1000`, `COOKIE = "refresh_token"`
  - `newRefreshToken(): string` — `crypto.randomBytes(32).toString("base64url")`
  - `hashToken(token: string): string` — sha256 hex
  - `refreshCookieOptions(baseUrl?: string): { httpOnly: true, path: "/api/auth", maxAge: REFRESH_MS, sameSite: "lax"|"none", secure: boolean }`
  - `checkRefresh(doc: {tokenHash, prevHash?, rotatedAt?, expiresAt} | null, hash: string, now: Date): "current" | "grace" | null`
  - `ownedFilter(id: string, userId: string): { _id: string, userId: string } | null` — null khi `!mongoose.isValidObjectId(id)` hoặc thiếu `userId`

- [ ] **Step 1: Tạo nhánh** `git checkout -b v2/auth` (repo backend, từ `main`); `npm i cookie-parser`.
- [ ] **Step 2: Viết test `utils/session.test.js`** (theo khuôn `parseOrigins.test.js`):
  - `hashToken` ổn định và khác input khác; `newRefreshToken()` hai lần khác nhau, dài ≥ 43.
  - `refreshCookieOptions("https://x")` → `sameSite: "none", secure: true`; `("http://localhost:8404")` và `(undefined)` → `sameSite: "lax", secure: false`; luôn `httpOnly: true, path: "/api/auth", maxAge: REFRESH_MS`.
  - `checkRefresh`: `null` doc → null; hash = tokenHash và `expiresAt > now` → "current"; hết hạn → null; hash = prevHash và `now - rotatedAt < GRACE_MS` → "grace"; prevHash quá 30 s → null; hash lạ → null.
  - `ownedFilter("abc", "u1")` → null; `ownedFilter(validId, undefined)` → null; `ownedFilter(validId, "u1")` → `{ _id: validId, userId: "u1" }`.
- [ ] **Step 3: Chạy `npm test`** → FAIL (chưa có module).
- [ ] **Step 4: Viết `utils/session.js`** theo Interfaces.
- [ ] **Step 5: `npm test`** → PASS.
- [ ] **Step 6: Commit** `Feat: Logic phiên đăng nhập và lọc playlist theo chủ`.

### Task 2: Backend · refresh token, refresh/logout

**Files:**
- Create: `models/RefreshToken.js`, `services/sessionService.js`
- Modify: `routes/auth.js`, `index.js` (cookie-parser; bỏ `require("yamljs")`), `package.json` (bỏ `yamljs` nếu `grep -r yamljs --exclude-dir=node_modules` không còn ai dùng), `docs/openapi.yml`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - Model `RefreshToken`: `userId: String`, `tokenHash: String (index)`, `prevHash: String (index)`, `rotatedAt: Date`, `expiresAt: Date` với `index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`. Một document = một phiên (một lần đăng nhập).
  - `issueSession(res, userId: string): Promise<{ access_token }>` — tạo doc mới, đặt cookie, ký JWT `{ id: userId }` `expiresIn: ACCESS_TTL`.
  - `refreshSession(req, res): Promise<{ access_token } | null>` — tìm doc theo `tokenHash` hoặc `prevHash` của cookie; `checkRefresh` = "current" → xoay (prevHash ← tokenHash cũ, tokenHash ← mới, rotatedAt, expiresAt = now + 7 ngày) và đặt cookie mới; "grace" → chỉ trả access token, **không** đổi cookie; null → `res.clearCookie(COOKIE, {path})`, trả null.
  - `endSession(req, res): Promise<void>` — xoá doc khớp tokenHash, clear cookie.
  - Route: `POST /api/auth/refresh` → 200 `{ access_token }` | 401 `{ message: "Phiên đăng nhập đã hết, vui lòng đăng nhập lại" }`; `POST /api/auth/logout` → 204. `login`/`register` trả như cũ nhưng qua `issueSession` (register vẫn 201 + `message`).

- [ ] **Step 1: Viết model, service, route** theo Interfaces; `app.use(cookieParser())` cạnh `express.json()`.
- [ ] **Step 2: `npm test`** → PASS.
- [ ] **Step 3: curl đăng nhập/refresh** (dùng `gd4a_tester`, mật khẩu người dùng cung cấp khi chạy — không ghi vào file): `curl -i -c jar -H "Content-Type: application/json" -d '{"username":"gd4a_tester","password":"…"}' localhost:8404/api/auth/login` → 200, có `Set-Cookie: refresh_token=…; Path=/api/auth; HttpOnly; SameSite=Lax`. `curl -i -b jar -c jar -X POST localhost:8404/api/auth/refresh` → 200 + cookie mới. Gọi lại ngay với **cookie cũ** (chép jar trước bước refresh) → 200 (grace), không có `Set-Cookie`.
- [ ] **Step 4: curl logout** `-b jar -X POST /api/auth/logout` → 204; refresh lại bằng jar cũ → 401.
- [ ] **Step 5: `docs/openapi.yml`**: thêm `securitySchemes.refreshCookie` (apiKey, in: cookie, name: refresh_token), hai path mới, cập nhật mô tả login/register (Set-Cookie). Lint 0 lỗi.
- [ ] **Step 6: Commit** `Feat: Refresh token trong cookie httpOnly, thêm refresh và logout`.

### Task 3: Backend · phân quyền route dữ liệu

**Files:**
- Modify: `routes/api.js`, `routes/public.js`, `services/songService.js`, `controllers/songController.js`, `routes/upload.js`, `middleware/checkUploadAvatar.js`, `controllers/uploadAvatarController.js`, `utils/randomPlaylistCover.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `checkAuth` (có sẵn, đặt `req.userId`), `ownedFilter` (Task 1).
- Produces: `songService.getSongs(playlistId = null, userId)` — có `playlistId` thì tra `CustomPlaylist.findOne(ownedFilter(playlistId, userId))`, filter null → trả null.

- [ ] **Step 1: Gắn `checkAuth`**: trong `routes/api.js` giữ `/search` và `/video/:id` khai báo trước, rồi `router.use(checkAuth)` cho mọi route phía sau (dời hai route này lên trên nếu cần). `routes/public.js`: `GET /playlists/:id` thêm `checkAuth` + `ownedFilter`. `routes/upload.js`: `checkAuth` → middleware nhỏ tra `User.findById(req.userId)` (không có → 401) đặt `req.username` → multer; `checkUploadAvatar` và controller dùng `req.username`, bỏ `req.body.username`.
- [ ] **Step 2: Lọc theo chủ**: thay `findPlaylist`/`findById`/`findByIdAndDelete` bằng `ownedFilter` ở add-song, PATCH, remove-song, DELETE; `GET /api/playlists` → `find({ userId: req.userId })`; `POST /api/playlists` gán `userId: req.userId`; `shareUrl` → `${FRONTEND}/playlists/${id}`; `getSongs` truyền `req.userId`. `randomPlaylistCover`: đọc danh sách ảnh một lần ở mức module, hàm chỉ chọn ngẫu nhiên.
- [ ] **Step 3: curl TC-07** với hai tài khoản A = `gd4a_tester`, B = tài khoản thử mới `gd3_b` (đăng ký qua API, ghi mật khẩu vào `scratchpad`, không commit):
  - Không token: `GET /api/playlists` → 401; `GET /api/search?q=x` vẫn như cũ (không 401).
  - A tạo playlist → 201, có `userId`; `GET /api/playlists` của A có nó, của B không có.
  - B: `GET /playlists/<idA>`, `GET /api/songs?playlistId=<idA>`, `PATCH`, `POST …/add-song`, `POST …/remove-song`, `DELETE /api/playlists/<idA>` → tất cả 404; A vẫn thấy playlist. `DELETE /api/playlists/abc` → 404 (không 500).
  - Upload avatar với token B nhưng form `username=gd4a_tester` → file lưu tên `gd3_b.*`.
  - Dọn: xoá playlist thử của A.
- [ ] **Step 4: `npm test`** → PASS; openapi: `security: [bearerAuth: []]` cho route cần đăng nhập, thêm response 401, ghi rõ 404 "không phải chủ"; lint 0 lỗi.
- [ ] **Step 5: Commit** `Feat: Mỗi người chỉ xem và sửa playlist của mình`.

### Task 4: Backend · script gán chủ cho playlist cũ

**Files:**
- Create: `scripts/assign-playlists-owner.js`
- Modify: `README.md` (cách chạy script; ghi rủi ro cookie khác site trên Vercel/Safari và hướng sửa sau: Vercel chuyển tiếp `/api/*`)

**Interfaces:**
- CLI: `node scripts/assign-playlists-owner.js <username> [--dry-run]` — dùng `MONGO_URI` từ `.env` (ghi đè được bằng biến môi trường). Điều kiện: `{ $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "" }] }`. In `Tìm thấy N playlist chưa có chủ` và (không dry-run) `Đã gán N playlist cho <username>`. User không tồn tại → in lỗi, exit 1.

- [ ] **Step 1: Viết script** theo Interfaces (kết nối qua `db.js` hoặc `mongoose.connect` trực tiếp, đóng kết nối khi xong).
- [ ] **Step 2: Chạy thử trên bản sao**: bằng một đoạn node trong scratchpad, chép collection `users` và `customplaylists` từ DB `music_app` sang `music_app_gd3test` cùng cluster; chạy script với `MONGO_URI` trỏ `music_app_gd3test`: `--dry-run` → "Tìm thấy 6"; chạy thật → "Đã gán 6 …".
- [ ] **Step 3: Chạy lần hai trên bản sao** → "Tìm thấy 0", không đổi gì. Sau đó xoá DB `music_app_gd3test`.
- [ ] **Step 4: Hỏi người dùng** trước khi chạy trên `music_app` thật; được đồng ý thì chạy `--dry-run` rồi chạy thật cho `duongdonate`.
- [ ] **Step 5: Commit** `Feat: Script gán chủ cho playlist cũ`.

### Task 5: Frontend · token trong bộ nhớ và axios tự làm mới

**Files:**
- Create: `src/services/authSession.js`, `src/services/authSession.test.js`
- Modify: `src/services/axiosClient.js`, `src/services/axiosUpload.js`

**Interfaces:**
- Produces (`src/services/authSession.js`, không import axios hay `import.meta.env` để chạy được trong `node --test`):
  - `getAccessToken(): string | null`, `setAccessToken(token: string | null): void`
  - `refreshOnce(doRefresh: () => Promise<string>): Promise<string>` — đang có lời gọi chạy dở thì trả lại đúng promise đó; xong (thành công hay lỗi) thì lần sau gọi mới. Thành công → `setAccessToken`.
  - `onSessionExpired(cb: () => void): () => void` (trả hàm huỷ), `expireSession(): void` — xoá token, gọi cb.
- `axiosClient.js` export thêm `refreshAccessToken(): Promise<string>` = `refreshOnce(() => axios.post(`${baseURL}/api/auth/refresh`, null, { withCredentials: true }).then(r => r.data.access_token))`.

- [ ] **Step 0: Tạo nhánh** (frontend) `git checkout -b v2/auth` từ `v2/main` — chỉ khi người dùng đã đồng ý đổi nhánh checkout chung.
- [ ] **Step 1: Viết test `authSession.test.js`**: hai `refreshOnce(fn)` đồng thời → `fn` gọi 1 lần, cả hai nhận cùng token, `getAccessToken()` = token; sau khi xong gọi lại → `fn` gọi lần 2; `fn` reject → cả hai reject, lần sau gọi lại được; `expireSession()` → cb được gọi, `getAccessToken()` null; hàm huỷ từ `onSessionExpired` làm cb không còn được gọi.
- [ ] **Step 2: `npm test`** → FAIL; **Step 3:** viết `authSession.js`; **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Sửa axios**: `axiosClient` và `axiosUpload` thêm `withCredentials: true`, request interceptor gắn `Bearer getAccessToken()` khi có. `axiosClient` response 401: nếu URL không chứa `/api/auth/` và `config._retried` chưa có → `refreshAccessToken()` → đặt `_retried`, gửi lại `axiosClient(config)`; refresh lỗi → `expireSession()` rồi reject như cũ. Giữ nguyên dạng resolve (`response.data`) và reject (`error.response.data`) hiện tại. Bỏ khối interceptor đang comment.
- [ ] **Step 6:** `npm test`, `npm run build`, eslint → sạch.
- [ ] **Step 7: Commit** `Feat: Token chỉ giữ trong bộ nhớ, tự làm mới khi gặp 401`.

### Task 6: Frontend · AuthContext theo phiên mới

**Files:**
- Modify: `src/contexts/AuthContext.jsx`

**Interfaces:**
- Consumes: Task 5 (`setAccessToken`, `refreshAccessToken`, `onSessionExpired`), API Task 2.
- Giữ nguyên giá trị context `{ user, token, login, register, logout, loading }` (`token` = token hiện tại trong bộ nhớ, có thể bỏ nếu `grep -rn "useAuth()" src` không ai đọc `token`).

- [ ] **Step 1: Sửa AuthContext**: bỏ `useLocalStorage("token")`, xoá key `token` cũ một lần khi khởi động. Khởi động: `refreshAccessToken()` → `GET /api/auth/me` → `setUser`; lỗi → `setUser(null)`; `loading` false sau cùng. `login`/`register` → `setAccessToken(access_token)` rồi lấy `me`; register có avatar thì upload **sau** khi đã có token (không gửi `username` cũng được, backend lấy từ token). `logout` → `POST /api/auth/logout` (lỗi cũng bỏ qua) → `setAccessToken(null)`, `setUser(null)`. Đăng ký `onSessionExpired(() => setUser(null))` trong effect, huỷ khi unmount.
- [ ] **Step 2:** `npm test`, `npm run build`, eslint → sạch.
- [ ] **Step 3: Preview** (`.claude/launch.json` sẵn có, backend local đã chạy Task 2–3): đăng nhập `gd4a_tester` → thư viện chỉ có playlist của A; tải lại trang → vẫn đăng nhập, network có đúng **một** `POST /api/auth/refresh` mỗi lần tải (dev StrictMode); console không lỗi đỏ.
- [ ] **Step 4: Token hết hạn giữa chừng**: trong console `const s = await import("/src/services/authSession.js"); s.setAccessToken("hong")` rồi mở một playlist → network: request 401 → `refresh` 200 → request gửi lại 200; trang hiện bình thường.
- [ ] **Step 5: TC-07 bước 1–2 trên preview**: A tạo playlist, chép link; đăng xuất; mở link khi chưa đăng nhập → `/login`; đăng nhập B → quay về link → trang "Không tìm thấy". Đăng xuất B → refresh bị 401, về trang đăng nhập khi vào `/playlists`.
- [ ] **Step 6: Đăng ký có avatar** bằng tài khoản thử mới → avatar hiện ở header. Xoá tài khoản/playlist thử nếu người dùng muốn.
- [ ] **Step 7: Commit** `Feat: Đăng nhập giữ 7 ngày bằng cookie, đăng xuất huỷ phiên`.

### Task 7: Soát cuối giai đoạn

- [ ] **Step 1:** `graphify update .` ở cả hai repo (nếu có `graphify-out/`).
- [ ] **Step 2:** Gói diff thu gọn (`git diff main...v2/auth` backend, `git diff v2/main...v2/auth` frontend, bỏ lockfile) → một reviewer **Sonnet** soát theo spec + Review Focus.
- [ ] **Step 3:** Sửa phát hiện đáng sửa; chạy lại `npm test` + build hai repo + lint openapi.
- [ ] **Step 4:** Báo người dùng duyệt: TC-07 đã qua, link hai nhánh, việc còn để sau (Google, `/search`/`/video` chưa khoá, cookie khác site trên Vercel). Góp ý sau đó: sửa, chờ người dùng vừa ý rồi commit gộp một lượt (memory `feedback-batch-commit`).
