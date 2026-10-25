# GĐ3b · Đăng nhập Google (nâng cấp GĐ3): thiết kế

Ngày: 2026-10-26 · Nối tiếp `docs/superpowers/specs/2026-10-25-gd3-auth-per-user-design.md` (GĐ3 đã merge: backend `main` 3516063, frontend `v2/main` 63f04ad).

## Vì sao

Đăng ký bằng tên + mật khẩu rườm rà với app nghe nhạc. Người dùng muốn bấm một nút Google là vào thẳng. Cùng lúc, bản deploy (frontend Vercel, backend Render gói Free) phải chạy được thật: cookie phiên không bị Safari chặn, và backend Render "ngủ" không làm người dùng bị đá ra trang đăng nhập.

## Mục tiêu

1. Trang đăng nhập và đăng ký có nút "Tiếp tục với Google"; bấm xong vào thẳng app với tên và ảnh Google.
2. Đăng nhập bằng mật khẩu vẫn chạy như cũ (`duongdonate` và các tài khoản hiện có).
3. Trên deploy, frontend gọi API qua cùng tên miền Vercel (chuyển tiếp sang Render), nên cookie refresh là cookie cùng site.
4. Backend Render đang ngủ khi mở app → người dùng thấy màn hình chờ, không bị về trang đăng nhập.
5. Route playlist thống nhất dưới `/api/playlists/:id…`.

## Không làm

- Gộp tài khoản Google với tài khoản mật khẩu (người dùng chốt: `duongdonate` giữ 6 playlist, tài khoản Google bắt đầu trống).
- Bước đặt tên / chọn avatar sau khi bấm Google; đổi tên hoặc ảnh sau khi đăng ký.
- One Tap (hộp Google tự bật lên), đăng nhập bằng mạng xã hội khác.
- Kiểm thử Vercel preview + Render cho nhánh (Render chỉ deploy `main`); kiểm thật lúc phát hành.

## Điều không được xảy ra

- Người đăng nhập bằng mật khẩu bị hỏng đăng nhập.
- Mở app khi Render đang ngủ (cookie còn hạn) mà bị đưa về `/login`.
- Một tài khoản Google tạo ra hai user khác nhau, hoặc đăng nhập vào user của người khác.
- Thêm bài vào playlist bị 404 vì frontend và backend lệch đường dẫn.

## Người dùng đã chốt

- **Trang đăng nhập (bản A):** nút "Tiếp tục với Google" trên cùng → đường kẻ "hoặc" → form tên đăng nhập + mật khẩu như hiện tại. Bản mẫu: `.superpowers/brainstorm/749-1792949693/content/google-login.html` (phương án A).
- **Trang đăng ký:** form cũ (avatar, tên, mật khẩu) trên cùng → "hoặc" → nút Google → một dòng chữ nhỏ mờ như điều khoản: *"Đăng ký bằng Google sẽ dùng luôn tên và ảnh Google của bạn, một chạm là xong."*
- Bấm Google là vào thẳng app, dùng tên và ảnh Google. Không gộp tài khoản.
- **Google OAuth Client ID** (công khai): `572253459004-cnmm5io8dq6kj3hmjptu84nb26tle2fj.apps.googleusercontent.com`. Origins đã khai: `http://localhost`, `http://localhost:3000`, `https://donatefy.vercel.app`. Consent screen External, đã/được hướng dẫn Publish.
- **Backend deploy:** Render gói Free, `https://donatefy-backend.onrender.com`.
- **Route:** thống nhất `/api/playlists/:id`. Phần người dùng đang sửa dở trong backend (đổi `POST /api/playlist/:id/add-song` → `/api/playlists/:id/add-song`, format lại `routes/api.js`, `docs/openapi.yml`) là **commit đầu tiên** của nhánh mới.
- **Nhánh:** `v2/google-auth` ở cả hai repo (backend từ `main`, frontend từ `v2/main`).

## Thiết kế

### Backend (`E:\music-player-app-master\backend`, nhánh `v2/google-auth`)

**Commit đầu:** commit nguyên phần người dùng đang sửa (route `add-song` số nhiều + format), không chỉnh gì thêm.

**Model `User`:** thêm `googleId: String` (unique, sparse), `displayName: String`. `password` chỉ bắt buộc khi không có `googleId`. `avatar` giữ kiểu hiện có: với user Google lưu URL ảnh Google (chuỗi `https://…`).

