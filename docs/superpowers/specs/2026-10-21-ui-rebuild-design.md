# Thiết kế: Làm lại giao diện Donatefy v2 · Matcha Cha-Cha-Cha

> Ngày: 21/10/2026 · Nhánh: `v2/main` (giai đoạn: `v2/<tên>`)
> Nguồn: [docs/report/donatefy-v2-plan.md](../../report/donatefy-v2-plan.md) (gọi tắt **"tài liệu v2"**, chứa mã FR/NFR/TC) và bản mẫu trong `.superpowers/brainstorm/`.
> Kế hoạch theo đợt: `tasks/task.md`, `tasks/todo.md` (chỉ có trên máy, `tasks/` nằm trong `.gitignore`).
>
> Tài liệu này **không chép lại** danh sách yêu cầu của tài liệu v2. Nó ghi những gì cần thêm để build đúng: chỗ nào lấy số đo từ đâu, hành vi từng màn, cách nối với code hiện có, và những gì đã chốt sau tài liệu v2.

---

## 1. Ý định

Donatefy là app nghe nhạc YouTube cá nhân. v1 chạy được nhưng trông như mọi bản "Spotify clone". v2 đổi toàn bộ phần nhìn theo một ý: **một quán matcha có bán đĩa nhạc**. Người dùng không "dùng app", mà ghé quán, chọn một chồng đĩa và để nó quay. Cảm giác cần có: **thong thả, ấm, một màn hình một chiếc đĩa**.

Lý do làm bây giờ: lõi phát nhạc vừa được sửa ổn định (đợt 1, đợt 2, hàng chờ kéo thả), nên thay lớp hiển thị mà không đụng lõi là lúc ít rủi ro nhất.

## 2. Mục tiêu, không phải mục tiêu, phản mục tiêu

**Mục tiêu**
- Mọi màn hình theo cùng một hệ: matcha + kính mờ + đĩa than + Matcappa.
- Màn chính chỉ còn đĩa than, dock bìa và thanh kính bên phải; các nút khác tự ẩn.
- Dùng tốt từ 360px tới 1920px, dùng được hoàn toàn bằng bàn phím, tôn trọng giảm chuyển động.
- Nhạc **không bao giờ ngắt** khi đổi trang hay mở lớp phủ.

**Không phải mục tiêu (v2)**: lời bài hát, gợi ý thông minh, app di động gốc, nguồn nhạc ngoài YouTube, đa ngôn ngữ, mạng xã hội (tài liệu v2 mục 18).

**Phản mục tiêu** (chạy đúng mà vẫn coi là hỏng)
- Phá luồng phát nhạc: phát / dừng / chuyển bài / shuffle / lặp chạy sai so với v1.
- Giật lag trên máy yếu vì kính mờ chồng lớp hoặc hoạt ảnh nặng (lý do đã bỏ landing 3D).
- Trông lại giống Spotify: nút xanh lá tròn, sidebar cố định, thanh phát ngang ở đáy.
- Mascot gây phiền: phát sáng, né chuột, nói liên tục, che nội dung.
- Lộ lỗi kỹ thuật cho người dùng ("Network Error", JSON lỗi).

## 3. Ràng buộc

- **Giữ nguyên logic:** `src/app` (store, slices, selectors), `src/services/api`, `src/hooks`, `src/contexts`, `src/utils`. Luồng phát một chiều: Redux → `ReactPlayer`; `onPlay` / `onPause` / `onEnded` / `onError` → dispatch. Chỉ được **thêm** reducer mới (có test), không sửa reducer cũ.
- `MusicPlayer` đang mount trong `src/main.jsx`, ngoài router. Giữ như vậy để nhạc không ngắt.
- Stack giữ nguyên: React 19, Vite 6, Redux Toolkit, Tailwind 3, framer-motion, react-player 2, lucide-react, React Router 6. **Không thêm thư viện** trừ khi một việc thật sự cần và đã hỏi bạn.
- Test hiện có là file `*.test.js` chạy bằng `node` (dùng `node:assert`), không có Vitest.
- Backend ở repo riêng `E:\music-player-app-master\backend`, CORS chỉ cho đúng `FRONTEND_URL`. Link xem thử Vercel gọi API được chỉ sau khi sửa CORS (việc B4).
- Nhánh: làm trên `v2/<tên>` cắt từ `v2/main`; chỉ merge `v2/main` vào `main` lúc phát hành, nên `donatefy.vercel.app` giữ v1 tới ngày đó.
- **Thứ tự frontend (đã chốt):** GĐ1 → GĐ2 → **GĐ5 Now Playing + hàng chờ** → **GĐ4 Thư viện, playlist, tìm kiếm** → GĐ6. Trong GĐ5, nút Thư viện trên rail và nút "Mở thư viện" tạm dẫn về giao diện v1 (trang chủ có sidebar playlist, `/playlist/:id` v1) cho tới khi GĐ4 xong. Builder chọn đường dẫn tạm, miễn tạo và mở được playlist.
- Mỗi đợt build để app **vẫn chạy được**; màn mới thay hẳn route cũ khi xong, không để hai giao diện song song trong cùng một route.

