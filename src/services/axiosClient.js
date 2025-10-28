import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // timeout 10s
});

// // 🛠️ Request interceptor
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// 🛠️ Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data, // trả về data gọn lẹ
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response);
      // Ví dụ: nếu token hết hạn
      if (error.response.status === 401) {
        // Có thể redirect tới login
        // window.location.href = "/login";
      }
    } else {
      console.error("Network Error:", error);
    }
    return error.response
      ? Promise.reject(error.response.data)
      : Promise.reject(error);
  }
);

export default axiosClient;
