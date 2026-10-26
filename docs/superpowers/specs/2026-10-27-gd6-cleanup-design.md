# Giai đoạn refactor (GĐ6) · Tách auth, hộp xác nhận kính, dọn v1: thiết kế

Ngày: 2026-10-27 · Nối tiếp GĐ1–GĐ5, GĐ3, GĐ3b (đã merge vào `v2/main`, mới nhất `f7b185b`). Memory: `gd6-cleanup`, `ignore-v1-ui`, `review-cost`, `feedback-batch-commit`.

## Vì sao

- `features/auth/AuthPage.jsx` 257 dòng gom cả mascot, ô nhập, form đăng nhập, form đăng ký, Google. Người dùng muốn chia nhỏ theo cách v1 đã làm: `SignInForm` + `SignUpForm`, một `AuthFlow` chuyển qua lại.
- Hộp xác nhận (`useConfirm` → `PopupContext`) còn giao diện v1 (`bg-card`, nút `bg-destructive`), lệch với kính matcha của v2.
- `src/` còn khoảng 45 file v1 chết, trùng tên với bản v2 (`pages/PlaylistPage.jsx` và `features/playlist/PlaylistPage.jsx`).
- Hai thư mục `design/` và `components/` cùng chứa component dùng chung. Người dùng chốt: giữ `components/`, dồn `design/` về đó.

## 1. Tách `features/auth`

Giữ route `/login`, `/register` (link cũ và `GuestOnly` dựa vào đó). `AuthPage` đóng vai `AuthFlow`: `mode === "login" ? <SignInForm …/> : <SignUpForm …/>`; nút "Đăng ký ngay" / "Đăng nhập" gọi `onToggle` → `navigate(to, { replace: true, state: location.state })` như hiện tại.

| File | Trách nhiệm |
|---|---|
| `AuthPage.jsx` | Nền, nút "Về quán", thẻ `Glass`, tiêu đề, lớp chờ (`PageLoader` + câu chờ), mascot, chọn form theo `mode`. Giữ state `username` (đổi chế độ vẫn giữ tên đăng nhập) và `busy` (mascot ôm đĩa khi chờ). |
| `SignInForm.jsx` | Google → "hoặc" → tên, mật khẩu → lỗi chung → nút "Đăng nhập" → dòng chuyển sang đăng ký. |
| `SignUpForm.jsx` | Avatar → tên, mật khẩu (gợi ý "Ít nhất 6 ký tự.") → lỗi chung → nút "Tạo tài khoản" → "hoặc" → Google → dòng chữ nhỏ Google → dòng chuyển sang đăng nhập. |
| `Field.jsx` | `Field` (label ẩn, ô con, lỗi `id-error`, gợi ý `id-hint`) và `TextInput` (ô nhập với `inputCls` hiện có). |
| `PasswordInput.jsx` | Ô mật khẩu có nút mắt ẩn/hiện (tự giữ state). |
| `OrDivider.jsx` | Đường kẻ "hoặc". |
| `useAuthSubmit.js` | Chặn gửi hai lần, bật/tắt `busy`, giữ lỗi chung; dùng cho cả nút submit và Google. |
| `useWander.js` | Hook mascot bay quanh thẻ (dời nguyên từ `AuthPage`). |
| `authForm.js`, `AvatarPicker.jsx`, `GoogleButton.jsx` | Giữ nguyên. |

Hành vi, copy, class giữ y như hiện tại: chỉ chia file, không đổi giao diện.

## 2. Hộp xác nhận theo kính v2

`PopupContext` giữ `AnimatePresence` + hai lớp `motion.div` (mờ nền, phóng thẻ). Đổi giao diện theo `SongDialog`:
- Nền: `bg-[rgba(5,8,4,.5)]` thay cho `glass backdrop-blur-sm`.
- Thẻ: `Glass` `blur={30}`, `rounded-[28px] !border-white/15 !bg-[rgba(40,48,36,.72)] p-6 text-[#eef3e6]`, `role="dialog" aria-modal="true"`.
- Nút đóng: `IconButton label="Đóng"` (như `SongDialog`). Phím Esc và bấm ra nền cũng đóng.
- `useConfirm`: nút "Hủy bỏ" = `Button variant="ghost"` (chữ sáng), nút "Xóa" = `Button` nền đỏ `#b3261e`. Đóng bằng X/Esc/nền = Hủy (resolve `false`).

