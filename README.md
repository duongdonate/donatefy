# DONATEFY

## Giới thiệu

Đây là frontend của ứng dụng Spotify Clone, được xây dựng bằng React. Ứng dụng cho phép người dùng duyệt, tìm kiếm và phát nhạc trực tiếp trên trình duyệt. Ứng dụng sử dụng các link YouTube được cung cấp từ backend để phát nhạc.

## Tính năng

- **Music Player**: Phát, tạm dừng và điều khiển phát nhạc bằng các link YouTube.
- **Playlist Management**: Tạo, xem và quản lý playlist.
- **User Authentication**: Đăng ký, đăng nhập và quản lý phiên người dùng.
- **Theming**: Chuyển đổi giữa chế độ sáng và tối.

## Cấu trúc dự án

```
└── 📁src
    └── 📁app
    └── 📁assets
    └── 📁components
    └── 📁contexts
    └── 📁hooks
    └── 📁layouts
    └── 📁pages
        ├── HomePage.jsx
        ├── PlaylistPage.jsx
    └── 📁routes
        ├── AppRouter.jsx
    └── 📁services
        └── 📁api
            ├── playlistService.js
            ├── songService.js
            ├── userService.js
        ├── axiosClient.js
        ├── axiosUpload.js
    └── 📁utils
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
```

## Yêu cầu

- Node.js (v16 hoặc cao hơn)
- npm hoặc yarn

## Công nghệ sử dụng

- React: Xây dựng giao diện người dùng.
- Redux Toolkit: Quản lý state.
- Axios: Gửi các yêu cầu API.
- React Router: Xử lý điều hướng

## Tích hợp Backend

- Frontend giao tiếp với backend để lấy các link YouTube phục vụ phát nhạc.
- Backend sử dụng Express, Node.js, cơ sở dữ liệu MongoDB
- Cơ chế giao tiếp: RESTful API

> Link github Backend: https://github.com/duongdonate/donatefy-backend.
