# Giai đoạn responsive (GĐ7) · Notch điều hướng, dock gộp, 3 cỡ máy: thiết kế

Ngày: 2026-10-26 · Nối tiếp giai đoạn refactor (`v2/main` `d4d83da`) và spec tổng `2026-10-21-ui-rebuild-design.md` mục 9 (Responsive). Bản mẫu bố cục đã chọn: `.superpowers/brainstorm/1346-1793020132/content/desktop-layouts.html` (hướng **C + D + F**).

## Vì sao

Bản thiết kế gốc hợp với cỡ tablet (~1024px). Đo thực tế ngày 2026-10-26:

- **Desktop (1440–1920px):** mọi thứ bám mép màn hình, đĩa nhỏ giữa khoảng trống lớn và lệch phải (tâm đĩa 919px trên màn 1440). Header đè lên tên bài. Thanh âm lượng dọc ở thanh kính phải quá ngắn, khi zoom trình duyệt lớn (màn thấp) thì bị cắt mất.
- **Mobile (375px):** chưa có bố cục riêng. Rail vẫn đứng dọc bên trái, logo header xuống dòng. Khối tiêu đề trang playlist tràn phải ~100px. Ở `/listen` thanh kính phải đè đĩa. Hàng chờ chia hai cột bị bóp, tab "Đã phát" tràn ra ngoài.
- **Nhập liệu trên mobile:** ô nhập 15px (iPhone tự phóng to trang khi chạm). Khung dùng `h-screen` nên bàn phím hiện lên là che mất ô đang gõ và nút gửi.

## Ba cỡ máy

| Cỡ | Bề ngang | Ghi chú |
|---|---|---|
| Mobile | < 768px | Bố cục riêng, gọn nhất |
| Tablet | 768–1279px | Giữ gần như bản mẫu gốc |
| Desktop | ≥ 1280px | Căn theo khung giữa, `/listen` tận dụng tối đa khoảng trống |

Mốc 1280 là **tui chọn** (bản mẫu gốc nhìn đúng ở 1024, lệch từ 1440).

**Cách viết code (người dùng chốt):** một `DeviceContext` nhận biết thiết bị, trả enum `DEVICE.MOBILE | TABLET | DESKTOP`. Component lấy bằng `useDevice()` và chia bố cục theo thiết bị bằng `switch`, mỗi nhánh một thiết bị, nhánh dài tách component con. Ưu tiên dễ đọc, dễ kiểm soát hơn code ngắn. Không rải `md:`/`xl:` trong JSX.

## Đợt này làm gì (người dùng chốt)

Chia hai đợt. **Đợt này (GĐ7)** làm:

1. **Notch điều hướng thay header + rail** (hướng C, phần điều hướng).
2. **Khung giữa cho màn rộng** (hướng D).
3. **Bỏ thanh kính phải, dồn vào dock** (hướng F).
4. **Thanh tiến trình `/listen` dễ thao tác.**
5. **Bố cục 3 cỡ máy cho mọi trang trong app, có hàng chờ.**
6. **Nhập liệu trên mobile** (chỉ ở trang/hộp có ô nhập).
7. **Bỏ bớt phần tử trên mobile** theo danh sách dưới.

**Đợt sau (notch đầy đủ):** notch thêm bài đang phát, bấm thì nở thành bộ điều khiển; bỏ hẳn Music Layer ở đáy. Đợt này **không** làm phần đó. Music Layer tạm giữ, chỉ sửa cho khỏi tràn trên mobile.

## 1. Notch điều hướng

**Mẫu tham khảo (người dùng gửi 2026-10-26):** notch của một app desktop người dùng đang dùng: khối **đen đặc dính sát mép trên màn hình**, chỉ bo hai góc dưới (kiểu tai thỏ macOS). Thu gọn thì là một viên nhỏ. Khi mở, khối nở xuống:
- hàng trên là các nút tab nhỏ (bên trái) và chỉ báo, cài đặt (bên phải);
- bên dưới là các thẻ bo góc tối hơn: thẻ trái có mascot, dòng trạng thái và lối tắt; thẻ phải là lưới nút.