Chuyển động giữ như cũ.

## 3. Xoá file v1 chết

Dò import thật từ `src/main.jsx` (kể cả `lazy(import())`, CSS module, ảnh), ngày 2026-10-26 trên `f7b185b`:

- **`components/` không ai import:** `AvatarButton`, `Background`, `Card/CreatePlaylistCard`, `Container`, `HeaderSongTable`, `HomeButton`, `Inputs/TextFeild`, `Logo`, `LogoutButton`, `LyricsPopup`, `PlayingIcon`, `PlaylistDetail`, `PlayPauseButton`, `SearchBar/*` (3), `Sidebar/*` (5), `SongContainer`, `SongItem`, `SongList`, `SongQueue/*` (2), `SongTable`, `ThemeToggle/*` (3), `Toast/index.js`, `ViewToggle`.
- **Chỗ khác không ai import:** `contexts/AuthFlow.jsx`, `hooks/useLocalStorage.jsx`, `hooks/useSticky.jsx`, `layouts/DefaultLayout.jsx`, `pages/HomePage.jsx`, `pages/PlaylistPage.jsx`, `services/api/userService.js`, `utils/formatDate.js`.
- **`assets/`:** mọi file trừ `assets/image/Tanjiro.jpg` (13 file).
- **Chỉ sống nhờ export `AuthFlow` trong `AuthContext.jsx`** (xoá cùng export đó): `components/SignInForm.jsx`, `components/SignUpForm.jsx`, `components/AvatarUpload.jsx`.
- **Provider rỗng:** `contexts/MusicPlayerContext.jsx` (`value={{}}`, không ai đọc) → xoá, bỏ `<MusicProvider>` khỏi `main.jsx`.

`SongQueue` không dời: hàng chờ v2 là `features/queue/`.

## 4. Dồn component dùng chung về `components/`

| Hiện tại | Sang |
|---|---|
| `design/{Button,Glass,IconButton,Vinyl}.jsx`, `design/index.js` | `components/` (cùng tên); xoá `design/` |
| `components/Toast/Toast.jsx` | `components/Toast.jsx` (import `./Glass`, `./Button`, không qua `index.js` để tránh vòng) |
| `components/Loader/`, `components/Marquee.jsx`, `components/Avatar.jsx` | Giữ chỗ cũ |
| `components/MusicPlayer/` | `features/player/MusicLayer/` (`MusicPlayer.jsx` → `MusicLayer.jsx`, bỏ `index.js`): thanh phát gắn Redux, thuộc tính năng player, không phải component dùng chung |

Dời bằng `git mv`. Ngoài đường import và tên `MusicPlayer` → `MusicLayer`, không sửa nội dung.

## Không đụng

- `src/app/**` (Redux v2 đang dùng: `store`, `playerSlice`, `playlistSlice`, `selectors`).
- `public/`: giữ nguyên mọi file (người dùng chốt 2026-10-26).
- CSS: giữ nguyên `src/App.css`, `src/index.css` (người dùng chốt 2026-10-26).
- Gỡ gói npm; gộp `ProgressMusicBar` với `features/player/ProgressBar`; đổi giao diện trang đăng nhập/đăng ký.

## Điều không được xảy ra

- Đăng nhập, đăng ký (có/không avatar), Google chạy khác trước: lỗi sai mật khẩu vẫn hiện dưới ô, bấm hai lần không gửi hai request, đổi `/login` ↔ `/register` giữ tên đăng nhập và xoá lỗi.
- Bấm X hoặc Esc ở hộp xác nhận mà vẫn xoá playlist.
- Trang v2 nào (`/`, `/login`, `/register`, `/playlists`, `/playlists/:id`, `/listen`, 404, `/dev/ui`) trắng trang hay lỗi console vì thiếu import.
- Music Layer biến mất ở `/playlists` hoặc hiện ở `/listen`; toast, avatar Header, loader không hiện.

## Xong khi

- `src/design/` không còn; `src/components/` chỉ còn component v2 dùng chung; `find src -type f` khớp danh sách trong kế hoạch.
- `npm test`, `npm run build`, `npm run lint` không lỗi mới so với `f7b185b`.
- Thử bằng mắt các luồng trên ở preview.