## 4. Hệ thiết kế

### 4.1 Màu
Theo tài liệu v2 mục 4.1. Khai báo dạng kênh RGB trong CSS variable để Tailwind dùng được độ mờ (`bg-matcha-4/50`). Tên Tailwind đề xuất: `matcha-1..4`, `cream`, `ink`, `ink-soft` (#55624c), `mascot` (#d8eca0). Các biến shadcn cũ (`--primary`…) giữ lại cho tới khi component v1 cuối cùng bị xoá.

**Nền sáng** (từ bản mẫu): `linear-gradient(160deg, #dfe8c9 0%, #f4efe1 55%, #e7ecd8 100%)` + 2–3 "blob" màu mờ (`filter: blur`) phía sau, gồm matcha-2, matcha-1 và hồng nhạt `#f2c9c9`.

**Lớp phủ tối** (hàng chờ, thư viện): nền `rgba(10,16,9,.82)` + quầng `radial-gradient(… rgba(73,115,0,.45) …)` + blur, chữ `#eef3e6`. Lớp phủ tối dùng chung một style, không phụ thuộc chế độ sáng/tối.

**Chế độ tối toàn app:** chưa có bản mẫu. Builder làm bản mẫu bảng màu tối ở việc T10 để bạn chọn trước khi áp.

### 4.2 Chữ
Be Vietnam Pro 400–800 cho mọi nội dung. Yellowtail **chỉ** cho chữ không dấu ("Matcha Cha-Cha-Cha", "Cha-Cha", "Vinyl", số thứ tự). Dancing Script cho chữ viết tay có dấu ("Thong thả thôi ~"). Tải qua Google Fonts với `display=swap`.

Cỡ chữ trong bản mẫu dùng đơn vị `cqw` (theo khung iPad 4:3). Khi build, quy đổi sang `clamp()` theo viewport. Tỉ lệ giữa các phần tử phải giữ đúng như bản mẫu, còn con số cụ thể thì builder tự quyết.

### 4.3 Kính mờ
Class `.glass` trong `src/App.css` là gốc (nền xám 20% + viền sáng; tối: xám đậm). Bản mẫu thêm `background-clip: padding-box` và blur tại chỗ (mặc định 18px). Tối đa **2 lớp kính chồng nhau**.

### 4.4 Chuyển động
Thời lượng 200 / 400 / 900ms; đường cong `cubic-bezier(.2,.8,.2,1)`. Chỉ animate `transform` / `opacity` (ngoại lệ: `filter` trên bìa dock, đã có trong bản mẫu). Khi `prefers-reduced-motion: reduce`: đĩa không quay, mascot không bay, bìa không bay, header/rail hiện/ẩn tức thì. Trạng thái vẫn đổi đúng.

### 4.5 Thành phần đặc trưng (số đo trong `visual-direction-v3.html`)
- **Đĩa than latte-matcha:** `conic-gradient` matcha xen kem + rãnh `repeating-radial-gradient` + vệt sáng `sheen`, quay 7s/vòng. Nhãn giữa (inset 34%) là ảnh bìa bài, viền kem. Tạm dừng thì `animation-play-state: paused` (dừng đúng góc, không nhảy về 0).
- **Cần đọc:** SVG, xoay quanh điểm gốc; dừng thì xoay −18°, chuyển 0,8s có nảy nhẹ.
- **Loader chasen:** phương án A trong `matcha-effects.html` (vòng 0,8s, quẹt 0,3s, bọt nổi).

## 5. Mascot Matcappa

Nguồn hình: `matcappa-smiski-v3.html`. Quy định: tài liệu v2 mục 3.3. Bổ sung:

- **Một component dùng chung** `<Matcappa pose propeller size onClick />`.
  - `pose`: `stand` | `hug-knees` | `hug-vinyl` | `doze`
  - `propeller`: `spin` | `still` | `droop`
- **Chong chóng `spin`:** hiện thành một đĩa elip mờ có vệt chạy vòng, không thấy cánh. Khi giảm chuyển động thì vẫn là đĩa elip nhưng đứng yên.
- **`MascotSpeech`:** bong bóng rộng tối đa 360px, không nút, không hiệu ứng gõ, tự tắt sau ~2,6 giây, `aria-live="polite"`. Mỗi lần kích hoạt chọn câu khác câu vừa nói.
- **Giọng thoại:** mascot xưng "mình", gọi "bạn", câu ngắn, kết bằng "~" thay cho dấu chấm than. Câu trên landing lấy từ bản mẫu; câu ở trạng thái trống và 404 viết thêm theo cùng giọng (tài liệu v2 mục 6.3, 6.9).
- **Gắn với trình phát** (ngoài landing): chưa phát → `stand/still`; đang phát → `hug-vinyl/spin`; tạm dừng → `doze/droop` kèm chữ "z"; hàng chờ trống → `hug-knees/still`.

## 6. Định tuyến

Theo tài liệu v2 mục 5.1. Bổ sung cách làm:

- `/library`, `/playlist/:id`, `/search` là **lớp phủ**. Khi mở từ trong app thì truyền `state.background = location`, rồi render `<Routes location={background}>` cho trang nền và một `<Routes>` thứ hai cho lớp phủ. Khi mở thẳng link (không có `background`), trang nền mặc định là `/listen`.
- Nút Back của trình duyệt đóng lớp phủ. Esc và ✕ cũng đóng (gọi `navigate(-1)` nếu đến từ trong app, ngược lại `navigate('/listen')`).
- Chưa đăng nhập mà vào trang cần đăng nhập: chuyển tới `/login`, lưu `state.from`; đăng nhập xong quay lại đúng chỗ. Đây là ca quan trọng vì `shareUrl` của backend trỏ về `/playlist/:id`.
- Đã đăng nhập mà vào `/login` hoặc `/register`: chuyển về `/listen` (bỏ độ trễ 800ms của v1 nếu không còn lý do).
- `/dev/ui` chỉ có khi `import.meta.env.DEV`.
- Landing tải bằng `React.lazy` và không kéo theo code trình phát. `MusicPlayer` hiện mount ở `main.jsx`, nên phải xem lại để landing không tải `react-player` (xem mục 12).

## 7. Các màn hình

Mỗi màn: **bản mẫu là nguồn đúng cho hình**, tài liệu v2 mục 6 là nguồn đúng cho nội dung. Dưới đây chỉ ghi chỗ khác hoặc thêm.

### 7.1 Landing `/`
Bản mẫu `landing-mascot.html`. Tài liệu v2 mục 6.1. Không có gì khác.

### 7.2 Đăng nhập / Đăng ký `/login`, `/register`
Bản mẫu `auth.html`. Hai route, một component; tab đổi URL. Dùng `login` / `register` của `AuthContext`. Kiểm tra ở client trước khi gửi (FR-01): tên 3–30 ký tự `[A-Za-z0-9_.]`, mật khẩu ≥ 6, nhập lại khớp. Lỗi từ server ánh xạ về câu thân thiện, hiện dưới ô liên quan. Ảnh đại diện lúc đăng ký: jpg/png/gif ≤ 2MB, xem trước. Upload dùng `axiosUpload` có sẵn, sau khi đăng ký thành công.

### 7.3 Now Playing `/listen`
Bản mẫu `visual-direction-v3.html` cho **trung tâm, dock, header, rail**. Hai khối điều khiển 3D hai bên đĩa trong bản mẫu này **đã bị bỏ**; thay bằng **thanh kính phải phương án C** (`controls-options.html`):
- Thanh dọc mảnh ở mép phải, đối xứng với rail: Shuffle (nền trắng mờ + chữ matcha-4 khi bật), Hàng chờ, vạch ngăn, icon loa (đổi theo mức: tắt / < 50 / ≥ 50; bấm để tắt tiếng), thanh âm lượng dọc, số %.
- **Luôn hiện** (đã chốt), không ẩn theo idle.
- Thanh âm lượng: kéo bằng chuột/chạm, ↑/↓ mỗi lần 5%, `role="slider"`. Gọi `setVolume`; tắt tiếng gọi `toggleMute`. Lưu mức âm lượng giữa các lần mở.

**Header + rail:** ẩn mặc định; chuột di chuyển, chạm màn hình hoặc focus bàn phím thì trượt vào; đứng yên 2,5 giây thì ẩn, trừ khi chuột đang nằm trên thanh hoặc focus đang ở bên trong. Rail gồm Trang chủ (`/listen`), Thư viện, Bài đã thích. Nút "+" trong bản mẫu bỏ, vì tạo playlist nằm trong Thư viện.

**Trung tâm:** dòng nhỏ viết hoa `TÊN PLAYLIST · vị trí/tổng` (thêm `· Shuffle` khi bật); tên bài (marquee có sẵn khi tràn); nghệ sĩ; đĩa + cần đọc; thanh tiến trình tua được (`role="slider"`, ←/→ 5 giây) và thời gian. Đổi bài: chữ và nhãn đĩa mờ đi rồi hiện lại (~220ms).

**Dock:** nút ‹ ›, băng chuyền 5 bìa vuông có phối cảnh. Bìa giữa là bài đang phát, viền matcha-4, phóng 1,12 lần, có nút ▶/❚❚. Bìa bên trái là bài đã phát (giảm bão hoà), bên phải là bài sắp tới. Hai đầu dock mờ dần (mask). Bấm bìa khác thì `playAt`. Nút ‹ dùng FR-11 (đã chạy > 3 giây thì về đầu bài).

**Vị trí và thứ tự hiển thị** lấy từ selector có sẵn (`queue`, `order`, `position`). Dock và "Tiếp theo" phải theo `order` hiện hành, tức là theo thứ tự đã xáo khi shuffle bật.

**Trạng thái trống:** đĩa trống quay chậm, Matcappa `hug-knees` nói câu hướng dẫn, nút "Mở thư viện".

### 7.4 Lớp phủ hàng chờ (mở bằng nút trên thanh kính hoặc phím Q)
Bản mẫu `queue-overlay.html` (đã duyệt hoàn chỉnh). Tài liệu v2 mục 6.4. Bổ sung:
- Lớp phủ tối (mục 4.1). Mở: nền tối dần, **chỉ bìa đang phát** rời dock bay lên thành bìa lớn (0,65s; dùng `layoutId` của framer-motion), đĩa đen trượt ra sau bìa, rồi danh sách hiện lần lượt. Đóng: ngược lại.
- Có thể là trạng thái trong Redux (`showQueue` / `toggleQueue` có sẵn), không cần route riêng.
- Tab "Tiếp theo" (mặc định) / "Đã phát", gạch chân trượt. Chỉ dòng ở "Tiếp theo" kéo được (tay nắm ⋮⋮ thay số thứ tự); kéo không bôi đen chữ.
- Logic kéo thả, `reorderUpNext`, `playAt` lấy lại từ `src/components/SongQueue/QueueContainer.jsx`. Phần kéo giãn panel không còn dùng.
- Dưới thanh tiến trình của bìa lớn: Shuffle, Lặp (tắt → tất cả → một bài, `cycleRepeat`). Lặp tất cả thì cuối danh sách có mục "Sau đó phát lại từ đầu".
- Mở thì giữ focus trong lớp phủ; đóng thì trả focus về nút Hàng chờ.

### 7.5 Thư viện `/library` (đã chốt: A · Xoè bìa)
Bản mẫu `playlists-options.html` phần **A**, với 2 thay đổi đã chốt:
1. **Bỏ hiệu ứng đĩa than trượt ra** khỏi bìa.
2. **Không có ô tìm, không sắp xếp.** Thứ tự cố định: playlist đang phát trước, rồi mới nhất trước.

Lớp phủ tối, tập trung 1 playlist ở giữa, các bìa khác xoè hai bên. Lướt bằng ‹ ›, ←/→, lăn chuột trên dải bìa, hoặc bấm bìa bên cạnh. Dưới bìa giữa: tên, số bài · tổng thời lượng, nút Phát, Mở (→ `/playlist/:id`), ⋯ (đổi tên / xoá, xoá có `useConfirm`). Bìa cuối là "Tạo playlist": bấm thì hiện ô nhập tên (1–60 ký tự) ngay tại chỗ. Nhãn "Đang phát" cho playlist đang phát. **Bìa playlist là ảnh** (đã chốt, khác bản mẫu A vốn dùng màu trơn): giữ cách backend đang làm, gán ngẫu nhiên một ảnh từ thư mục ảnh bìa lúc tạo, cố định từ đó. Thư viện, chi tiết playlist (bìa, nhãn đĩa, nền mờ) đều dùng ảnh này. Không đổi schema.

### 7.6 Chi tiết playlist `/playlist/:id`
Bản mẫu `playlist-detail-grid.html`. Tài liệu v2 mục 6.6. Bổ sung:
- Đây là lớp phủ **sáng** (kính), khác với hàng chờ và thư viện.
- Nút trên thẻ (▶, ✕, ⋮⋮) hiện khi rê chuột **và** khi thẻ có focus, để dùng được bằng Tab. Trên màn cảm ứng thì luôn hiện ▶ và ⋯.
- Playlist trống: đĩa trống + Matcappa `hug-knees` + lời mời; nút Phát / Shuffle bị khoá.
- Gỡ bài: ẩn ngay, toast có Hoàn tác 5 giây, hết 5 giây mới gọi API.
- **Thêm bài (đã chốt: A, theo bản mẫu):** mỗi lần **một link**. Dán link → app tự điền tên bài và kênh (sửa được) → chọn 1 trong 4 khung hình làm bìa → xem trước ngay trên bìa và nhãn đĩa → Thêm. FR-32 và TC-03 (nhiều link) được thay bằng luồng này.
  - **Xem trước** lấy ở client, không gọi backend và không tốn quota YouTube (tui chọn): tên + kênh từ oEmbed `https://www.youtube.com/oembed?url=…&format=json`; 4 khung hình là `https://i.ytimg.com/vi/<id>/{hqdefault,1,2,3}.jpg`. Link hỏng hoặc video không nhúng được thì báo ngay dưới ô dán. Bài đã có trong playlist thì báo "Bài này có trong chồng đĩa rồi ~" và khoá nút Thêm.
  - **Lưu** bằng API thêm bài của playlist (`POST /api/playlist/:id/add-song`, **không** dùng `/songs/info`). Backend được mở rộng để nhận thêm `name`, `artist`, `thumbnail` tuỳ chọn.
  - **Chỗ lưu (đã chốt: riêng cho từng playlist):** `CustomSong` giữ nguyên là bản gốc dùng chung (khoá theo mã video, dữ liệu từ YouTube). `CustomPlaylist.videos` đổi từ mảng mã video thành mảng `{ id, name?, artist?, thumbnail? }`; trường trống thì lấy theo `CustomSong`. API trả danh sách bài của playlist phải trộn sẵn hai lớp này. Script chuyển dữ liệu cũ (B1) đổi chuỗi `"abc"` thành `{ id: "abc" }`. Tui đề xuất thêm: sửa tên/bìa của bài đã có trong playlist bằng chính hộp này (mở từ nút ⋯ trên thẻ), lưu qua `PATCH /api/playlists/:id` (B5). Frontend sửa đường dẫn đang sai (`/api/playlists/:id/add-song/` → đúng route backend).

### 7.7 Tìm kiếm `/search`
Chưa có bản mẫu riêng. Dùng lớp phủ kính sáng, ô tìm lớn ở trên, danh sách kết quả dạng dòng (ảnh 16:9 nhỏ, tên, kênh, thời lượng, 3 nút). Hành vi theo tài liệu v2 mục 6.7. Backend đã có `GET /search` và `/history` (GET, POST, DELETE, DELETE `/:query`). "Thêm vào hàng chờ" và "Phát tiếp theo" cần reducer mới (T45).

**"Phát ngay" một bài lẻ (đã chốt, áp cho tìm kiếm và Bài đã thích):** không gọi `playContext`, mà chèn bài ngay sau bài đang phát rồi nhảy tới nó (reducer mới `playNow`, đúng cả khi shuffle bật, có test). Phát xong thì tiếp tục chồng đĩa cũ. Dòng trên đĩa và nhãn "Đang phát" trong Thư viện giữ playlist cũ. Nếu hàng chờ đang trống thì hàng chờ chỉ có bài đó, dòng trên đĩa hiện "Tìm kiếm" hoặc "Bài đã thích". Bài đã có trong hàng chờ thì nhảy tới bản đã có, không chèn trùng.

### 7.8 Bài đã thích `/liked`
Dùng lại màn chi tiết playlist ở chế độ không đổi tên / không xoá. Cần API liked ở backend (B5).

### 7.9 404
Matcappa `hug-knees`: "Ơ, bàn này chưa có ai đặt…", nút "Về quán" → `/`.

## 8. Nối với code hiện có

| Cần | Dùng |
|---|---|
| Trạng thái trình phát | selector trong `src/app/selectors` (`getCurrentSong`, `getIsPlaying`, `getIsShowQueue`…) |
| Điều khiển | action có sẵn: `playContext`, `togglePlay`, `next`, `previous`, `playAt`, `reorderUpNext`, `toggleShuffle`, `cycleRepeat`, `setVolume`, `toggleMute`, `toggleQueue` |
| Playlist | `playlistService` + `playlistSlice` (không chuyển sang RTK Query ở v2) |
| Đăng nhập | `AuthContext` (`login`, `register`, `logout`, `user`, `token`) |
| Toast, xác nhận | `ToastContext` / `useToast`, `useConfirm` |
| Debounce, lưu cục bộ | `useDebounce`, `useLocalStorage` |
| Marquee | `src/utils/marquee.js` + `Marquee.jsx` |

**Thời gian phát, tua và FR-11 (tui chọn).** Hiện `MusicPlayer.jsx` vừa chạy `ReactPlayer` vừa vẽ thanh ngang v1, và tự giữ `currentTime`, `duration`, `playerRef.seekTo`, luật 3 giây của "Bài trước". `MusicPlayer` thuộc `src/components` nên nằm trong phần làm lại. Cách làm: tách thành **bộ máy phát ẩn** (chỉ `ReactPlayer` + các sự kiện dispatch như hiện tại) và một **context mới** `PlaybackTimeContext` cung cấp `currentTime`, `duration`, `seek(s)`, `previous()` (có luật 3 giây). Thanh tiến trình giữa, nút ‹ ở dock, bìa lớn trong hàng chờ, phím tắt và Media Session đều đọc từ context này. Đây là thêm file mới, không sửa context cũ. Thời gian vẫn không đưa vào Redux.

**Lệch giữa frontend và backend đã thấy** (sửa ở B5 hoặc khi chạm tới):
- `playlistService.addSong` gọi `/api/playlists/:id/add-song/`, còn backend là `/playlist/:id/add-song` (số ít).
- `playlistService.update` gọi `PUT /api/playlists/:id`, nhưng backend chưa có route này.
- `GET /api/songs` phụ thuộc `playlistId`.
- `axiosClient` đã có interceptor phản hồi; interceptor gắn token đang bị comment, và token hiện được truyền tay. T30 sẽ gom lại.

## 9. Responsive

| Mốc | Now Playing | Lớp phủ |
|---|---|---|
| ≥ 1024 | Như bản mẫu | Như bản mẫu |
| 768–1023 | Đĩa nhỏ lại; thanh kính phải giữ nguyên | Lưới playlist 3 cột |
| < 768 | Đĩa chiếm bề ngang; dock 3 bìa; rail gộp vào header thành một hàng nút; thanh kính phải thu thành một hàng nút ngang ngay trên dock (Shuffle, Hàng chờ, loa; bấm loa bung thanh âm lượng) | Toàn màn hình; lưới 2 cột; Thư viện xoè bìa vuốt ngang |

Bố cục dưới 768px do tui đề xuất, **bạn đã chấp nhận (22/10)** mà không cần bản mẫu; chỉnh tiếp ở GĐ6 khi xem trên máy thật. Lưới playlist 768–1023px: 3 cột (tui chọn).

## 10. Truy cập

- Mọi nút chỉ có icon đều có `aria-label` tiếng Việt; nút bật/tắt có `aria-pressed`.
- Thanh trượt (tiến trình, âm lượng) có `role="slider"` và đủ `aria-value*`.
- Viền focus rõ ràng trên cả nền kính lẫn nền tối.
- Lớp phủ giữ focus bên trong, Esc để đóng, trả focus về nút đã mở.
- Tương phản chữ ≥ 4.5:1. Chữ trên kính dùng `ink`, không dùng `ink-soft` cho cỡ nhỏ hơn 14px.

## 11. Kiểm tra

- Mỗi việc: `npm test`, `npm run build`, mở bằng `npm run dev` (preview), không lỗi console, thử phát / dừng / chuyển bài.
- Reducer mới và hàm thuần mới (`pickLine`, `parseYouTubeLinks`) có file `*.test.js` chạy bằng `node`.
- Testcase TC-01 → TC-08 của tài liệu v2 mục 13 ở các điểm dừng tương ứng (`tasks/todo.md`).

## 12. Để builder tự quyết

- Tên file và cách chia component trong `features/*`, miễn là mỗi file dưới khoảng 200 dòng.
- Quy đổi số đo `cqw` sang `clamp()` / `rem`.
- Cách đo vị trí để làm hiệu ứng bìa bay (`layoutId` hay tự tính `getBoundingClientRect`).
- Cách tránh tải `react-player` ở landing (dời `MusicPlayer` vào layout của route cần đăng nhập, hoặc lazy-load bên trong `MusicPlayer`), miễn là nhạc không ngắt khi đổi giữa các route trong app.
- Câu thoại mascot ngoài landing (đúng giọng ở mục 5).
- Icon: dùng `lucide-react` khi có icon tương đương, còn icon riêng của bản mẫu thì giữ SVG gốc.

## 13. Nhật ký quyết định

**Bạn đã chốt (21–22/10)**
| # | Việc | Chốt |
|---|---|---|
| 1 | Thanh kính phải | Luôn hiện |
| 2 | Thư viện | A · Xoè bìa, bỏ đĩa trượt ra, không tìm / sắp xếp |
| 3 | Nhánh | `v2/main` + `v2/<tên>`; merge vào `main` lúc phát hành |
| 4 | Thứ tự | GĐ5 Now Playing trước GĐ4 Thư viện |
| 5 | Thêm bài | A theo bản mẫu: một link, sửa tên, chọn 1/4 khung hình; lưu qua add-song của playlist; được sửa backend |
| 6 | Chỗ lưu tên / bìa đã sửa | Riêng cho từng playlist (`videos` thành mảng object) |
| 7 | Bìa playlist | Ảnh do backend gán lúc tạo, cố định |
| 8 | "Phát ngay" bài lẻ | Chèn sau bài đang phát rồi nhảy tới |
| 9 | Điện thoại < 768px | Chấp nhận đề xuất ở mục 9, không cần bản mẫu |

**Tui tự quyết (bạn xem lại khi đọc)**
- Không chuyển sang RTK Query; giữ `services/api` + `playlistSlice`.
- Test giữ kiểu `node` + `node:assert`, thêm `npm test`.
- Tách `MusicPlayer` thành bộ phát ẩn + `PlaybackTimeContext` mới (mục 8).
- Xem trước bài thêm mới lấy ở client (oEmbed + ảnh `i.ytimg.com`), không tốn quota.
- `playNow` khi hàng chờ trống / bài đã có trong hàng chờ (mục 7.7).
- Sửa tên / bìa bài đã có trong playlist qua nút ⋯ trên thẻ (mục 7.6).
- Bỏ nút "+" trên rail (tạo playlist nằm trong Thư viện).
- Lưới bài 3 cột ở 768–1023px.

**Còn để sau**
- Bảng màu chế độ tối: bản mẫu ở T10, bạn chọn.
- FR-37 chia sẻ công khai: dời v2.1.