Notch Donatefy làm theo dáng đó, nhưng dùng màu tối của quán (mực `#0b0f08`–`rgba(10,14,8,.92)`), chữ `#eef3e6`. Không dùng kính trong suốt, để nổi trên mọi nền (tui chọn theo mẫu).

- Nằm **giữa, dính mép trên** màn hình, ở mọi cỡ máy, trên mọi trang dùng `AppShell` (`/listen`, `/playlists`, `/playlists/:id`). Trang đầu (`/`), đăng nhập, đăng ký, 404 không có notch (như hiện tại không có header/rail).
- **Thu gọn** (mặc định): một hàng icon, trái sang phải: **Trang chủ** (`/listen`), **Thư viện** (`/playlists`) | **Theme** (sáng/tối), **Avatar** (tròn, nhỏ). Nút của trang hiện tại có trạng thái đang chọn (nền sáng mờ như tab "home" trong mẫu).
- **Mở rộng**: bấm avatar (hoặc rê chuột vào notch trên desktop) thì notch nở xuống, có hiệu ứng giãn mượt. Hàng icon giữ ở trên. Bên dưới là **một thẻ tài khoản** (thẻ tối bo góc như thẻ mascot trong mẫu): avatar lớn, tên hiển thị, tên đăng nhập, nút **Đăng xuất**. Chừa chỗ cho thẻ "bài đang phát" của đợt sau, nhưng đợt này chưa làm.
- Đóng phần mở rộng: bấm ra ngoài, Esc, rời chuột (desktop) hoặc bấm lại avatar. Avatar dùng `components/Avatar.jsx` sẵn có (ảnh Google `http…`, ảnh upload, ảnh mặc định).
- Mobile: notch rộng tối đa bề ngang trừ 16px mỗi bên; mở rộng chỉ bằng bấm (không có rê chuột).
- **Bỏ** logo và chữ "Matcha Cha-Cha-Cha" (người dùng chốt).
- Giữ cách **tự ẩn khi đứng yên** của header/rail hiện tại (`useIdle(2500)`, giữ khi rê chuột hoặc focus bàn phím bên trong): notch trượt lên ẩn đi. Trên mobile không có rê chuột: chạm vào màn là hiện lại (`useIdle` đã nghe pointer). *(tui chọn: giữ hành vi cũ)*
- Nút trong notch tối thiểu 40×40px; trên mobile 44×44px.
- Thay thế: xoá `layouts/Header.jsx`, `layouts/Rail.jsx`; tạo `layouts/Notch.jsx`. `AppShell` bỏ prop `right` (hết thanh kính phải).

## 2. Khung giữa (desktop)

- Nội dung trang, notch, dock và Music Layer căn theo một khung giữa thay vì mép màn hình.
- `/playlists`, `/playlists/:id`: khung tối đa **1280px**, căn giữa, lề hai bên tối thiểu 24px.
- `/listen`: khung tối đa **1600px** (rộng hơn để tận dụng khoảng trống, người dùng muốn "tận dụng khoảng trống nhiều nhất").
- Tablet và mobile: khung chính là màn hình (lề 16px mobile, 24px tablet).

## 3. Dock gộp (bỏ thanh kính phải)

Xoá `GlassBar` khỏi `/listen`. Dock (`features/player/Dock.jsx`) chứa đủ:

| Vị trí | Desktop / Tablet | Mobile |
|---|---|---|
| Trái | Shuffle, Hàng chờ | Shuffle, Hàng chờ |
| Giữa | ‹, dải bìa (bìa đang phát + bìa trước/sau), › | ‹, **chỉ bìa đang phát**, › |
| Phải | Loa + **thanh âm lượng ngang** (dài ~120px) + phần trăm | Nút loa; bấm thì bung thanh âm lượng ngang nổi ngay trên dock |

- Thanh âm lượng nằm ngang nên không còn bị cắt khi màn thấp hoặc zoom lớn.
- Âm lượng vẫn lưu như hiện tại (`VOLUME_KEY`, `parseSavedVolume`).
- `VolumeSlider` đổi sang dạng ngang (hoặc thêm hướng ngang); bỏ dạng dọc nếu không còn chỗ dùng.

