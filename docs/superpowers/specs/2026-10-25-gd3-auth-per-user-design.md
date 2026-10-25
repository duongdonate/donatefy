# GĐ3 · Dữ liệu theo người dùng và phân quyền — thiết kế

Ngày: 2026-10-25 · Nguồn yêu cầu: `docs/report/donatefy-v2-plan.md` (FR-36, NFR-09, §10.2, GĐ3, TC-07).

## Vì sao

Hiện ai có địa chỉ backend cũng xem, sửa, xoá được mọi playlist; token đăng nhập nằm trong localStorage và chết sau 2 giờ. GĐ3 làm cho mỗi người chỉ thấy và sửa được playlist của mình, và giữ phiên đăng nhập 7 ngày mà không phải lưu token dài hạn ở chỗ JavaScript đọc được.

## Mục tiêu

1. Mỗi playlist có chủ (`userId`). Mọi thao tác playlist chỉ chạy trên playlist của người gọi.
2. TC-07 qua: B mở link playlist của A → trang "Không tìm thấy"; B gọi `DELETE /api/playlists/:id` của A → 404, playlist A còn nguyên.
3. Đăng nhập giữ được 7 ngày kể từ lần dùng gần nhất, qua mã làm mới trong cookie `httpOnly`.
4. `docs/openapi.yml` mô tả đúng API mới, Redocly lint 0 lỗi.

## Không làm

- Đăng nhập Google (giai đoạn riêng sau GĐ3). Nhưng việc cấp token phải gom vào **một hàm dùng chung** để sau này route Google gọi lại.
- Lịch sử nghe, bài đã thích, tìm kiếm (GĐ4b đã bỏ). Route `/api/history*` không xoá, chỉ khoá sau `checkAuth`.
- Đổi mật khẩu, quên mật khẩu, quản lý thiết bị.
- Đổi giao diện: không thêm màn mới. Màn "Không tìm thấy" và luồng đăng nhập → quay lại link đã có sẵn.
- Không làm lại: bìa playlist cố định, `getSongs` theo thứ tự kèm `meta` và 404, CORS nhiều địa chỉ + PATCH (đã xong ở GĐ4a).

## Điều không được xảy ra

- Người dùng hiện tại mất playlist sau khi chạy script.
- API lộ ra playlist người khác có tồn tại (không phải chủ phải là 404, không phải 403).
- Đang nghe nhạc thì bị đá ra trang đăng nhập chỉ vì token 1 giờ hết hạn.

## Người dùng đã chốt

- **Dữ liệu cũ:** mọi playlist chưa có `userId` gán cho tài khoản `duongdonate`. Script tìm user theo username (không cần mật khẩu), chạy thử trên bản sao database trước, chạy lại nhiều lần không sao (chỉ đụng playlist chưa có chủ).
- **Thời hạn phiên:** 7 ngày, tính lại mỗi lần làm mới (trượt).
- **Giữ đăng nhập bằng mật khẩu**; Google để sau GĐ3.
- **Được sửa `src/contexts/AuthContext.jsx`** trong GĐ3. `src/app/**` (Redux) vẫn khoá; cần đụng thì hỏi lại.

## Thiết kế

### Backend (`E:\music-player-app-master\backend`, nhánh mới `v2/auth` cắt từ `main` hiện tại)

**Token**
- Access token: JWT `{ id }`, sống 1 giờ (người dùng chốt), gửi trong body như hiện tại (`access_token`).
- Refresh token: chuỗi ngẫu nhiên (crypto), lưu **bản băm** vào collection mới `RefreshToken { userId, tokenHash, expiresAt }` có TTL index trên `expiresAt`. Mỗi lần `refresh` thì xoay vòng: xoá mã cũ, cấp mã mới 7 ngày. Mã không có trong DB → 401. (Lựa chọn của Claude: lưu DB để logout huỷ được ngay.)
- Cookie: tên `refresh_token`, `httpOnly`, `path=/api/auth`, `maxAge` 7 ngày. `SameSite`/`Secure` lấy theo môi trường: localhost (`:5173` ↔ `:8404` là cùng site) dùng `Lax`; khi `BASE_URL` là https thì `SameSite=None; Secure`.
- Hàm dùng chung `issueSession(res, userId)` → tạo access token + refresh token, đặt cookie, trả `{ access_token }`. `login` và `register` gọi hàm này.
- Thêm `cookie-parser`.