**`POST /api/auth/google`** body `{ credential }` (ID token từ Google Identity Services):
- Kiểm bằng `google-auth-library` (`OAuth2Client.verifyIdToken`, `audience: process.env.GOOGLE_CLIENT_ID`) — thư viện mới duy nhất của GĐ3b (lựa chọn của Claude). Sai/hết hạn/thiếu → 401 `{ message: "Đăng nhập Google thất bại" }`.
- Tìm user theo `googleId = payload.sub`. Có → cập nhật `displayName`, `avatar` theo Google (người dùng chốt: mỗi lần đăng nhập Google đều cập nhật tên và ảnh theo Google; nếu sau này có tính năng sửa thông tin cá nhân thì phải xem lại chỗ này vì nó sẽ ghi đè tên tự đặt). Chưa có → tạo user mới: `username` tự sinh không trùng, `displayName = payload.name`, `avatar = payload.picture`, không có `password`.
- Trả như login: `issueSession(res, String(user._id))` → 200 `{ access_token }` + cookie refresh.
- Không bao giờ ghép theo email hay username (không gộp tài khoản).

**Sinh `username`** (hàm thuần, có test): lấy phần trước `@` của email (hoặc `name`), bỏ dấu tiếng Việt, chỉ giữ ký tự mà `checkRegister` cho phép, cắt độ dài cho hợp lệ; trùng thì thêm hậu tố số ngẫu nhiên, thử lại tới khi không trùng. Kết quả theo đúng quy tắc tên của form đăng ký frontend (`src/features/auth/authForm.js`): 3–30 ký tự, chỉ chữ không dấu, số, `_`, `.` (backend `checkRegister` chỉ kiểm trùng). Tạo user gặp lỗi trùng khoá (E11000, hai người cùng lúc) → sinh tên khác, thử lại (lựa chọn của Claude).

**Đăng nhập mật khẩu với user Google:** user không có `password` → 401 như sai mật khẩu (không gọi `bcrypt.compare` với `undefined`).

**`GET /api/auth/me`:** trả thêm `displayName`; với user có `avatar` là URL `http…` thì trả nguyên URL đó (không ghép `BASE_URL/uploads/...`).

**`GET /api/playlists/:id`:** mới, cần đăng nhập, lọc `ownedFilter` như các route khác, trả `{ ...playlist, cover }` giống `GET /playlists/:id`. Route cũ `GET /playlists/:id` giữ nguyên (lựa chọn của Claude: app v1 đang chạy còn dùng).

**Env:** thêm `GOOGLE_CLIENT_ID` (README + `.env` local; người dùng tự thêm trên Render khi phát hành).

**Tài liệu:** `docs/openapi.yml` thêm `/api/auth/google`, `GET /api/playlists/{id}`, đường `add-song` mới; Redocly lint 0 lỗi.

### Frontend (repo này, nhánh `v2/google-auth`)

**Nút Google:** Google Identity Services, tải script `https://accounts.google.com/gsi/client` **chỉ trên trang `/login`, `/register`**. `google.accounts.id.initialize({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, callback })` + `renderButton` (nút trắng có logo G, chữ "Tiếp tục với Google", `locale: "vi"`, bo tròn, rộng bằng ô nhập). Không gọi `prompt()` (không One Tap). Script lỗi tải → ẩn khối Google, form mật khẩu vẫn dùng được.
- `AuthContext` thêm `loginWithGoogle(credential)` → `POST /api/auth/google` → `startSession` như login; trả `{ success, message }`.
- Trang đăng nhập/đăng ký bố trí đúng thứ tự người dùng chốt (mục trên), giữ giao diện thẻ kính và Matcappa hiện có. Đường kẻ "hoặc" và dòng chữ nhỏ theo màu chữ phụ của thẻ.

**Tên và ảnh:** chỗ nào đang hiện tên người dùng thì dùng `displayName || username`. `Avatar.jsx`: `user.avatar` là URL `http…` → dùng thẳng; không thì giữ cách dò `/uploads/avatars/<username>.png|jpg` như cũ.

**API mới:** `playlistService.getById` → `/api/playlists/${id}`; `addSong` → `/api/playlists/${id}/add-song`.

**Render ngủ:**
- Lời gọi refresh lúc khởi động có timeout 60 giây; `axiosClient` timeout nâng từ 10 lên 60 giây (lựa chọn của Claude: request đầu sau khi Render ngủ mất 30–50 giây).
- Khởi động: **chỉ 401** từ refresh mới coi là chưa đăng nhập. Lỗi mạng / hết giờ / 5xx → thử lại (giãn dần) trong tối đa ~60 giây, vẫn hiện màn hình chờ; sau ~3 giây chờ thì màn hình chờ có thêm một câu của Matcappa kiểu *"Quán đang mở cửa, chờ xíu nha…"*. Hết 60 giây vẫn lỗi → về trang đăng nhập.

