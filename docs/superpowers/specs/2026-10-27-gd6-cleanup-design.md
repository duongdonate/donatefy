# GĐ6 · Dọn thư mục v1: thiết kế

Ngày: 2026-10-27 · Nối tiếp GĐ1–GĐ5, GĐ3, GĐ3b (đã merge vào `v2/main`, mới nhất `f7b185b`). Memory: `gd6-cleanup`, `ignore-v1-ui`, `review-cost`, `feedback-batch-commit`.

## Vì sao

`src/components/`, `src/pages/`, `src/hooks/`… còn khoảng 55 file v1 không còn chạy, trùng tên với bản v2 (`pages/PlaylistPage.jsx` vs `features/playlist/PlaylistPage.jsx`, `SongQueue` vs `features/queue`). Người hay agent mở nhầm file chết là chuyện thường. Sau GĐ6, mọi file trong `src/` đều được `src/main.jsx` dùng tới (trừ file test), và `src/components/` không còn.

## Cách xác định file chết

Dò import thật từ `src/main.jsx` (kể cả `lazy(import())`, CSS module, ảnh), ngày 2026-10-26 trên `f7b185b`. Kết quả:

**Không ai import (xoá):**
- `components/`: `AvatarButton`, `Background`, `Card/CreatePlaylistCard`, `Container`, `HeaderSongTable`, `HomeButton`, `Inputs/TextFeild`, `Logo`, `LogoutButton`, `LyricsPopup`, `PlayingIcon`, `PlaylistDetail`, `PlayPauseButton`, `SearchBar/*` (3), `Sidebar/*` (5), `SongContainer`, `SongItem`, `SongList`, `SongQueue/*` (2), `SongTable`, `ThemeToggle/*` (3), `Toast/index.js`, `ViewToggle`.
- `contexts/AuthFlow.jsx`; `hooks/useLocalStorage.jsx`, `hooks/useSticky.jsx`; `layouts/DefaultLayout.jsx`; `pages/HomePage.jsx`, `pages/PlaylistPage.jsx`; `services/api/userService.js`; `utils/formatDate.js`.
- `assets/`: mọi file trừ `assets/image/Tanjiro.jpg` (13 file: `chasen.svg`, `cup.svg`, `matcha-playlist.svg`, `matcha_chasen.svg`, `matcha_music.svg`, `react.svg`, 7 ảnh trong `image/`).

**Chỉ còn sống nhờ export `AuthFlow` trong `AuthContext.jsx` (xoá cùng export đó):** `components/SignInForm.jsx`, `components/SignUpForm.jsx`, `components/AvatarUpload.jsx`.

**Provider rỗng:** `contexts/MusicPlayerContext.jsx` chỉ trả `value={{}}`, không ai đọc context → xoá, bỏ `<MusicProvider>` khỏi `main.jsx`.

## Dời component v2 ra khỏi `src/components/`

| Hiện tại | Sang | Ai import |
|---|---|---|
| `components/MusicPlayer/` (4 file + `index.js`) | `features/player/MusicLayer/` (`MusicPlayer.jsx` đổi tên `MusicLayer.jsx`, bỏ `index.js`) | `routes/AppRouter.jsx` |
| `components/Loader/` (2 loader + CSS module + `index.js`) | `design/Loader/` (giữ nguyên cấu trúc) | `AppRouter`, `pages/DevUI`, `features/landing/scenes`, `features/auth/AuthPage` |
| `components/Marquee.jsx` | `design/Marquee.jsx` | `features/player/NowPlaying`, `features/queue/QueueRow`, `MusicLayer` |
| `components/Toast/Toast.jsx` | `design/Toast.jsx` (import `./Glass`, `./Button` trực tiếp, không qua `design/index.js` để tránh vòng) | `contexts/ToastContext` |
| `components/Avatar.jsx` | `layouts/Avatar.jsx` (đọc `useAuth`, chỉ `Header` dùng nên không hợp `design/`) | `layouts/Header` |

`SongQueue` không dời: không ai import, hàng chờ v2 là `features/queue/`. `ThemeToggle` cũng không ai import → xoá.

Dời bằng `git mv` để giữ lịch sử. Không sửa nội dung ngoài đường import và tên component `MusicPlayer` → `MusicLayer`.

## `src/app/**` (Redux)

Không phải v1 chết: `store.js`, `slices/playerSlice.js`, `slices/playlistSlice.js`, `selectors/*` được `main.jsx`, `AppShell`, `LibraryPage`, `PlaylistPage`, `NowPlaying`, `Dock`, `GlassBar`, `QueueOverlay`, `PlayerEngine`, `useLogout`, `LandingPage` dùng. **GĐ6 không đụng `src/app/**`.**

## Không làm

- `public/` (`duongdonate.jpg`, `fruit_11499859.png`, `matcha_cup.svg`, `vite.svg`, `chasen.svg`, `matcha_chasen.svg` hiện không file nào trong `src/` hay `index.html` gọi): có thể link ngoài dùng, để việc sau.
- Lớp CSS v1 trong `src/App.css` (`.slider`, `.music-bars`, `.mask-to-*`…): dò theo class khó chắc chắn, để việc sau.
- Gộp `MusicLayer/ProgressMusicBar` với `features/player/ProgressBar`, đổi giao diện Music Layer.
- Gỡ gói npm (sau khi xoá có thể còn gói chỉ v1 dùng; để việc sau).

## Điều không được xảy ra

- Trang nào của v2 (`/`, `/login`, `/register`, `/playlists`, `/playlists/:id`, `/listen`, 404, `/dev/ui` khi dev) trắng trang hay lỗi console vì thiếu import.
- Music Layer dính đáy biến mất ở `/playlists` hoặc hiện ở `/listen`.
- Toast, avatar trên Header (cả ảnh Google `http…` lẫn ảnh mặc định Tanjiro), loader khi Render ngủ không còn hiện.

## Xong khi

- `src/components/` không còn; `find src -type f` khớp đúng danh sách trong kế hoạch.
- `npm test`, `npm run build`, `npm run lint` không có lỗi mới so với `f7b185b`.
- Thử bằng mắt các trang trên ở preview.
