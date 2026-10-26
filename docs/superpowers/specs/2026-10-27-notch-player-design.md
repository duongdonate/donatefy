# Notch trình phát — thay Music Layer (thiết kế)

## Ý định

Music Layer (thanh kính dính đáy ở Thư viện / playlist) chiếm đáy màn và lệch phong cách với notch mới. Người dùng muốn **bỏ hẳn Music Layer**, dồn việc điều khiển nhạc lên **notch** (khối tối dính mép trên, đã có hiệu ứng giọt chất lỏng — mẫu D trong `.superpowers/brainstorm/notch-demo.html`). Mẫu tham khảo người dùng gửi: notch mở rộng kiểu "Dynamic Island" trên macOS (bìa trái; tên bài, ca sĩ, thanh tiến trình, 3 nút bên phải).

## Mục tiêu

1. Xoá Music Layer và mọi phần đệm đáy dành cho nó.
2. Notch mở có **nhiều thẻ**: thẻ "đang phát" (khi có bài) và thẻ "tài khoản" (đã có). Đáy notch có **hàng chấm** để chuyển thẻ.
3. Nút "Đang phát" (đi `/listen`) trên hàng icon đổi hình khi có nhạc.
4. Điện thoại có thẻ nhạc mỏng luôn hiện.

## Không làm / tránh

- Không có lời bài hát (app chưa có dữ liệu).
- Không có vạch sóng nhạc ở viên thu gọn.
- Không đổi hiệu ứng giọt chất lỏng vừa chốt; thẻ mới phải nằm trong cùng cơ chế (lớp nền goo + lớp nội dung).
- Không đụng `/listen` (Now Playing, Dock, Hàng chờ) ngoài việc notch ở đó không có thẻ "đang phát".
- Không rải `md:`/`xl:`; theo quy ước `DeviceContext` + `switch (device)` + bảng số liệu theo thiết bị (memory `feedback-device-switch`).

## Hành vi đã chốt (người dùng quyết)

### Hàng icon (viên thu gọn) — mọi thiết bị

- Giữ hàng icon hiện tại: Đang phát, Thư viện | theme, avatar.
- Nút **Đang phát**: có bài → thay icon `Disc3` (lucide) bằng **đĩa than nhỏ của app** (`Vinyl`, nhãn giữa là bìa bài), **xoay khi đang phát, đứng yên khi dừng**. Chưa có bài → icon `Disc3` như cũ. Bấm vẫn đi `/listen`.

### Tablet / máy tính

- **Rê chuột** vào notch → mở, vào **thẻ "đang phát"** nếu có bài; không có bài thì như hiện nay (thẻ tài khoản).
- **Bấm avatar** → mở thẳng **thẻ tài khoản**.
- Thẻ "đang phát" (theo ảnh mẫu): bìa vuông bo góc bên trái; bên phải là tên bài (một dòng, Marquee), ca sĩ, thanh tiến trình + hai mốc giờ (đã nghe / tổng), hàng 3 nút ‹‹ ▶/❚❚ ››.
- **Hàng chấm** ở đáy notch khi có từ 2 thẻ trở lên: chấm đang chọn là viên dài màu matcha, chấm khác tròn xám — giống bộ chấm bước ở trang landing (`LandingPage.jsx`, nhưng **nằm ngang**). Bấm chấm hoặc **lướt ngang** để chuyển thẻ. Chỉ 1 thẻ thì không hiện hàng chấm.

### Điện thoại

- Khi có bài (và không ở `/listen`): notch **mặc định mở sẵn thẻ nhạc mỏng**, cao xấp xỉ viên thu gọn, nối liền dưới hàng icon. Bên trái: tên bài (Marquee) + ca sĩ nhỏ; bên phải: 3 nút ‹‹ ▶/❚❚ ››. Không bìa, không thanh tiến trình (theo ảnh mẫu người dùng gửi).
- **Notch trên điện thoại luôn hiện** (không tự ẩn khi đứng yên). Vẫn ẩn khi đang gõ phím (`useTyping`) như hiện nay.
- Bấm avatar → đổi sang thẻ tài khoản; hàng chấm để quay lại thẻ nhạc.

