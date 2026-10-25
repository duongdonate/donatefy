import axios from "axios";
import { getAccessToken } from "./authSession.js";

const axiosUpload = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Replace with your API base URL
  timeout: 60000, // 60 seconds timeout for uploads
  withCredentials: true,
});

// Add a request interceptor
axiosUpload.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosUpload.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

export default axiosUpload;