**Route auth**
- `POST /api/auth/login`, `POST /api/auth/register`: như cũ nhưng qua `issueSession`.
- `POST /api/auth/refresh`: đọc cookie → `{ access_token }` + cookie mới; thiếu/sai/hết hạn → 401 và xoá cookie.
- `POST /api/auth/logout`: xoá mã trong DB (nếu có) và xoá cookie; luôn 204.
- `GET /api/auth/me`: giữ nguyên.

**Phân quyền**
- `checkAuth` (middleware có sẵn) gắn cho toàn bộ `/api` trừ `/api/auth/*`; `/api/auth/me` vẫn tự gắn như cũ.
- **Không đụng** `GET /api/search` và `GET /api/video/:id` trong GĐ3 (người dùng chốt: để giai đoạn sau). `/api/recommend` và `/api/songs/info` vẫn cần đăng nhập như các route khác.
- Playlist: mọi truy vấn lọc theo `{ _id, userId: req.userId }`. Không thấy (kể cả id sai dạng, kể cả của người khác) → 404 với đúng body đang dùng cho "không có". Áp cho: `GET /api/playlists` (chỉ của mình), `POST /api/playlists` (gán `userId`), `PATCH /api/playlists/:id`, `DELETE /api/playlists/:id`, `POST /api/playlist/:id/add-song`, `POST /api/playlists/:id/remove-song`, `GET /api/songs?playlistId=`.
- `GET /api/songs` không có `playlistId` (trả mọi bài trong kho chung): giữ, chỉ cần đăng nhập. Bài hát (`CustomSong`) là kho thông tin YouTube dùng chung, không phải dữ liệu riêng.
- `GET /playlists/:id` (trong `routes/public.js`, frontend đang gọi): thêm `checkAuth` + lọc theo chủ. `GET /songs/:id` và `GET /avatars/:username` giữ công khai.
- `POST /upload/avatars`: hiện ai cũng ghi đè được avatar của bất kỳ username nào. Thêm `checkAuth` và lấy user từ token thay vì `username` trong body (lựa chọn của Claude; frontend gọi upload sau khi đã có token từ register).
- `shareUrl` trong `GET /api/playlists` đổi về `/playlists/:id` (frontend vẫn chuyển hướng link cũ `/playlist/:id`).

**Dọn dẹp**
- `randomPlaylistCover`: đọc thư mục ảnh một lần khi nạp module, không đọc lại mỗi lần tạo playlist.
- Bỏ `const YAML = require("yamljs")` ở `index.js` (và khỏi `package.json` nếu không còn ai dùng).

**Script chuyển dữ liệu**: `scripts/assign-playlists-owner.js <username>` — tìm user, `updateMany({ userId: { $exists: false } } ∪ { userId: null }, { userId })`, in số playlist đã gán. Có cờ `--dry-run` chỉ đếm. Chạy thử trên bản sao DB (đổi `MONGO_URI`) rồi mới chạy thật; người dùng tự chạy bản thật hoặc duyệt trước khi Claude chạy.

Đã kiểm (2026-10-25): DB Atlas `music_app` có 6 playlist, cả 6 chưa có `userId`; `duongdonate` tồn tại. Lưu `userId` dạng **chuỗi** của `User._id` (đúng kiểu `String` của schema và `id` trong JWT) ở cả script, `POST /api/playlists` và điều kiện lọc. Bản sao để chạy thử: database thứ hai trên cùng cluster (vd. `music_app_gd3test`, chép bằng `mongodump`/`mongorestore` hoặc script copy), chỉ đổi tên DB trong `MONGO_URI`. Thêm `userId` không làm hỏng backend cũ (không ai đọc trường này), nên script chạy thật được ngay khi đã thử xong, không phải canh lúc deploy.

**Thứ tự triển khai**: backend GĐ3 nằm trên nhánh `v2/auth`, không deploy riêng; backend và frontend GĐ3 chỉ lên bản thật cùng lúc khi phát hành v2 (frontend v1 hiện không gửi token nên sẽ hỏng nếu backend mới lên trước).

**Refresh nhiều tab / StrictMode** (lựa chọn của Claude): mỗi tab chỉ có một lời gọi refresh đang chạy (promise dùng chung ở mức module, nên hiệu ứng chạy hai lần của StrictMode cũng chỉ gọi một lần). Giữa các tab: `RefreshToken` giữ thêm `prevHash` + `rotatedAt`; mã vừa bị xoay trong 30 giây vẫn được chấp nhận và trả về mã mới hiện hành thay vì 401.