**Chuyển tiếp Vercel:** `vercel.json` thêm rewrite (đặt **trước** rewrite SPA hiện có) cho `/api/:path*`, `/upload/:path*`, `/uploads/:path*` → `https://donatefy-backend.onrender.com/...`. Trên Vercel đặt `VITE_API_URL` rỗng (gọi cùng origin); local giữ `http://localhost:8404`. Ghi các biến cần đặt trên Vercel/Render vào README frontend.

**Env:** `.env` local thêm `VITE_GOOGLE_CLIENT_ID=<client id ở trên>`; `.env.example` (nếu có) thêm khoá rỗng.

### Quyết định thêm sau khi soát (lựa chọn của Claude)

- **Avatar:** frontend v2 chỉ dò `/uploads/avatars/<username>.png|jpg` (không dùng `GET /avatars/:username`). User Google không có bản ghi `Avatar`, không upload; `/me` trả URL Google khi `avatar` bắt đầu bằng `http`. Đăng ký mật khẩu vẫn như cũ (frontend gửi `avatar: true/false`), dữ liệu cũ để nguyên.
- **Render env khi phát hành:** `BASE_URL = https://donatefy-backend.onrender.com` (ảnh bìa `/img/...` tải thẳng từ Render; cookie `SameSite=None; Secure` vẫn chạy qua chuyển tiếp vì trình duyệt chỉ thấy origin Vercel). `FRONTEND_URL` giữ `https://donatefy.vercel.app` (request qua chuyển tiếp vẫn mang header `Origin`). Không cần `trust proxy` (code không đọc `req.secure`).
- **Thử lại khi Render ngủ:** chỉ cho lời gọi refresh lúc khởi động (nó cũng đánh thức Render). Các request khác chỉ được nâng timeout lên 60 giây; nếu Render ngủ giữa chừng và chuyển tiếp Vercel hết giờ thì request đó báo lỗi như lỗi mạng hiện tại, không đăng xuất.
- **Tương thích v1:** backend GĐ3/GĐ3b chỉ lên bản thật cùng frontend v2 lúc phát hành, nên không cần alias cho `POST /api/playlist/:id/add-song`. `GET /playlists/:id` cũ vẫn giữ vì không tốn gì.
- **`VITE_API_URL` rỗng trên Vercel:** code dùng thẳng giá trị (axios `baseURL`, `Avatar.jsx` ghép chuỗi), không có fallback `||`, nên chuỗi rỗng cho đường dẫn tương đối như mong muốn.

## Kiểm tra

- Backend: `npm test` (thêm test cho hàm sinh username); curl `POST /api/auth/google` với token rác → 401; `GET /api/playlists/:id` chủ → 200, người khác → 404, không token → 401; login mật khẩu vẫn 200; login mật khẩu vào user Google → 401.
- Frontend: `npm test`, `npm run build`, eslint; preview `localhost:3000`: nút Google hiện đúng vị trí ở cả hai trang, form mật khẩu chạy, thêm bài và mở playlist chạy với đường mới, giả lập refresh lỗi mạng lúc khởi động → thấy màn hình chờ chứ không về `/login`.
- **Đăng nhập Google thật do người dùng tự bấm** trên preview (Claude không đăng nhập Google thay người dùng): vào thẳng app, thấy tên/ảnh Google, thư viện trống; đăng xuất rồi bấm Google lại → cùng tài khoản.
- `vercel.json`: kiểm cú pháp và thứ tự rewrite; chạy thật kiểm lúc phát hành.

## Rủi ro đã biết

- Mỗi link xem thử Vercel muốn dùng nút Google phải được thêm vào Authorized JavaScript origins (Google không nhận `*`).
- Vercel chuyển tiếp ra ngoài có giới hạn thời gian chờ; nếu Render thức dậy quá lâu, request đầu có thể lỗi — đã có thử lại ở khởi động.
- Ảnh Google (`lh3.googleusercontent.com`) có thể đổi URL; cập nhật mỗi lần đăng nhập Google.

## Để builder tự quyết

Tên file/hàm, cách gom code nút Google (component riêng hay trong `AuthPage`), cấu trúc test, số lần và khoảng thử lại ở khởi động (trong giới hạn ~60 giây), thông điệp lỗi.
