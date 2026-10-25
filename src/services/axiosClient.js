import axios from "axios";
import { getAccessToken, refreshOnce, expireSession } from "./authSession.js";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // timeout 10s
  withCredentials: true,
});

export const refreshAccessToken = () =>
  refreshOnce(() =>
    axios
      .post(`${axiosClient.defaults.baseURL}/api/auth/refresh`, null, { withCredentials: true })
      .then((r) => r.data.access_token)
  );

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data, // trả về data gọn lẹ
  async (error) => {
    const config = error.config;
    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !config.url?.includes("/api/auth/")
    ) {
      config._retried = true;
      try {
        await refreshAccessToken();
      } catch {
        expireSession();
        return Promise.reject(error.response.data);
      }
      return axiosClient(config);
    }
    if (error.response) {
      console.error("API Error:", error.response);
    } else {
      console.error("Network Error:", error);
    }
    return error.response
      ? Promise.reject(error.response.data)
      : Promise.reject(error);
  }
);

export default axiosClient;