**Avatar** (lựa chọn của Claude): giữ tên file theo username (không đổi URL `GET /avatars/:username` hay `Avatar.jsx`). Thêm một middleware chạy sau `checkAuth`, trước multer, tra `User` theo `req.userId` rồi đặt `req.body.username`/`req.username` cho multer dùng; bỏ qua `username` client gửi.

**Gắn `checkAuth`**: thứ tự mount trong `index.js` (`/api` trước `/api/auth`) để builder sắp lại hoặc gắn theo router; yêu cầu là mọi route trong `routes/api.js` (kể cả `/history*`, trừ `/search` và `/video/:id`) đều cần đăng nhập, `/api/auth/login|register|refresh|logout` thì không.

**Tài liệu**: `docs/openapi.yml` thêm security scheme bearer + cookie, route refresh/logout, ghi 401/404 cho từng route; `npx @redocly/cli lint docs/openapi.yml` 0 lỗi. README backend thêm cách chạy script.

**Test**: `npm test` hiện chạy `node --test utils`. Logic mới có test đơn vị ở mức nhỏ nhất đủ tin (ví dụ hàm tạo/băm/kiểm refresh token, hàm dựng điều kiện lọc theo chủ). Phần route thử bằng curl trên `localhost:8404` theo kịch bản TC-07 và luồng login → refresh → logout.

### Frontend (repo này, nhánh mới `v2/auth` cắt từ `v2/main`)

- `src/services/axiosClient.js`:
  - Giữ access token **trong bộ nhớ** (biến module + hàm `setAccessToken`), không còn localStorage.
  - `withCredentials: true` để cookie đi kèm.
  - Request interceptor gắn `Authorization: Bearer`.
  - Response 401 (trừ chính các route `/api/auth/*`): gọi `POST /api/auth/refresh` **một lần dùng chung** cho mọi request đang chờ, lấy token mới rồi gửi lại request; refresh hỏng → gọi callback "hết phiên" do `AuthProvider` đăng ký.
- `axiosUpload.js`: cũng gắn token và `withCredentials`.
- `AuthContext.jsx`:
  - Khởi động: gọi `refresh` → có token thì `GET /api/auth/me`; không thì coi như chưa đăng nhập. `loading` đúng trong lúc này để `RequireAuth` không đá về `/login` sớm.
  - `login`/`register` lưu token qua `setAccessToken`.
  - `logout` gọi `POST /api/auth/logout`, xoá token trong bộ nhớ, xoá `user`, dọn `localStorage` key `token` cũ.
  - Hết phiên (refresh hỏng) → như logout nhưng không gọi API.
  - `user` vẫn có thể cache localStorage để hiện avatar nhanh, nhưng chỉ coi là đăng nhập sau khi `me` thành công (lựa chọn của builder).
- Link chia sẻ: `RequireAuth`/`GuestOnly` trong `AppRouter` đã đưa người chưa đăng nhập qua `/login` rồi quay lại — chỉ cần kiểm lại sau khi đổi luồng khởi động. Playlist của người khác → API 404 → `PlaylistPage` đã có nhánh "Không tìm thấy"; kiểm lại TC-07 bước 2.
- Frontend `.env`: không cần biến mới.

## Rủi ro đã biết

- **Cookie khác site trên bản deploy:** frontend Vercel và backend khác tên miền nên refresh cookie là cookie bên thứ ba. Safari (và trình duyệt chặn cookie bên thứ ba) sẽ không gửi → người dùng phải đăng nhập lại sau 1 giờ. Ở localhost không bị. Cách sửa gọn sau này: cho Vercel chuyển tiếp `/api/*` sang backend để cookie thành cùng site. GĐ3 không làm việc này; ghi vào README.

## Để builder tự quyết

Tên file/hàm cụ thể, cấu trúc test, cách gom route trong `api.js`, thông điệp lỗi tiếng Việt cho 401, thứ tự task (nên làm backend trước, frontend sau).

## Xong khi

- TC-07 qua bằng curl (bước 3) và trên preview frontend (bước 2). "Preview" ở đây là Vite dev server local nối `localhost:8404`, không phải link Vercel (xem rủi ro cookie khác site).
- Login → chờ access hết hạn (hoặc giả lập) → app tự làm mới, không bị đá ra; logout → refresh cũ bị từ chối.
- `npm test` + build sạch ở cả hai repo; preview frontend không lỗi đỏ trong console.
- Script chạy thử trên bản sao DB đúng số playlist, rồi chạy thật; `duongdonate` thấy đủ playlist cũ.
- Redocly lint 0 lỗi.
- Người dùng duyệt.