### `/listen`

- Notch chỉ có thẻ tài khoản (trang đã là trình phát), không hàng chấm.

## Quyết định của người viết (người dùng chưa xét, có thể sửa)

- **Điện thoại:** thẻ nhạc mỏng là một phần của **trạng thái thu gọn** (viên cao lên khi có bài), không phải "đang mở". Notch không tự ẩn khi đứng yên. Bấm avatar thì mở thẻ tài khoản. Esc, bấm ra ngoài, hoặc chọn chấm đầu thì quay về thẻ nhạc mỏng. Hiệu ứng giọt rơi chạy từ chiều cao mới đó.
- **Trạng thái:** `AppShell` vẫn giữ `open` (boolean) để `useIdle` giữ notch. `Notch` giữ thẻ đang chọn (`"nowPlaying"` | `"account"`). Mỗi lần mở thì chọn lại thẻ theo cách mở: rê chuột ra "đang phát" nếu có bài, bấm avatar ra tài khoản. Không nhớ thẻ cũ.
- **Rê chuột khi đã mở bằng bấm** (tablet/máy tính): giữ nguyên thẻ đang hiện. Mở bằng bấm thì rời chuột không đóng, như hiện nay.
- **Hết bài / hàng chờ rỗng / vào `/listen` khi đang ở thẻ "đang phát":** thẻ đó biến mất. Nếu notch đang mở thì chuyển sang thẻ tài khoản; nếu mở bằng rê chuột thì đóng.
- **Bề ngang:** dùng một bề ngang chung cho mọi thẻ (lấy thẻ rộng nhất), để giọt nền không phải đổi ngang khi chuyển thẻ.
- **Bài không có bìa:** dùng `Vinyl` làm hình thay.
- **Đang gõ phím trên điện thoại:** cả notch (kể cả thẻ nhạc mỏng) ẩn như hiện nay.

## Ràng buộc kỹ thuật

- React 19 + Vite + Tailwind + framer-motion; trạng thái phát lấy từ Redux (`getCurrentSong`, `getIsPlaying`…) và `usePlaybackTime()` (`currentTime, duration, seek, previous, next, togglePlay`). Dùng lại `Marquee`, `Vinyl`, `ProgressBar` (đã dễ kéo, có phím), `IconButton`.
- Notch hiện tại: `src/layouts/Notch.jsx` (bảng `NOTCH` theo thiết bị, lớp goo + lớp nội dung, thẻ luôn trong DOM và `inert` khi ẩn để giọt nền biết chiều cao). `AppShell.jsx` giữ trạng thái `notchOpen`, tự ẩn bằng `useIdle`, đệm `pb-28` cho Music Layer.
- Xoá: `src/features/player/MusicLayer/*`, chỗ gắn trong `AppRouter.jsx`, `pb-28` trong `AppShell`, `LibraryPage`, `PlaylistPage` (đổi sang đệm vừa đủ cho chỗ của notch nếu cần).
- Có logic thuần mới (chọn thẻ mặc định theo thiết bị / có bài / trang; chuyển thẻ khi lướt) → tách hàm thuần + test node như `playerMath.test.js`.
- Commit có `Co-Authored-By` (giữ như GĐ responsive); góp ý sau giai đoạn thì sửa rồi gộp commit một lượt.

## Để người làm tự quyết

- Kích thước cụ thể từng thẻ, cỡ bìa, cỡ đĩa nhỏ trên hàng icon, bề ngang notch mở trên tablet/máy tính (hiện 400/420px, có thể nới cho thẻ đang phát).
- Hiệu ứng chuyển giữa hai thẻ (trượt ngang theo hướng lướt là gợi ý).
- Ngưỡng lướt ngang (có `swipeDir` ở `features/landing/stepper.js` để dùng lại).
- Bấm vào tên bài trên thẻ nhạc có đi `/listen` không (gợi ý: có).