## 4. Thanh tiến trình `/listen`

- Nằm **ngay trên dock**, dài **bằng bề ngang dock** (không còn chỉ rộng bằng đĩa).
- Vùng bấm cao **≥ 44px**; thanh hiển thị 6px, phình lên 10px khi rê chuột/chạm/kéo.
- **Núm tròn** ở đầu phần đã chạy: hiện khi rê/kéo (desktop), luôn hiện (mobile).
- Khi rê hoặc kéo: **bóng giờ** nổi trên con trỏ/ngón tay (vd. `2:41`).
- Bấm thẳng vào đâu thì nhảy tới đó; kéo thì tua theo ngón tay, chỉ gọi tua (seek) khi thả tay. *(tui chọn: tránh tua liên tục làm YouTube giật)*
- Bàn phím (khi focus): ←/→ tua 5 giây, Home/End về đầu/cuối. Giữ `role="slider"` và các `aria-*` hiện có.
- Hai mốc giờ (đã chạy / tổng) ở hai đầu thanh.

## 5. Bố cục từng trang

### `/listen` (Now Playing)

- **Desktop:** tên bài (chữ lớn, tối đa 2 dòng, không bị notch che: chừa đỉnh đủ cho notch), ca sĩ, đĩa + cần đĩa, thanh tiến trình, dock. **Đĩa lớn theo chiều cao còn lại** sau khi trừ notch, tên bài, thanh tiến trình, dock; đồng thời không quá ~45% bề ngang khung. Đĩa căn giữa khung (hết lệch phải). Mascot đứng cạnh đĩa như hiện tại.
- **Tablet:** như hiện tại, thay header/rail bằng notch, bỏ thanh kính phải.
- **Mobile:** đĩa chiếm bề ngang (trừ lề), tên bài 1 dòng chạy chữ (Marquee sẵn có), không mascot, dock rút gọn như mục 3.

### Hàng chờ (`features/queue/QueueOverlay.jsx`)

- **Desktop/Tablet:** giữ bố cục hai cột hiện tại (bài đang phát bên trái, danh sách bên phải), đặt trong khung giữa.
- **Mobile:** **toàn màn hình, một cột**: hàng đầu "Hàng chờ" + nút đóng; một hàng gọn bài đang phát (bìa nhỏ, tên, nút phát/dừng); hai tab "Tiếp theo" / "Đã phát" vừa bề ngang; danh sách cuộn. Kéo đổi thứ tự **chỉ bằng tay nắm** ở đầu hàng (để cuộn bằng ngón tay không bị nhầm thành kéo). Hàng cao ≥ 56px.
- Chữ chìm "QUEUE" ẩn trên mobile.

### Thư viện (`/playlists`)

- Desktop/Tablet: giữ dải bìa xoè hiện tại, trong khung giữa.
- Mobile: dải bìa vuốt ngang (như spec tổng mục 9), tiêu đề "Playlist của bạn" và số playlist trên một hàng không xuống dòng lộn xộn, nút Phát / Mở / ⋯ vừa bề ngang. Ẩn chữ chìm "PLAYLISTS".
- Ô "Tên playlist mới": xem mục 6.

### Playlist (`/playlists/:id`)

- Desktop: như hiện tại, trong khung 1280px, lưới bài 4 cột.
- Tablet: lưới 3 cột (spec tổng).
- Mobile: khối tiêu đề xếp dọc (bìa, tên, số bài · thời lượng, hàng nút Phát / Trộn bài / Thêm bài tự xuống dòng, không tràn). Lưới bài 2 cột.

### Music Layer (tạm giữ tới đợt notch)

- Desktop/Tablet: như hiện tại, căn theo khung giữa.
- Mobile: chỉ bìa, tên bài (chạy chữ), ‹ ▶ › và nút mở Now Playing; ẩn các nút phụ (`AdditionalControls`). Không tràn ngang.

### Đăng nhập / Đăng ký

- Không đổi bố cục desktop/tablet. Mobile: xem mục 6, 7.

## 6. Nhập liệu trên mobile

Chỉ áp dụng ở chỗ có ô nhập (người dùng chốt): đăng nhập, đăng ký, ô tạo playlist và đổi tên playlist ở Thư viện, hộp thêm/sửa bài (`SongDialog`).

- Chữ trong ô nhập **16px** trên mobile (iOS không tự phóng to).
- Khung trang dùng **`dvh`** thay cho `h-screen`/`min-h-screen` ở `AppShell` và trang đăng nhập/đăng ký; thêm `interactive-widget=resizes-content` vào thẻ `viewport` trong `index.html`.
- Khi focus một ô: ô đó tự cuộn vào giữa vùng còn thấy (`scrollIntoView({ block: "center" })`).
- Khi đang gõ ở trang có notch/dock/Music Layer: các phần nổi đó ẩn tạm để nhường chỗ (tui chọn: ẩn khi `focusin` vào ô nhập, hiện lại khi `focusout`).
- **Hộp thêm bài trên mobile:** tấm trượt từ dưới lên, cao tối đa vùng còn thấy, cuộn được bên trong; hàng nút "Huỷ / Thêm vào playlist" dính ở đáy tấm (luôn nằm ngay trên bàn phím).
- Kiểu bàn phím đúng ô: link YouTube `type="url"` `inputMode="url"`; tên đăng nhập `autoCapitalize="none"` `autoCorrect="off"` `spellCheck={false}`; `enterKeyHint` "next" cho ô chưa phải cuối, "done"/"go" cho ô cuối.

## 7. Bỏ bớt trên mobile (tui đề xuất, người dùng đồng ý)

- Mascot bay ở trang đăng nhập/đăng ký (dễ che form khi bàn phím hiện).
- Mascot cạnh đĩa ở `/listen`.
- Chữ chìm "PLAYLISTS", "QUEUE".
- Các đốm màu mờ trang trí ở nền `AppShell`.
- Dải bìa trước/sau trong dock (chỉ giữ bìa đang phát).

Các phần này **chỉ ẩn ở mobile**, desktop/tablet giữ nguyên.

## Không làm

- Notch có bài đang phát / nở thành bộ điều khiển; bỏ Music Layer (đợt sau).
- Trang đầu (`/`) và trang 404: không đổi trừ khi tràn ngang (kiểm và sửa tràn nếu có).
- Đổi màu, font, chuyển động ngoài những gì bố cục mới cần.
- `src/app/**` (Redux), backend.
- Ba điểm nhỏ còn hoãn từ giai đoạn refactor.

## Điều không được xảy ra

- Ở bất kỳ trang nào, cỡ 320–1920px: trang tràn ngang (`scrollWidth > innerWidth`).
- Tên bài ở `/listen` bị notch che ở bất kỳ cỡ nào.
- Mất thanh âm lượng khi màn thấp (vd. 1440×600, hoặc zoom 200%).
- Trên mobile, bàn phím che mất ô đang gõ hoặc nút gửi.
- Kéo cuộn hàng chờ trên mobile bị nhận nhầm thành kéo đổi thứ tự.
- Mất điều hướng hay đăng xuất khi bỏ header/rail.

## Để người làm tự quyết

- Cách chia component (vd. `Notch.jsx` + `AccountMenu.jsx`; giữ một `VolumeSlider` có hướng hay tách).
- Giá trị Tailwind cụ thể (lề, bo góc, cỡ chữ) miễn khớp kính v2 hiện có và các con số đã ghi ở trên.
- Đường cong co giãn của đĩa và cỡ chữ tên bài (vd. `clamp()`), miễn đạt mục 5.

## Xong khi

- Đo ở 375×812, 768×1024, 1024×768, 1440×900, 1920×1080 và 1440×600: không trang nào tràn ngang; ảnh chụp các trang trong app ở 3 cỡ máy khớp mục 5.
- Thử nhập liệu ở 375×812 có giả lập bàn phím (thu chiều cao còn ~450px): ô đang gõ và nút gửi đều thấy.
- `npm test`, `npm run build` qua; lint không lỗi mới.
